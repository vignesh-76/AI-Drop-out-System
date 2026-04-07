import fastapi
import fastapi.middleware.cors
from pydantic import BaseModel
import json
import os
import sqlite3
from datetime import datetime
from typing import Optional, List
import random
from fastapi import UploadFile, File, Depends, HTTPException, status, Header
import csv
import io
from fastapi.middleware.cors import CORSMiddleware

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from auth import (
    hash_password, verify_password, 
    create_access_token, create_refresh_token, 
    decode_token, create_password_reset_token,
    decode_password_reset_token
)
from models import (
    SignUpRequest, SignInRequest, PasswordResetRequest,
    PasswordResetConfirm, TokenResponse, MentorResponse,
    RefreshTokenRequest, RiskDetails, Recommendation, 
    CounselorAssignment, FollowUp, HighRiskStudent, 
    StudentFullProfile, RiskReason, StudentTokenResponse,
    StudentResponse, StudentProfileResponse, StudentSignUpRequest,
    StudentSignInRequest, StudentAnalyticsResponse, StreamAnalyticsResponse
)
from risk_classifier import classify_student_risk

app = fastapi.FastAPI()
app.add_middleware(
    fastapi.middleware.cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get current mentor
async def get_current_mentor(authorization: Optional[str] = Header(None)) -> dict:
    """Extract and validate JWT token from request."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token")
    
    token = authorization.replace("Bearer ", "", 1)
    payload = decode_token(token)
    mentor_id = payload.get("mentor_id")
    email = payload.get("email")
    if not mentor_id or not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return {"mentor_id": mentor_id, "email": email, "role": payload.get("role")}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "edupulse.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database only if it doesn't exist."""
    db_exists = os.path.exists(DB_PATH)
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Mentors table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mentors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT DEFAULT 'mentor',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Students table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                roll_no TEXT,
                department TEXT,
                attendance REAL NOT NULL,
                subject1_marks REAL NOT NULL DEFAULT 0,
                subject2_marks REAL NOT NULL DEFAULT 0,
                subject3_marks REAL NOT NULL DEFAULT 0,
                subject4_marks REAL NOT NULL DEFAULT 0,
                subject5_marks REAL NOT NULL DEFAULT 0,
                fees_pending REAL NOT NULL,
                risk_level TEXT,
                confidence REAL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER,
                student_name TEXT,
                risk_level TEXT,
                reason TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                read INTEGER DEFAULT 0
            )
        """)
        
        # Recommendations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                action_type TEXT NOT NULL,
                description TEXT NOT NULL,
                priority TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        """)
        
        # Counselor assignments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS counselor_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                mentor_id INTEGER NOT NULL,
                assigned_date TEXT DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                status TEXT DEFAULT 'active',
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (mentor_id) REFERENCES mentors(id)
            )
        """)
        
        # Follow-ups table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS follow_ups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                recommendation_id INTEGER,
                action_description TEXT NOT NULL,
                due_date TEXT,
                status TEXT DEFAULT 'pending',
                completed_date TEXT,
                notes TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id),
                FOREIGN KEY (recommendation_id) REFERENCES recommendations(id)
            )
        """)
        
        # Students authentication table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS students_auth (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL UNIQUE,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(id)
            )
        """)
        
        conn.commit()
        conn.close()
        return not db_exists  # Return True if database was newly created
    except Exception as e:
        print(f"[ERROR] Error initializing database: {str(e)}")
        raise


def seed_default_mentor():
    """Create a default mentor account when database is first initialized."""
    default_email = os.getenv("DEFAULT_MENTOR_EMAIL", "mentor@example.com")
    default_full_name = os.getenv("DEFAULT_MENTOR_FULL_NAME", "Default Mentor")
    default_role = os.getenv("DEFAULT_MENTOR_ROLE", "mentor")
    default_password = os.getenv("DEFAULT_MENTOR_PASSWORD", "Password123")

    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if default mentor exists
        cursor.execute("SELECT id FROM mentors WHERE email = ?", (default_email,))
        if not cursor.fetchone():
            password_hash = hash_password(default_password)
            cursor.execute(
                """INSERT INTO mentors (email, password_hash, full_name, role)
                   VALUES (?, ?, ?, ?)""",
                (default_email, password_hash, default_full_name, default_role)
            )
            conn.commit()
            print(f"[OK] Default mentor created: {default_email}")
        else:
            print(f"[OK] Default mentor already exists: {default_email}")
        
        conn.close()
    except Exception as e:
        print(f"[ERROR] Error seeding default mentor: {str(e)}")


is_new_db = init_db()
print("[OK] Database initialized")
if is_new_db:
    seed_default_mentor()
    print("[OK] Default mentor seeded")
else:
    print("[OK] Using existing database")
print("[OK] Authentication system ready")


class StudentInput(BaseModel):
    name: str
    roll_no: Optional[str] = None
    department: Optional[str] = None
    attendance: float
    subject1_marks: float
    subject2_marks: float
    subject3_marks: float
    subject4_marks: float
    subject5_marks: float
    fees_pending: float


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    roll_no: Optional[str] = None
    department: Optional[str] = None
    attendance: Optional[float] = None
    subject1_marks: Optional[float] = None
    subject2_marks: Optional[float] = None
    subject3_marks: Optional[float] = None
    subject4_marks: Optional[float] = None
    subject5_marks: Optional[float] = None
    fees_pending: Optional[float] = None


def predict_risk(attendance: float, subject1_marks: float, subject2_marks: float, subject3_marks: float, subject4_marks: float, subject5_marks: float, fees_pending: float) -> tuple[str, float, str]:
    """
    Simple logistic regression-inspired risk prediction.
    Weights are pre-trained based on typical dropout patterns.
    Uses average marks from 5 subjects.
    """
    # Calculate average marks
    avg_marks = (subject1_marks + subject2_marks + subject3_marks + subject4_marks + subject5_marks) / 5
    
    # Normalize inputs (0-100 scale)
    norm_attendance = max(0, min(100, attendance)) / 100
    norm_marks = max(0, min(100, avg_marks)) / 100
    norm_fees = max(0, min(100, fees_pending)) / 100
    
    # Pre-trained weights (simulating logistic regression)
    # Higher attendance and marks reduce risk, higher fees increase risk
    w_attendance = -2.5
    w_marks = -2.0
    w_fees = 1.8
    bias = 3.0
    
    # Calculate risk score
    z = bias + (w_attendance * norm_attendance) + (w_marks * norm_marks) + (w_fees * norm_fees)
    
    # Sigmoid function
    import math
    risk_probability = 1 / (1 + math.exp(-z))
    
    # Determine risk level
    if risk_probability >= 0.7:
        risk_level = "high"
        reasons = []
        if attendance < 60:
            reasons.append("low attendance")
        if avg_marks < 50:
            reasons.append("low marks")
        if fees_pending > 50:
            reasons.append("high pending fees")
        reason = ", ".join(reasons) if reasons else "multiple risk factors"
    elif risk_probability >= 0.4:
        risk_level = "medium"
        reasons = []
        if attendance < 75:
            reasons.append("below average attendance")
        if avg_marks < 65:
            reasons.append("below average marks")
        if fees_pending > 30:
            reasons.append("pending fees")
        reason = ", ".join(reasons) if reasons else "moderate risk factors"
    else:
        risk_level = "low"
        reason = "good academic standing"
    
    confidence = round(risk_probability * 100, 1) if risk_level == "high" else round((1 - risk_probability) * 100, 1)
    
    return risk_level, confidence, reason


def calculate_priority_score(attendance: float, avg_marks: float, fees_pending: float, risk_level: str) -> int:
    """
    Calculate priority score (0-100) for ranking students by intervention urgency.
    """
    score = 0
    
    # Risk level base (0-40 points) - weighted heavily
    if risk_level == "high":
        score += 40
    elif risk_level == "medium":
        score += 20
    else:
        score += 5
    
    # Attendance factor (0-30 points)
    if attendance < 50:
        score += 30
    elif attendance < 70:
        score += 20
    elif attendance < 85:
        score += 10
    
    # Marks factor (0-20 points)
    if avg_marks < 40:
        score += 20
    elif avg_marks < 60:
        score += 15
    elif avg_marks < 75:
        score += 8
    
    # Fees factor (0-10 points)
    if fees_pending > 50:
        score += 10
    elif fees_pending > 20:
        score += 5
    
    return min(100, score)  # Cap at 100


def generate_risk_reasons(attendance: float, avg_marks: float, fees_pending: float) -> List[dict]:
    """
    Generate detailed risk factors for a student.
    """
    reasons = []
    
    # Attendance risk
    if attendance < 60:
        reasons.append({
            "factor": "low_attendance",
            "value": attendance,
            "threshold": 75,
            "severity": "high"
        })
    elif attendance < 75:
        reasons.append({
            "factor": "low_attendance",
            "value": attendance,
            "threshold": 75,
            "severity": "medium"
        })
    
    # Marks risk
    if avg_marks < 50:
        reasons.append({
            "factor": "low_marks",
            "value": avg_marks,
            "threshold": 60,
            "severity": "high"
        })
    elif avg_marks < 65:
        reasons.append({
            "factor": "low_marks",
            "value": avg_marks,
            "threshold": 65,
            "severity": "medium"
        })
    
    # Fees risk
    if fees_pending > 50:
        reasons.append({
            "factor": "pending_fees",
            "value": fees_pending,
            "threshold": 20,
            "severity": "high"
        })
    elif fees_pending > 20:
        reasons.append({
            "factor": "pending_fees",
            "value": fees_pending,
            "threshold": 20,
            "severity": "medium"
        })
    
    return reasons


def generate_recommendations(attendance: float, avg_marks: float, fees_pending: float, risk_level: str, student_id: int) -> list[dict]:
    """
    Generate personalized recommendations for a student based on risk factors.
    """
    recommendations = []
    
    # High attendance concern
    if attendance < 70:
        recommendations.append({
            "action_type": "attendance_support",
            "description": f"Student has low attendance ({attendance}%). Schedule meeting to discuss attendance challenges and create attendance improvement plan.",
            "priority": "high" if attendance < 50 else "medium"
        })
    
    # High academic concern
    if avg_marks < 50:
        recommendations.append({
            "action_type": "remedial_classes",
            "description": f"Student's average marks are very low ({avg_marks:.1f}). Enroll in remedial classes and arrange subject-specific tutoring.",
            "priority": "high"
        })
    elif avg_marks < 65:
        recommendations.append({
            "action_type": "tutoring_support",
            "description": f"Student needs academic support. Average marks: {avg_marks:.1f}. Consider peer tutoring or study groups.",
            "priority": "medium"
        })
    
    # Fee payment concern
    if fees_pending > 50:
        recommendations.append({
            "action_type": "fee_reminder",
            "description": f"Student has pending fees of ₹{fees_pending}. Send fee payment reminder and offer payment plan if needed.",
            "priority": "high"
        })
    elif fees_pending > 0:
        recommendations.append({
            "action_type": "fee_reminder",
            "description": f"Student has outstanding fees. Follow up on payment status.",
            "priority": "medium"
        })
    
    # General counseling for high risk
    if risk_level == "high":
        recommendations.append({
            "action_type": "counseling",
            "description": "High-risk student. Schedule counseling session to understand personal challenges and provide emotional support.",
            "priority": "high"
        })
    
    return recommendations


@app.get("/health")
async def health():
    """Health check endpoint with database verification."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM mentors")
        mentor_count = cursor.fetchone()[0]
        conn.close()
        return {
            "status": "ok",
            "database": "connected",
            "mentors_count": mentor_count
        }
    except Exception as e:
        print(f"Health check error: {str(e)}")
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e)
        }


