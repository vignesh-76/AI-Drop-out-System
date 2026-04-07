from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Literal, List, Any
from datetime import datetime


class SignUpRequest(BaseModel):
    """Sign up request model."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: Literal["mentor", "student"] = "mentor"


class SignInRequest(BaseModel):
    """Sign in request model."""
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    """Password reset request model."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model."""
    token: str
    new_password: str = Field(..., min_length=8)


class TokenResponse(BaseModel):
    """Token response model."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    mentor_id: int
    email: str
    full_name: str
    role: str


class MentorResponse(BaseModel):
    """Mentor response model."""
    id: int
    email: str
    full_name: str
    role: str
    created_at: str


class RefreshTokenRequest(BaseModel):
    """Refresh token request model."""
    refresh_token: str


class AuthErrorResponse(BaseModel):
    """Error response model."""
    detail: str
    error_code: Optional[str] = None


class RiskReason(BaseModel):
    """Individual risk reason."""
    factor: str  # e.g., "low_attendance", "low_marks", "pending_fees"
    value: float  # actual value
    threshold: float  # threshold for risk
    severity: str  # "low", "medium", "high"


class RiskDetails(BaseModel):
    """Detailed risk information for a student."""
    student_id: int
    name: str
    risk_level: str
    confidence: float
    priority_score: int  # 0-100 ranking
    reasons: List[str]  # Human-readable reasons
    risk_factors: List['RiskReason']  # Detailed breakdown
    recommendations: Optional[List['Recommendation']] = None
    counselor_assigned: Optional[str] = None  # Mentor name
    model_config = ConfigDict(arbitrary_types_allowed=True)


class Recommendation(BaseModel):
    """Recommendation for a student."""
    id: Optional[int] = None
    student_id: int
    action_type: str  # e.g., "counseling", "remedial_class", "fee_reminder", "attendance_support"
    description: str
    priority: str = "medium"  # "low", "medium", "high"
    status: str = "pending"  # "pending", "in_progress", "completed"
    created_at: Optional[str] = None


class CounselorAssignment(BaseModel):
    """Counselor/Mentor assignment to student."""
    id: Optional[int] = None
    student_id: int
    mentor_id: int
    mentor_name: Optional[str] = None
    assigned_date: Optional[str] = None
    notes: Optional[str] = None
    status: str = "active"  # "active", "completed"


class FollowUp(BaseModel):
    """Follow-up tracking for actions."""
    id: Optional[int] = None
    student_id: int
    recommendation_id: Optional[int] = None
    action_description: str
    due_date: Optional[str] = None
    status: str = "pending"  # "pending", "in_progress", "completed"
    completed_date: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None


class HighRiskStudent(BaseModel):
    """High-risk student for monitoring dashboard."""
    student_id: int
    name: str
    roll_no: Optional[str] = None
    department: Optional[str] = None
    risk_level: str
    priority_score: int  # 0-100
    confidence: float
    main_reasons: List[str]
    counselor_assigned: Optional[str] = None
    pending_actions: int
    last_alert: Optional[str] = None


class StudentFullProfile(BaseModel):
    """Complete student profile for detail panel."""
    id: int
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
    risk_level: str
    confidence: float
    priority_score: int
    risk_details: Any  # Dict with risk details
    recommendations: List[Recommendation]
    counselor: Optional[CounselorAssignment] = None
    follow_ups: List[FollowUp]
    created_at: Optional[str] = None


# ========== STUDENT AUTH & PROFILE MODELS ==========

class StudentTokenResponse(BaseModel):
    """Student token response model."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    student_id: int
    email: str
    name: str
    roll_no: Optional[str] = None
    department: Optional[str] = None
    role: str = "student"


class StudentResponse(BaseModel):
    """Student response model."""
    id: int
    name: str
    email: str
    roll_no: Optional[str] = None
    department: Optional[str] = None
    role: str = "student"
    created_at: Optional[str] = None


class StudentProfileResponse(BaseModel):
    """Student profile for personal dashboard."""
    id: int
    name: str
    email: str
    roll_no: Optional[str] = None
    department: Optional[str] = None
    attendance: float
    subject1_marks: float
    subject2_marks: float
    subject3_marks: float
    subject4_marks: float
    subject5_marks: float
    average_marks: float
    fees_pending: float
    risk_level: str
    confidence: float
    risk_factors: List['RiskReason']
    recommendations: List[Recommendation]
    enrolled_date: Optional[str] = None


class StudentAnalyticsResponse(BaseModel):
    """Student analytics data."""
    student_id: int
    name: str
    attendance_trend: List[float]  # Last 10 weeks
    marks_trend: List[float]  # Average marks trend
    fees_trend: List[float]  # Fees pending trend
    risk_trend: List[str]  # Risk level trend
    current_risk: str
    risk_score: float  # 0-100
    improvement_areas: List[str]
    strong_areas: List[str]


class StreamAnalyticsResponse(BaseModel):
    """Stream/class level analytics for mentors."""
    total_students: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    average_attendance: float
    average_marks: float
    students_with_fee_pending: int
    risk_distribution: dict  # {"HIGH": 5, "MEDIUM": 10, "LOW": 20}
    top_performers: List[dict]
    at_risk_students: List[dict]
    attendance_below_60: List[str]
    improvement_needed: List[dict]


class StudentSignUpRequest(BaseModel):
    """Student sign up request model."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    name: str = Field(..., min_length=2, max_length=100)
    roll_no: Optional[str] = None
    department: Optional[str] = None


class StudentSignInRequest(BaseModel):
    """Student sign in request model."""
    email: EmailStr
    password: str
