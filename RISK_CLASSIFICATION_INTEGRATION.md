"""
Example Integration: Using Risk Classifier with Student Data

This shows how to integrate the risk classification system with existing endpoints.
"""

# ============================================================================
# BACKEND INTEGRATION EXAMPLE (main.py)
# ============================================================================

from risk_classifier import classify_student_risk, get_risk_recommendation


# Example 1: Calculate risk when adding a student
async def example_add_student_with_risk():
    """
    When adding a student with metrics, calculate risk automatically.
    """
    student_data = {
        "name": "John Doe",
        "roll_no": "CS001",
        "attendance": 45,  # Low attendance
        "subject1_marks": 35,
        "subject2_marks": 38,
        "subject3_marks": 40,
        "subject4_marks": 42,
        "subject5_marks": 39,
        "fees_pending": 15000,  # ₹15000 out of ₹20000 = 75%
    }
    
    # Calculate average marks
    avg_marks = (
        student_data["subject1_marks"] +
        student_data["subject2_marks"] +
        student_data["subject3_marks"] +
        student_data["subject4_marks"] +
        student_data["subject5_marks"]
    ) / 5
    
    # Calculate fees percentage (assuming 20000 is 100%)
    fees_pending_percentage = (student_data["fees_pending"] / 20000) * 100
    
    # Classify risk
    risk_classification = classify_student_risk(
        attendance_percentage=student_data["attendance"],
        average_marks=avg_marks,
        fees_pending_percentage=fees_pending_percentage
    )
    
    return {
        "student": student_data,
        "risk_level": risk_classification.risk_level,
        "confidence": risk_classification.confidence_score,
        "factors": risk_classification.critical_factors,
        "recommendation": get_risk_recommendation(risk_classification)
    }


# Example 2: FastAPI endpoint
async def example_calculate_risk_endpoint():
    """
    Create an endpoint to get risk classification for any student metrics.
    
    Usage:
    POST /api/risk/classify
    {
        "attendance": 65,
        "average_marks": 50,
        "fees_pending_percentage": 40
    }
    """
    from pydantic import BaseModel
    from fastapi import APIRouter
    
    router = APIRouter()
    
    class RiskAssessmentRequest(BaseModel):
        attendance: float
        average_marks: float
        fees_pending_percentage: float
    
    class RiskAssessmentResponse(BaseModel):
        risk_level: str
        confidence_score: int
        critical_factors: list
        recommendation: str
    
    @router.post("/risk/classify", response_model=RiskAssessmentResponse)
    async def classify_risk(data: RiskAssessmentRequest):
        """Classify student risk based on metrics"""
        result = classify_student_risk(
            attendance_percentage=data.attendance,
            average_marks=data.average_marks,
            fees_pending_percentage=data.fees_pending_percentage
        )
        
        return {
            "risk_level": result.risk_level,
            "confidence_score": result.confidence_score,
            "critical_factors": result.critical_factors,
            "recommendation": get_risk_recommendation(result)
        }
    
    return router


# Example 3: Update student risk level in database
async def example_update_student_risk_in_db(student_id: int, conn):
    """
    Query student metrics and update their risk level in database.
    """
    cursor = conn.cursor()
    
    # Get student data
    cursor.execute("""
        SELECT id, attendance, subject1_marks, subject2_marks, 
               subject3_marks, subject4_marks, subject5_marks, fees_pending
        FROM students WHERE id = ?
    """, (student_id,))
    
    student = cursor.fetchone()
    if not student:
        return None
    
    # Calculate average marks
    avg_marks = (
        student[2] + student[3] + student[4] + student[5] + student[6]
    ) / 5
    
    # Assume total fees is 20000
    fees_percentage = (student[7] / 20000) * 100
    
    # Classify risk
    result = classify_student_risk(
        attendance_percentage=student[1],
        average_marks=avg_marks,
        fees_pending_percentage=fees_percentage
    )
    
    # Update database
    cursor.execute("""
        UPDATE students 
        SET risk_level = ?, confidence = ?
        WHERE id = ?
    """, (result.risk_level, result.confidence_score, student_id))
    
    conn.commit()
    
    return result