@app.get("/debug/mentors")
async def debug_get_mentors():
    """Debug endpoint - list all mentors (remove in production)."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id, email, full_name, role FROM mentors")
        rows = cursor.fetchall()
        conn.close()
        return {
            "total": len(rows),
            "mentors": [
                {
                    "id": row["id"],
                    "email": row["email"],
                    "full_name": row["full_name"],
                    "role": row["role"]
                }
                for row in rows
            ]
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/students")
async def get_students(risk_filter: Optional[str] = None, search: Optional[str] = None):
    conn = get_db()
    cursor = conn.cursor()
    
    query = "SELECT * FROM students"
    params = []
    conditions = []
    
    if risk_filter and risk_filter != "all":
        conditions.append("risk_level = ?")
        params.append(risk_filter)
    
    if search:
        conditions.append("name LIKE ?")
        params.append(f"%{search}%")
    
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    
    query += " ORDER BY created_at DESC"
    
    cursor.execute(query, params)
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"students": students}


@app.get("/students/{student_id}")
async def get_student(student_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = cursor.fetchone()
    conn.close()
    
    if not student:
        raise fastapi.HTTPException(status_code=404, detail="Student not found")
    
    return dict(student)


@app.post("/students")
async def create_student(student: StudentInput):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check for duplicate roll_no if provided
    if student.roll_no:
        cursor.execute("SELECT id FROM students WHERE roll_no = ?", (student.roll_no,))
        if cursor.fetchone():
            conn.close()
            raise fastapi.HTTPException(status_code=400, detail=f"Roll number '{student.roll_no}' already exists")
    
    risk_level, confidence, reason = predict_risk(student.attendance, student.subject1_marks, student.subject2_marks, student.subject3_marks, student.subject4_marks, student.subject5_marks, student.fees_pending)
    
    cursor.execute(
        """INSERT INTO students (name, roll_no, department, attendance, subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks, fees_pending, risk_level, confidence)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (student.name, student.roll_no, student.department, student.attendance, student.subject1_marks, student.subject2_marks, student.subject3_marks, student.subject4_marks, student.subject5_marks, student.fees_pending, risk_level, confidence)
    )
    student_id = cursor.lastrowid
    
    # Create alert for high risk students
    if risk_level == "high":
        cursor.execute(
            """INSERT INTO alerts (student_id, student_name, risk_level, reason)
               VALUES (?, ?, ?, ?)""",
            (student_id, student.name, risk_level, reason)
        )
    
    conn.commit()
    conn.close()
    
    return {
        "id": student_id,
        "name": student.name,
        "roll_no": student.roll_no,
        "department": student.department,
        "attendance": student.attendance,
        "subject1_marks": student.subject1_marks,
        "subject2_marks": student.subject2_marks,
        "subject3_marks": student.subject3_marks,
        "subject4_marks": student.subject4_marks,
        "subject5_marks": student.subject5_marks,
        "fees_pending": student.fees_pending,
        "risk_level": risk_level,
        "confidence": confidence,
        "reason": reason
    }


