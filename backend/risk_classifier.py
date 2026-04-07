"""
Student Risk Classification Module

Rule-based student risk evaluation system using three factors:
- Marks (0-100)
- Attendance (0-100)
- Fee Payment Status (0-100 as pending percentage)

Evaluates each factor independently and combines results using final risk rules.
"""

from dataclasses import dataclass
from typing import List


@dataclass
class IndividualRiskLevel:
    """Risk level for a single factor"""
    factor: str  # "marks", "attendance", "fees"
    risk: str  # "LOW", "MEDIUM", "HIGH"
    value: float  # The actual value of the factor
    reason: str  # Human-readable reason


@dataclass
class RiskClassification:
    """Complete risk classification result"""
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    confidence_score: int  # 0-100
    individual_risks: List[IndividualRiskLevel]  # Breakdown by factor
    critical_factors: List[str]  # List of concerning factors


def evaluate_marks_risk(marks: float) -> str:
    """
    Evaluate risk level based on marks.
    
    Rules:
    - Marks >= 60 → LOW
    - Marks 40-59 → MEDIUM
    - Marks < 40 → HIGH
    """
    if marks >= 60:
        return "LOW"
    elif 40 <= marks < 60:
        return "MEDIUM"
    else:
        return "HIGH"


def evaluate_attendance_risk(attendance: float) -> str:
    """
    Evaluate risk level based on attendance.
    
    Rules:
    - Attendance >= 75 → LOW
    - Attendance 60-74 → MEDIUM
    - Attendance < 60 → HIGH
    """
    if attendance >= 75:
        return "LOW"
    elif 60 <= attendance < 75:
        return "MEDIUM"
    else:
        return "HIGH"


def evaluate_fees_risk(fees_pending_percentage: float) -> str:
    """
    Evaluate risk level based on fee payment status.
    
    Rules:
    - Fees fully paid (0% pending) → LOW
    - Fees partially paid (1-99% pending) → MEDIUM
    - Fees not paid (100% pending) → HIGH
    """
    if fees_pending_percentage == 0:
        return "LOW"
    elif 0 < fees_pending_percentage < 100:
        return "MEDIUM"
    else:
        return "HIGH"


def determine_final_risk_level(
    marks_risk: str,
    attendance_risk: str,
    fees_risk: str
) -> str:
    """
    Determine final risk level based on individual factor risks.
    
    Rules:
    - If two or more conditions are HIGH → HIGH RISK
    - If one HIGH or two or more MEDIUM → MEDIUM RISK
    - If all are LOW → LOW RISK
    """
    risk_factors = [marks_risk, attendance_risk, fees_risk]
    
    high_count = risk_factors.count("HIGH")
    medium_count = risk_factors.count("MEDIUM")
    
    # Two or more HIGH → HIGH RISK
    if high_count >= 2:
        return "HIGH"
    
    # One HIGH or two or more MEDIUM → MEDIUM RISK
    if high_count >= 1 or medium_count >= 2:
        return "MEDIUM"
    
    # All LOW → LOW RISK
    return "LOW"


def calculate_confidence_score(risk_level: str) -> int:
    """
    Calculate confidence score based on final risk level.
    
    Rules:
    - LOW → 80–100
    - MEDIUM → 50–79
    - HIGH → 30–49
    
    Returns a random value within the appropriate range for variation.
    """
    import random
    
    if risk_level == "LOW":
        return random.randint(80, 100)
    elif risk_level == "MEDIUM":
        return random.randint(50, 79)
    else:  # HIGH
        return random.randint(30, 49)


def classify_student_risk(
    attendance_percentage: float,
    average_marks: float,
    fees_pending_percentage: float
) -> RiskClassification:
    """
    Classify student risk level based on three factors.
    
    Args:
        attendance_percentage: Student attendance (0-100)
        average_marks: Average marks across subjects (0-100)
        fees_pending_percentage: Percentage of fees pending (0-100)
    
    Returns:
        RiskClassification with complete breakdown
    
    Examples:
        >>> result = classify_student_risk(85, 75, 0)
        >>> result.risk_level
        'LOW'
        >>> result.confidence_score >= 80
        True
    """
    # Clamp inputs to 0-100 range
    attendance = max(0, min(100, attendance_percentage))
    marks = max(0, min(100, average_marks))
    fees = max(0, min(100, fees_pending_percentage))
    
    # Evaluate each factor independently
    marks_risk = evaluate_marks_risk(marks)
    attendance_risk = evaluate_attendance_risk(attendance)
    fees_risk = evaluate_fees_risk(fees)
    
    # Build individual risk details
    individual_risks = [
        IndividualRiskLevel(
            factor="marks",
            risk=marks_risk,
            value=marks,
            reason=f"Marks: {marks}%"
        ),
        IndividualRiskLevel(
            factor="attendance",
            risk=attendance_risk,
            value=attendance,
            reason=f"Attendance: {attendance}%"
        ),
        IndividualRiskLevel(
            factor="fees",
            risk=fees_risk,
            value=fees,
            reason=f"Fees pending: {fees}%"
        ),
    ]
    
    # Determine final risk level
    final_risk = determine_final_risk_level(marks_risk, attendance_risk, fees_risk)
    
    # Calculate confidence score
    confidence = calculate_confidence_score(final_risk)
    
    # Build list of critical factors for display
    critical_factors = []
    for risk in individual_risks:
        if risk.risk == "HIGH":
            critical_factors.append(f"{risk.factor.capitalize()} - HIGH: {risk.reason}")
        elif risk.risk == "MEDIUM":
            critical_factors.append(f"{risk.factor.capitalize()} - MEDIUM: {risk.reason}")
    
    return RiskClassification(
        risk_level=final_risk,
        confidence_score=confidence,
        individual_risks=individual_risks,
        critical_factors=critical_factors
    )


def get_risk_recommendation(risk_classification: RiskClassification) -> str:
    """
    Get intervention recommendation based on risk classification.
    
    Args:
        risk_classification: RiskClassification object
    
    Returns:
        String recommendation for intervention
    """
    if risk_classification.risk_level == "HIGH":
        return "Immediate intervention required. Schedule meeting with student and counselor."
    elif risk_classification.risk_level == "MEDIUM":
        return "Monitor closely. Provide academic support and fee assistance options."
    else:
        return "No immediate action needed. Continue regular monitoring."