# Example 4: Generate alerts for high-risk students
async def example_generate_alerts(conn):
    """
    Scan all students and create alerts for HIGH/MEDIUM risk.
    """
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, name, attendance, subject1_marks, subject2_marks,
               subject3_marks, subject4_marks, subject5_marks, fees_pending
        FROM students
    """)
    
    students = cursor.fetchall()
    alerts = []
    
    for student in students:
        student_id, name = student[0], student[1]
        attendance = student[2]
        avg_marks = (student[3] + student[4] + student[5] + student[6] + student[7]) / 5
        fees_percentage = (student[8] / 20000) * 100
        
        # Classify
        result = classify_student_risk(
            attendance_percentage=attendance,
            average_marks=avg_marks,
            fees_pending_percentage=fees_percentage
        )
        
        # Create alert for HIGH or MEDIUM risk
        if result.risk_level in ["HIGH", "MEDIUM"]:
            alerts.append({
                "student_id": student_id,
                "student_name": name,
                "risk_level": result.risk_level,
                "confidence": result.confidence_score,
                "factors": result.critical_factors,
                "recommendation": get_risk_recommendation(result)
            })
    
    return alerts


# ============================================================================
# FRONTEND INTEGRATION EXAMPLE (React Component)
# ============================================================================

"""
// RiskAnalysisTable.tsx

import { classifyStudentRisk, getRiskBadgeVariant, getRiskColor } from "@/lib/risk-classifier";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface StudentMetrics {
  id: number;
  name: string;
  attendance: number;
  average_marks: number;
  fees_pending_percentage: number;
}

export function RiskAnalysisTable({ students }: { students: StudentMetrics[] }) {
  return (
    <div className="space-y-4">
      {students.map((student) => {
        const classification = classifyStudentRisk(
          student.attendance,
          student.average_marks,
          student.fees_pending_percentage
        );
        
        return (
          <div key={student.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{student.name}</h3>
                <p className="text-sm text-gray-500">
                  Attendance: {student.attendance}% | 
                  Marks: {student.average_marks}% | 
                  Fees Pending: {student.fees_pending_percentage}%
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge variant={getRiskBadgeVariant(classification.risk_level)}>
                  {classification.risk_level} Risk
                </Badge>
                <span className="text-sm">
                  Confidence: {classification.confidence_score}%
                </span>
              </div>
            </div>
            
            {classification.critical_factors.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-medium text-gray-700">Critical Factors:</p>
                <ul className="space-y-1">
                  {classification.critical_factors.map((factor, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Usage in parent component:
export function StudentAnalytics() {
  const students = useStudents(); // Get from API
  
  return (
    <div className="space-y-6">
      <h1>Risk Analysis</h1>
      <RiskAnalysisTable students={students} />
    </div>
  );
}
"""

# ============================================================================
# EXAMPLE DATA FOR TESTING
# ============================================================================

EXAMPLE_STUDENTS = [
    {
        "name": "Alice Johnson",
        "attendance": 95,
        "average_marks": 88,
        "fees_pending_percentage": 5,
        "expected_risk": "LOW"
    },
    {
        "name": "Bob Smith",
        "attendance": 65,
        "average_marks": 55,
        "fees_pending_percentage": 45,
        "expected_risk": "MEDIUM"
    },
    {
        "name": "Charlie Brown",
        "attendance": 40,
        "average_marks": 35,
        "fees_pending_percentage": 80,
        "expected_risk": "HIGH"
    },
    {
        "name": "Diana Prince",
        "attendance": 70,
        "average_marks": 72,
        "fees_pending_percentage": 0,
        "expected_risk": "LOW"
    },
    {
        "name": "Ethan Hunt",
        "attendance": 50,
        "average_marks": 45,
        "fees_pending_percentage": 60,
        "expected_risk": "MEDIUM"
    },
]


if __name__ == "__main__":
    # Test with example students
    print("\n" + "="*70)
    print("RISK CLASSIFICATION - INTEGRATION EXAMPLES")
    print("="*70 + "\n")
    
    for student in EXAMPLE_STUDENTS:
        result = classify_student_risk(
            student["attendance"],
            student["average_marks"],
            student["fees_pending_percentage"]
        )
        
        print(f"Student: {student['name']}")
        print(f"  Metrics: Attendance={student['attendance']}%, "
              f"Marks={student['average_marks']}%, "
              f"Fees={student['fees_pending_percentage']}%")
        print(f"  Risk Level: {result.risk_level} "
              f"(Confidence: {result.confidence_score}%)")
        print(f"  Factors: {', '.join(result.critical_factors) or 'None'}")
        print(f"  Recommendation: {get_risk_recommendation(result)}")
        print()