@app.put("/students/{student_id}")
async def update_student(student_id: int, student: StudentUpdate):
    conn = get_db()
    cursor = conn.cursor()
    
    # Get current student
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    existing = cursor.fetchone()
    
    if not existing:
        conn.close()
        raise fastapi.HTTPException(status_code=404, detail="Student not found")
    
    existing = dict(existing)
    
    # Update fields
    name = student.name if student.name is not None else existing["name"]
    roll_no = student.roll_no if student.roll_no is not None else existing.get("roll_no")
    department = student.department if student.department is not None else existing.get("department")
    
    # Check for duplicate roll_no (if provided and different from current)
    if roll_no and roll_no != existing.get("roll_no"):
        cursor.execute("SELECT id FROM students WHERE roll_no = ? AND id != ?", (roll_no, student_id))
        if cursor.fetchone():
            conn.close()
            raise fastapi.HTTPException(status_code=400, detail=f"Roll number {roll_no} already exists")
    attendance = student.attendance if student.attendance is not None else existing["attendance"]
    subject1_marks = student.subject1_marks if student.subject1_marks is not None else existing.get("subject1_marks", 0)
    subject2_marks = student.subject2_marks if student.subject2_marks is not None else existing.get("subject2_marks", 0)
    subject3_marks = student.subject3_marks if student.subject3_marks is not None else existing.get("subject3_marks", 0)
    subject4_marks = student.subject4_marks if student.subject4_marks is not None else existing.get("subject4_marks", 0)
    subject5_marks = student.subject5_marks if student.subject5_marks is not None else existing.get("subject5_marks", 0)
    fees_pending = student.fees_pending if student.fees_pending is not None else existing["fees_pending"]
    
    # Recalculate risk
    risk_level, confidence, reason = predict_risk(attendance, subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks, fees_pending)
    
    cursor.execute(
        """UPDATE students SET name = ?, roll_no = ?, department = ?, attendance = ?, subject1_marks = ?, subject2_marks = ?, subject3_marks = ?, subject4_marks = ?, subject5_marks = ?, fees_pending = ?, risk_level = ?, confidence = ?
           WHERE id = ?""",
        (name, roll_no, department, attendance, subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks, fees_pending, risk_level, confidence, student_id)
    )
    
    # Create alert if newly high risk
    if risk_level == "high" and existing.get("risk_level") != "high":
        cursor.execute(
            """INSERT INTO alerts (student_id, student_name, risk_level, reason)
               VALUES (?, ?, ?, ?)""",
            (student_id, name, risk_level, reason)
        )
    
    conn.commit()
    conn.close()
    
    return {
        "id": student_id,
        "name": name,
        "roll_no": roll_no,
        "department": department,
        "attendance": attendance,
        "subject1_marks": subject1_marks,
        "subject2_marks": subject2_marks,
        "subject3_marks": subject3_marks,
        "subject4_marks": subject4_marks,
        "subject5_marks": subject5_marks,
        "fees_pending": fees_pending,
        "risk_level": risk_level,
        "confidence": confidence,
        "reason": reason
    }


@app.delete("/students/{student_id}")
async def delete_student(student_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
    cursor.execute("DELETE FROM alerts WHERE student_id = ?", (student_id,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.delete("/students")
async def delete_all_students():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM students")
    cursor.execute("DELETE FROM alerts")
    conn.commit()
    conn.close()
    return {"success": True, "message": "All students deleted"}


@app.get("/alerts")
async def get_alerts(unread_only: bool = False):
    conn = get_db()
    cursor = conn.cursor()
    
    if unread_only:
        cursor.execute("SELECT * FROM alerts WHERE read = 0 ORDER BY created_at DESC")
    else:
        cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC")
    
    alerts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"alerts": alerts}


@app.put("/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET read = 1 WHERE id = ?", (alert_id,))
    conn.commit()
    conn.close()
    return {"success": True}


@app.put("/alerts/read-all")
async def mark_all_alerts_read():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE alerts SET read = 1")
    conn.commit()
    conn.close()
    return {"success": True}


@app.get("/analytics")
async def get_analytics():
    conn = get_db()
    cursor = conn.cursor()
    
    # Risk distribution
    cursor.execute("SELECT risk_level, COUNT(*) as count FROM students GROUP BY risk_level")
    risk_distribution = {row["risk_level"]: row["count"] for row in cursor.fetchall()}
    
    # Total students
    cursor.execute("SELECT COUNT(*) as total FROM students")
    total_students = cursor.fetchone()["total"]
    
    # Average metrics - calculate average marks from 5 subjects
    cursor.execute("""
        SELECT 
            AVG(attendance) as avg_attendance, 
            AVG((subject1_marks + subject2_marks + subject3_marks + subject4_marks + subject5_marks) / 5) as avg_marks, 
            AVG(fees_pending) as avg_fees 
        FROM students
    """)
    averages = cursor.fetchone()
    
    # Recent high risk count
    cursor.execute("SELECT COUNT(*) as count FROM alerts WHERE read = 0")
    unread_alerts = cursor.fetchone()["count"]
    
    # Subject-wise averages
    cursor.execute("""
        SELECT 
            AVG(subject1_marks) as subject1_avg,
            AVG(subject2_marks) as subject2_avg,
            AVG(subject3_marks) as subject3_avg,
            AVG(subject4_marks) as subject4_avg,
            AVG(subject5_marks) as subject5_avg
        FROM students
    """)
    subject_avgs = cursor.fetchone()
    
    conn.close()
    
    return {
        "risk_distribution": risk_distribution,
        "total_students": total_students,
        "avg_attendance": round(averages["avg_attendance"] or 0, 1),
        "avg_marks": round(averages["avg_marks"] or 0, 1),
        "avg_fees": round(averages["avg_fees"] or 0, 1),
        "unread_alerts": unread_alerts,
        "subject_averages": {
            "subject1": round(subject_avgs["subject1_avg"] or 0, 1),
            "subject2": round(subject_avgs["subject2_avg"] or 0, 1),
            "subject3": round(subject_avgs["subject3_avg"] or 0, 1),
            "subject4": round(subject_avgs["subject4_avg"] or 0, 1),
            "subject5": round(subject_avgs["subject5_avg"] or 0, 1)
        }
    }


@app.post("/upload")
async def upload_csv(file: fastapi.UploadFile):
    import csv
    import io
    
    try:
        content = await file.read()
        decoded = content.decode("utf-8")
        
        # First, try to read as CSV to detect if it has headers
        lines = decoded.strip().split('\n')
        if not lines:
            return {"error": "CSV file is empty", "imported": 0, "students": []}
        
        # Check if first row looks like headers
        first_line = lines[0].lower()
        has_headers = ('name' in first_line or 'roll' in first_line or 'department' in first_line or 
                      'attendance' in first_line or 'subject' in first_line or 'fees' in first_line)
        
        conn = get_db()
        cursor = conn.cursor()
        results = []
        error_count = 0
        
        if has_headers:
            # Process CSV with headers
            reader = csv.DictReader(io.StringIO(decoded))
            start_row = 2
            
            for row_num, row in enumerate(reader, start=start_row):
                try:
                    name = row.get("name", row.get("Name", "")).strip()
                    roll_no = row.get("roll_no", row.get("Roll No", row.get("register_number", ""))).strip()
                    department = row.get("department", row.get("Department", "")).strip()
                    
                    try:
                        attendance = float(row.get("attendance", row.get("Attendance", 0)) or 0)
                        subject1_marks = float(row.get("subject1_marks", row.get("Subject1", row.get("Subject1 Marks", 0))) or 0)
                        subject2_marks = float(row.get("subject2_marks", row.get("Subject2", row.get("Subject2 Marks", 0))) or 0)
                        subject3_marks = float(row.get("subject3_marks", row.get("Subject3", row.get("Subject3 Marks", 0))) or 0)
                        subject4_marks = float(row.get("subject4_marks", row.get("Subject4", row.get("Subject4 Marks", 0))) or 0)
                        subject5_marks = float(row.get("subject5_marks", row.get("Subject5", row.get("Subject5 Marks", 0))) or 0)
                        fees_pending = float(row.get("fees_pending", row.get("Fees Pending", row.get("fees", 0))) or 0)
                    except ValueError:
                        error_count += 1
                        continue
                    
                    if not name:
                        error_count += 1
                        continue
                    
                    # Check for duplicate roll_no if provided
                    if roll_no:
                        cursor.execute("SELECT id FROM students WHERE roll_no = ?", (roll_no,))
                        if cursor.fetchone():
                            error_count += 1
                            continue
                    
                    # Calculate average marks
                    avg_marks = (subject1_marks + subject2_marks + subject3_marks + subject4_marks + subject5_marks) / 5
                    
                    # Classify risk using new risk_classifier module
                    risk_result = classify_student_risk(
                        attendance_percentage=attendance,
                        average_marks=avg_marks,
                        fees_pending_percentage=fees_pending
                    )
                    
                    risk_level = risk_result.risk_level.lower()  # Convert to lowercase for DB consistency
                    confidence = risk_result.confidence_score
                    
                    cursor.execute(
                        """INSERT INTO students (name, roll_no, department, attendance, subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks, fees_pending, risk_level, confidence)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (name, roll_no, department, attendance, subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks, fees_pending, risk_level, confidence)
                    )
                    student_id = cursor.lastrowid
                    
                    if risk_level == "high":
                        cursor.execute(
                            """INSERT INTO alerts (student_id, student_name, risk_level, reason)
                               VALUES (?, ?, ?, ?)""",
                            (student_id, name, risk_level, ", ".join(risk_result.critical_factors))
                        )
                    
                    results.append({
                        "id": student_id,
                        "name": name,
                        "roll_no": roll_no,
                        "department": department,
                        "risk_level": risk_level,
                        "confidence": confidence
                    })
                except Exception as e:
                    error_count += 1
                    continue
        else:
            # Process CSV without headers - assume format: name, roll_no, department, attendance, subject1, subject2, subject3, subject4, subject5, fees_pending
            reader = csv.reader(io.StringIO(decoded))
            
            for row_num, row in enumerate(reader, start=1):
                try:
                    if len(row) < 10:  # Minimum required fields
                        error_count += 1
                        continue
                    
                    # Map columns by position
                    name = str(row[0]).strip() if len(row) > 0 else ""
                    roll_no = str(row[1]).strip() if len(row) > 1 else ""
                    department = str(row[2]).strip() if len(row) > 2 else ""
                    
                    try:
                        attendance = float(row[3]) if len(row) > 3 and row[3] else 0
                        subject1_marks = float(row[4]) if len(row) > 4 and row[4] else 0
                        subject2_marks = float(row[5]) if len(row) > 5 and row[5] else 0
                        subject3_marks = float(row[6]) if len(row) > 6 and row[6] else 0
                        subject4_marks = float(row[7]) if len(row) > 7 and row[7] else 0
                        subject5_marks = float(row[8]) if len(row) > 8 and row[8] else 0
                        fees_pending = float(row[9]) if len(row) > 9 and row[9] else 0
                    except (ValueError, IndexError):
                        error_count += 1
                        continue
                    
                    if not name:
                        error_count += 1
                        continue
                    
                    # Check for duplicate roll_no if provided
                    if roll_no:
                        cursor.execute("SELECT id FROM students WHERE roll_no = ?", (roll_no,))
                        if cursor.fetchone():
                            error_count += 1
                            continue
                    
                    # Calculate average marks
                    avg_marks = (subject1_marks + subject2_marks + subject3_marks + subject4_marks + subject5_marks) / 5
                    
                    # Classify risk using new risk_classifier module
                    risk_result = classify_student_risk(
                        attendance_percentage=attendance,
                        average_marks=avg_marks,
                        fees_pending_percentage=fees_pending
                    )
                    
                    risk_level = risk_result.risk_level.lower()
                    confidence = risk_result.confidence_score
                    
                    cursor.execute(
                        """INSERT INTO students (name, roll_no, department, attendance, subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks, fees_pending, risk_level, confidence)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (name, roll_no, department, attendance, subject1_marks, subject2_marks, subject3_marks, subject4_marks, subject5_marks, fees_pending, risk_level, confidence)
                    )
                    student_id = cursor.lastrowid
                    
                    if risk_level == "high":
                        cursor.execute(
                            """INSERT INTO alerts (student_id, student_name, risk_level, reason)
                               VALUES (?, ?, ?, ?)""",
                            (student_id, name, risk_level, ", ".join(risk_result.critical_factors))
                        )
                    
                    results.append({
                        "id": student_id,
                        "name": name,
                        "roll_no": roll_no,
                        "department": department,
                        "risk_level": risk_level,
                        "confidence": confidence
                    })
                except Exception as e:
                    error_count += 1
                    continue
        
        conn.commit()
        conn.close()
        
        return {
            "imported": len(results),
            "errors": error_count,
            "students": results,
            "message": f"Successfully imported {len(results)} students" + (f" ({error_count} rows skipped due to errors)" if error_count > 0 else "")
        }
    except Exception as e:
        print(f"Upload error: {str(e)}")
        return {"error": str(e), "imported": 0, "students": [], "message": f"Upload failed: {str(e)}"}


@app.get("/export")
async def export_students():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM students ORDER BY created_at DESC")
    students = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"students": students}


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/auth/signup", response_model=TokenResponse)
async def signup(request: SignUpRequest):
    """Register a new mentor account."""
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute("SELECT id FROM mentors WHERE email = ?", (request.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password and create mentor
        password_hash = hash_password(request.password)
        cursor.execute(
            """INSERT INTO mentors (email, password_hash, full_name, role)
               VALUES (?, ?, ?, ?)""",
            (request.email, password_hash, request.full_name, request.role)
        )
        mentor_id = cursor.lastrowid
        conn.commit()
        
        # Generate tokens
        access_token = create_access_token({
            "mentor_id": mentor_id,
            "email": request.email,
            "role": request.role
        })
        refresh_token = create_refresh_token({
            "mentor_id": mentor_id,
            "email": request.email
        })
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            mentor_id=mentor_id,
            email=request.email,
            full_name=request.full_name,
            role=request.role
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create account: {str(e)}"
        )
    finally:
        if conn:
            conn.close()


@app.post("/auth/signin", response_model=TokenResponse)
async def signin(request: SignInRequest):
    """Authenticate mentor and return JWT tokens."""
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Find mentor by email
        cursor.execute(
            "SELECT id, password_hash, full_name, role FROM mentors WHERE email = ?",
            (request.email,)
        )
        mentor = cursor.fetchone()
        
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        mentor_dict = dict(mentor)
        if not verify_password(request.password, mentor_dict["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        mentor_id = mentor_dict["id"]
        role = mentor_dict["role"]
        
        # Generate tokens
        access_token = create_access_token({
            "mentor_id": mentor_id,
            "email": request.email,
            "role": role
        })
        refresh_token = create_refresh_token({
            "mentor_id": mentor_id,
            "email": request.email
        })
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            mentor_id=mentor_id,
            email=request.email,
            full_name=mentor_dict["full_name"],
            role=role
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signin error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )
    finally:
        if conn:
            conn.close()


@app.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token using refresh token."""
    try:
        payload = decode_token(request.refresh_token)
        
        if payload.get("type") == "refresh":
            mentor_id = payload.get("mentor_id")
            email = payload.get("email")
            
            # Get mentor info
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT full_name, role FROM mentors WHERE id = ? AND email = ?",
                (mentor_id, email)
            )
            mentor = cursor.fetchone()
            conn.close()
            
            if not mentor:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Mentor not found"
                )
            
            mentor_dict = dict(mentor)
            role = mentor_dict["role"]
            
            # Generate new access token
            access_token = create_access_token({
                "mentor_id": mentor_id,
                "email": email,
                "role": role
            })
            
            return TokenResponse(
                access_token=access_token,
                refresh_token=request.refresh_token,
                mentor_id=mentor_id,
                email=email,
                full_name=mentor_dict["full_name"],
                role=role
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )


@app.get("/auth/me", response_model=MentorResponse)
async def get_current_mentor_info(current_mentor: dict = Depends(get_current_mentor)):
    """Get current authenticated mentor info."""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "SELECT id, email, full_name, role, created_at FROM mentors WHERE id = ?",
            (current_mentor["mentor_id"],)
        )
        mentor = cursor.fetchone()
        
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentor not found"
            )
        
        mentor_dict = dict(mentor)
        return MentorResponse(
            id=mentor_dict["id"],
            email=mentor_dict["email"],
            full_name=mentor_dict["full_name"],
            role=mentor_dict["role"],
            created_at=mentor_dict["created_at"]
        )
    finally:
        conn.close()


@app.post("/auth/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Send password reset token to email."""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Check if email exists
        cursor.execute("SELECT id FROM mentors WHERE email = ?", (request.email,))
        mentor = cursor.fetchone()
        
        if not mentor:
            # Don't reveal if email exists (security best practice)
            return {"message": "If email exists, reset link will be sent"}
        
        # Create reset token
        reset_token = create_password_reset_token(request.email)
        
        # In production, send email here with reset link
        # For now, return the token (frontend should handle this securely)
        return {
            "message": "Password reset link sent to email",
            "reset_token": reset_token  # Only for demo - in production, don't return token
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process password reset request"
        )
    finally:
        conn.close()


@app.post("/auth/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Reset password using reset token."""
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Validate reset token and get email
        email = decode_password_reset_token(request.token)
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired reset token"
            )
        
        # Hash new password
        password_hash = hash_password(request.new_password)
        
        # Update password
        cursor.execute(
            "UPDATE mentors SET password_hash = ? WHERE email = ?",
            (password_hash, email)
        )
        
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mentor not found"
            )
        
        conn.commit()
        return {"message": "Password reset successful"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )
    finally:
        conn.close()


# ============================================================================
# STUDENT AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/auth/student/signup", response_model=StudentTokenResponse)
async def student_signup(request: StudentSignUpRequest):
    """Register a new student account."""
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if student with this email already exists
        cursor.execute("SELECT id FROM students_auth WHERE email = ?", (request.email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if student record exists (from mentor import)
        cursor.execute(
            "SELECT id FROM students WHERE name = ?", 
            (request.name,)
        )
        student_record = cursor.fetchone()
        
        if not student_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student record not found. Please contact your mentor for registration."
            )
        
        student_id = student_record[0]
        password_hash = hash_password(request.password)
        
        # Create student auth record
        cursor.execute(
            """INSERT INTO students_auth (student_id, email, password_hash, role)
               VALUES (?, ?, ?, ?)""",
            (student_id, request.email, password_hash, "student")
        )
        
        conn.commit()
        
        # Create tokens
        access_token = create_access_token(data={
            "sub": request.email,
            "student_id": student_id,
            "role": "student"
        })
        refresh_token = create_refresh_token(data={
            "sub": request.email,
            "student_id": student_id,
            "role": "student"
        })
        
        # Get student details
        cursor.execute("SELECT name, roll_no, department FROM students WHERE id = ?", (student_id,))
        student = cursor.fetchone()
        
        return StudentTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            student_id=student_id,
            email=request.email,
            name=student[0],
            roll_no=student[1],
            department=student[2],
            role="student"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )
    finally:
        if conn:
            conn.close()


@app.post("/auth/student/signin", response_model=StudentTokenResponse)
async def student_signin(request: StudentSignInRequest):
    """Student login endpoint."""
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Find student by email
        cursor.execute(
            """SELECT sa.id, sa.student_id, sa.password_hash, s.name, s.roll_no, s.department 
               FROM students_auth sa
               JOIN students s ON sa.student_id = s.id
               WHERE sa.email = ?""",
            (request.email,)
        )
        student = cursor.fetchone()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(request.password, student[2]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        student_id = student[1]
        
        # Create tokens
        access_token = create_access_token(data={
            "sub": request.email,
            "student_id": student_id,
            "role": "student"
        })
        refresh_token = create_refresh_token(data={
            "sub": request.email,
            "student_id": student_id,
            "role": "student"
        })
        
        return StudentTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            student_id=student_id,
            email=request.email,
            name=student[3],
            roll_no=student[4],
            department=student[5],
            role="student"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )
    finally:
        if conn:
            conn.close()


@app.get("/auth/student/me", response_model=StudentResponse)
async def get_student_profile(authorization: Optional[str] = Header(None)):
    """Get current student profile."""
    conn = None
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header"
            )
        
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        student_id = payload.get("student_id")
        
        if not student_id or payload.get("role") != "student":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """SELECT s.id, s.name, sa.email, s.roll_no, s.department, s.created_at
               FROM students s
               JOIN students_auth sa ON s.id = sa.student_id
               WHERE s.id = ?""",
            (student_id,)
        )
        student = cursor.fetchone()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        return StudentResponse(
            id=student[0],
            name=student[1],
            email=student[2],
            roll_no=student[3],
            department=student[4],
            created_at=student[5]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )
    finally:
        if conn:
            conn.close()


@app.get("/auth/student/profile", response_model=StudentProfileResponse)
async def get_student_profile_full(authorization: Optional[str] = Header(None)):
    """Get complete student profile with academics."""
    conn = None
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header"
            )
        
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        student_id = payload.get("student_id")
        
        if not student_id or payload.get("role") != "student":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """SELECT s.id, s.name, sa.email, s.roll_no, s.department, s.attendance,
                      s.subject1_marks, s.subject2_marks, s.subject3_marks, s.subject4_marks,
                      s.subject5_marks, s.fees_pending, s.risk_level, s.confidence, s.created_at
               FROM students s
               JOIN students_auth sa ON s.id = sa.student_id
               WHERE s.id = ?""",
            (student_id,)
        )
        student = cursor.fetchone()
        
        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student not found"
            )
        
        # Calculate average marks
        marks = [student[6], student[7], student[8], student[9], student[10]]
        average_marks = sum(marks) / len(marks) if marks else 0
        
        # Get risk factors
        from risk_classifier import classify_student_risk
        risk_data = classify_student_risk(
            attendance_percentage=student[5],
            average_marks=average_marks,
            fees_pending_percentage=student[11]
        )
        
        risk_factors = [
            RiskReason(
                factor="attendance",
                value=student[5],
                threshold=75 if student[5] < 75 else 60,
                severity="high" if student[5] < 60 else "medium" if student[5] < 75 else "low"
            ),
            RiskReason(
                factor="marks",
                value=average_marks,
                threshold=60 if average_marks < 60 else 40,
                severity="high" if average_marks < 40 else "medium" if average_marks < 60 else "low"
            ),
            RiskReason(
                factor="fees",
                value=student[11],
                threshold=1 if student[11] > 0 else 0,
                severity="high" if student[11] == 100 else "medium" if student[11] > 0 else "low"
            )
        ]
        
        # Get recommendations
        recommendations = []
        
        return StudentProfileResponse(
            id=student[0],
            name=student[1],
            email=student[2],
            roll_no=student[3],
            department=student[4],
            attendance=student[5],
            subject1_marks=student[6],
            subject2_marks=student[7],
            subject3_marks=student[8],
            subject4_marks=student[9],
            subject5_marks=student[10],
            average_marks=average_marks,
            fees_pending=student[11],
            risk_level=student[12] or risk_data.risk_level,
            confidence=student[13] or risk_data.confidence_score,
            risk_factors=risk_factors,
            recommendations=recommendations,
            enrolled_date=student[14]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch profile"
        )
    finally:
        if conn:
            conn.close()


# ============================================================================
# RISK MANAGEMENT ENDPOINTS
# ============================================================================

@app.get("/students/{student_id}/risk-details")
async def get_risk_details(student_id: int):
    """Get detailed risk information for a student."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = dict(cursor.fetchone() or {})
    
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate priority score
    avg_marks = (student["subject1_marks"] + student["subject2_marks"] + student["subject3_marks"] + student["subject4_marks"] + student["subject5_marks"]) / 5
    priority_score = calculate_priority_score(student["attendance"], avg_marks, student["fees_pending"], student["risk_level"])
    
    # Get risk reasons
    risk_factors = generate_risk_reasons(student["attendance"], avg_marks, student["fees_pending"])
    
    # Get recommendations
    cursor.execute("SELECT * FROM recommendations WHERE student_id = ?", (student_id,))
    recommendations = [dict(row) for row in cursor.fetchall()]
    
    # Get assigned counselor
    cursor.execute("""
        SELECT ca.id, ca.mentor_id, m.full_name as mentor_name, ca.assigned_date, ca.notes, ca.status
        FROM counselor_assignments ca
        JOIN mentors m ON ca.mentor_id = m.id
        WHERE ca.student_id = ? AND ca.status = 'active'
        LIMIT 1
    """, (student_id,))
    counselor = cursor.fetchone()
    
    conn.close()
    
    # Build response
    reason_strings = [r["factor"].replace("_", " ").title() for r in risk_factors]
    
    return {
        "student_id": student_id,
        "name": student["name"],
        "risk_level": student["risk_level"],
        "confidence": student.get("confidence", 0),
        "priority_score": priority_score,
        "reasons": reason_strings,
        "risk_factors": risk_factors,
        "recommendations": recommendations,
        "counselor_assigned": dict(counselor) if counselor else None
    }


@app.post("/students/{student_id}/recommendations")
async def create_recommendations(student_id: int):
    """Generate and save recommendations for a student."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get student
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = dict(cursor.fetchone() or {})
    
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate average marks
    avg_marks = (student["subject1_marks"] + student["subject2_marks"] + student["subject3_marks"] + student["subject4_marks"] + student["subject5_marks"]) / 5
    
    # Generate recommendations
    recs = generate_recommendations(student["attendance"], avg_marks, student["fees_pending"], student["risk_level"], student_id)
    
    # Delete existing recommendations for this student
    cursor.execute("DELETE FROM recommendations WHERE student_id = ?", (student_id,))
    
    # Save new recommendations
    saved_recs = []
    for rec in recs:
        cursor.execute("""
            INSERT INTO recommendations (student_id, action_type, description, priority, status)
            VALUES (?, ?, ?, ?, 'pending')
        """, (student_id, rec["action_type"], rec["description"], rec["priority"]))
        
        saved_recs.append({
            "id": cursor.lastrowid,
            "student_id": student_id,
            "action_type": rec["action_type"],
            "description": rec["description"],
            "priority": rec["priority"],
            "status": "pending"
        })
    
    conn.commit()
    conn.close()
    
    return {"recommendations": saved_recs}


@app.get("/students/{student_id}/recommendations")
async def get_recommendations(student_id: int):
    """Get recommendations for a student."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM recommendations WHERE student_id = ? ORDER BY priority DESC", (student_id,))
    recommendations = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {"recommendations": recommendations}


@app.post("/students/{student_id}/assign-counselor")
async def assign_counselor(student_id: int, request: dict = None, mentor_id: int = None):
    """Assign a counselor/mentor to a student. If random=true, assign a random mentor."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Verify student exists
    cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
    
    # If random assignment requested, select a random mentor
    if request and isinstance(request, dict) and request.get('random'):
        cursor.execute("SELECT id, full_name FROM mentors WHERE role = 'mentor'")
        mentors = cursor.fetchall()
        if not mentors:
            conn.close()
            raise HTTPException(status_code=404, detail="No mentors available")
        
        import random as rand
        selected_mentor = rand.choice(mentors)
        mentor_id = selected_mentor['id']
        mentor_name = selected_mentor['full_name']
    else:
        # Verify mentor exists
        cursor.execute("SELECT full_name FROM mentors WHERE id = ?", (mentor_id,))
        mentor = cursor.fetchone()
        if not mentor:
            conn.close()
            raise HTTPException(status_code=404, detail="Mentor not found")
        mentor_name = mentor["full_name"]
    
    # Check if already assigned
    cursor.execute("""
        SELECT id FROM counselor_assignments 
        WHERE student_id = ? AND mentor_id = ? AND status = 'active'
    """, (student_id, mentor_id))
    
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Counselor already assigned to this student")
    
    # Close any existing assignments
    cursor.execute("""
        UPDATE counselor_assignments SET status = 'completed'
        WHERE student_id = ? AND status = 'active'
    """, (student_id,))
    
    # Create new assignment
    cursor.execute("""
        INSERT INTO counselor_assignments (student_id, mentor_id, notes, status)
        VALUES (?, ?, ?, 'active')
    """, (student_id, mentor_id, f"Assigned to counsel {student_id}"))
    
    assignment_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": assignment_id,
        "student_id": student_id,
        "mentor_id": mentor_id,
        "counselor_name": mentor_name,
        "status": "active"
    }


@app.get("/students/{student_id}/counselor")
async def get_assigned_counselor(student_id: int):
    """Get assigned counselor/mentor for a student."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT ca.id, ca.mentor_id, m.full_name as mentor_name, ca.assigned_date, ca.notes, ca.status
        FROM counselor_assignments ca
        JOIN mentors m ON ca.mentor_id = m.id
        WHERE ca.student_id = ? AND ca.status = 'active'
        LIMIT 1
    """, (student_id,))
    
    counselor = cursor.fetchone()
    conn.close()
    
    if not counselor:
        return {"counselor": None}
    
    return {"counselor": dict(counselor)}


@app.post("/follow-ups")
async def create_follow_up(
    student_id: int,
    action_description: str,
    recommendation_id: Optional[int] = None,
    due_date: Optional[str] = None
):
    """Create a follow-up action."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Verify student exists
    cursor.execute("SELECT id FROM students WHERE id = ?", (student_id,))
    if not cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
    
    cursor.execute("""
        INSERT INTO follow_ups (student_id, recommendation_id, action_description, due_date, status)
        VALUES (?, ?, ?, ?, 'pending')
    """, (student_id, recommendation_id, action_description, due_date))
    
    follow_up_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "id": follow_up_id,
        "student_id": student_id,
        "recommendation_id": recommendation_id,
        "action_description": action_description,
        "due_date": due_date,
        "status": "pending"
    }


@app.put("/follow-ups/{follow_up_id}")
async def update_follow_up(follow_up_id: int, status: str, notes: Optional[str] = None):
    """Update follow-up status."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get follow-up
    cursor.execute("SELECT * FROM follow_ups WHERE id = ?", (follow_up_id,))
    follow_up = cursor.fetchone()
    
    if not follow_up:
        conn.close()
        raise HTTPException(status_code=404, detail="Follow-up not found")
    
    completed_date = datetime.now().isoformat() if status == "completed" else None
    
    cursor.execute("""
        UPDATE follow_ups SET status = ?, notes = ?, completed_date = ?, updated_at = ?
        WHERE id = ?
    """, (status, notes, completed_date, datetime.now().isoformat(), follow_up_id))
    
    conn.commit()
    conn.close()
    
    return {"id": follow_up_id, "status": status, "completed_date": completed_date}


@app.get("/follow-ups/{student_id}")
async def get_follow_ups(student_id: int, status: Optional[str] = None):
    """Get follow-ups for a student."""
    conn = get_db()
    cursor = conn.cursor()
    
    if status:
        cursor.execute("""
            SELECT * FROM follow_ups 
            WHERE student_id = ? AND status = ?
            ORDER BY due_date ASC
        """, (student_id, status))
    else:
        cursor.execute("""
            SELECT * FROM follow_ups 
            WHERE student_id = ?
            ORDER BY due_date ASC
        """, (student_id,))
    
    follow_ups = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return {"follow_ups": follow_ups}


@app.get("/high-risk-monitoring")
async def get_high_risk_students():
    """Get top at-risk students for monitoring dashboard."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get high and medium risk students
    cursor.execute("""
        SELECT * FROM students 
        WHERE risk_level IN ('high', 'medium')
        ORDER BY created_at DESC
    """)
    
    students = [dict(row) for row in cursor.fetchall()]
    
    # Enrich with priority scores and counselor info
    high_risk_students = []
    for student in students:
        avg_marks = (student["subject1_marks"] + student["subject2_marks"] + student["subject3_marks"] + student["subject4_marks"] + student["subject5_marks"]) / 5
        priority_score = calculate_priority_score(student["attendance"], avg_marks, student["fees_pending"], student["risk_level"])
        
        # Get risk factors
        risk_factors = generate_risk_reasons(student["attendance"], avg_marks, student["fees_pending"])
        main_reasons = [r["factor"].replace("_", " ").title() for r in risk_factors[:2]] if risk_factors else []
        
        # Get counselor
        cursor.execute("""
            SELECT m.full_name FROM counselor_assignments ca
            JOIN mentors m ON ca.mentor_id = m.id
            WHERE ca.student_id = ? AND ca.status = 'active'
            LIMIT 1
        """, (student["id"],))
        counselor_row = cursor.fetchone()
        counselor_name = counselor_row["full_name"] if counselor_row else None
        
        # Count pending follow-ups
        cursor.execute("SELECT COUNT(*) as count FROM follow_ups WHERE student_id = ? AND status = 'pending'", (student["id"],))
        pending_count = cursor.fetchone()["count"]
        
        # Get last alert
        cursor.execute("SELECT created_at FROM alerts WHERE student_id = ? ORDER BY created_at DESC LIMIT 1", (student["id"],))
        last_alert = cursor.fetchone()
        
        high_risk_students.append({
            "student_id": student["id"],
            "name": student["name"],
            "roll_no": student.get("roll_no"),
            "department": student.get("department"),
            "risk_level": student["risk_level"],
            "priority_score": priority_score,
            "confidence": student.get("confidence", 0),
            "main_reasons": main_reasons,
            "counselor_assigned": counselor_name,
            "pending_actions": pending_count,
            "last_alert": last_alert["created_at"] if last_alert else None
        })
    
    # Sort by priority score DESC
    high_risk_students.sort(key=lambda x: x["priority_score"], reverse=True)
    
    conn.close()
    
    return {"high_risk_students": high_risk_students}


@app.get("/students/{student_id}/full-profile")
async def get_student_full_profile(student_id: int):
    """Get complete student profile for detail panel."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get student
    cursor.execute("SELECT * FROM students WHERE id = ?", (student_id,))
    student = dict(cursor.fetchone() or {})
    
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Calculate metrics
    avg_marks = (student["subject1_marks"] + student["subject2_marks"] + student["subject3_marks"] + student["subject4_marks"] + student["subject5_marks"]) / 5
    priority_score = calculate_priority_score(student["attendance"], avg_marks, student["fees_pending"], student["risk_level"])
    risk_factors = generate_risk_reasons(student["attendance"], avg_marks, student["fees_pending"])
    reason_strings = [r["factor"].replace("_", " ").title() for r in risk_factors]
    
    # Get recommendations
    cursor.execute("SELECT * FROM recommendations WHERE student_id = ?", (student_id,))
    recommendations = [dict(row) for row in cursor.fetchall()]
    
    # Get counselor
    cursor.execute("""
        SELECT ca.id, ca.mentor_id, m.full_name as mentor_name, ca.assigned_date, ca.notes, ca.status
        FROM counselor_assignments ca
        JOIN mentors m ON ca.mentor_id = m.id
        WHERE ca.student_id = ? AND ca.status = 'active'
        LIMIT 1
    """, (student_id,))
    counselor = cursor.fetchone()
    
    # Get follow-ups
    cursor.execute("SELECT * FROM follow_ups WHERE student_id = ? ORDER BY created_at DESC", (student_id,))
    follow_ups = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "id": student["id"],
        "name": student["name"],
        "roll_no": student.get("roll_no"),
        "department": student.get("department"),
        "attendance": student["attendance"],
        "subject1_marks": student["subject1_marks"],
        "subject2_marks": student["subject2_marks"],
        "subject3_marks": student["subject3_marks"],
        "subject4_marks": student["subject4_marks"],
        "subject5_marks": student["subject5_marks"],
        "fees_pending": student["fees_pending"],
        "risk_level": student["risk_level"],
        "confidence": student.get("confidence", 0),
        "priority_score": priority_score,
        "risk_details": {
            "reasons": reason_strings,
            "risk_factors": risk_factors,
            "counselor_assigned": dict(counselor) if counselor else None
        },
        "recommendations": recommendations,
        "counselor": dict(counselor) if counselor else None,
        "follow_ups": follow_ups,
        "created_at": student.get("created_at")
    }


@app.get("/")
def home():
    return {"message": "Welcome Vicky"}


# ============================================================================
# RULE-BASED RISK EVALUATION ENDPOINT
# ============================================================================

class RiskEvaluationRequest(BaseModel):
    """Request model for risk evaluation."""
    attendance_percentage: float
    average_marks: float
    fees_pending_percentage: float


@app.post("/students/{student_id}/risk-evaluation")
async def evaluate_student_risk(student_id: int, request: RiskEvaluationRequest):
    """
    Evaluate student risk using rule-based system.
    
    Returns detailed risk assessment with individual factor breakdown.
    """
    try:
        # Use the rule-based risk classifier
        result = classify_student_risk(
            attendance_percentage=request.attendance_percentage,
            average_marks=request.average_marks,
            fees_pending_percentage=request.fees_pending_percentage
        )
        
        # Convert to serializable format
        return {
            "risk_level": result.risk_level,
            "confidence_score": result.confidence_score,
            "individual_risks": [
                {
                    "factor": risk.factor,
                    "risk": risk.risk,
                    "value": float(risk.value),
                    "reason": risk.reason
                }
                for risk in result.individual_risks
            ],
            "critical_factors": result.critical_factors
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error evaluating risk: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
