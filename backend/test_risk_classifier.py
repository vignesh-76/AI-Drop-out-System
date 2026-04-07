"""
Test cases for Rule-Based Student Risk Classification

Tests all three risk evaluation metrics:
- Marks: >= 60 (LOW), 40-59 (MEDIUM), < 40 (HIGH)
- Attendance: >= 75 (LOW), 60-74 (MEDIUM), < 60 (HIGH)
- Fees: 0% (LOW), 1-99% (MEDIUM), 100% (HIGH)

Final Risk Rules:
- 2+ HIGH factors → HIGH RISK
- 1 HIGH or 2+ MEDIUM → MEDIUM RISK
- All LOW → LOW RISK
"""

from risk_classifier import classify_student_risk, get_risk_recommendation


# ============================================================================
# HIGH RISK TESTS (2 or more HIGH factors)
# ============================================================================

def test_high_risk_marks_and_attendance():
    """Test HIGH risk: Low marks + Low attendance"""
    result = classify_student_risk(
        attendance_percentage=50,    # HIGH (< 60)
        average_marks=35,            # HIGH (< 40)
        fees_pending_percentage=0    # LOW (fully paid)
    )
    assert result.risk_level == "HIGH", f"Expected HIGH, got {result.risk_level}"
    assert 30 <= result.confidence_score <= 49
    
    # Verify individual risk levels
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "HIGH"
    assert factors["attendance"] == "HIGH"
    assert factors["fees"] == "LOW"
    print(f"✓ HIGH RISK (Low Marks + Low Attendance): {result.risk_level}, Confidence: {result.confidence_score}")


def test_high_risk_marks_and_fees():
    """Test HIGH risk: Low marks + Full fees pending"""
    result = classify_student_risk(
        attendance_percentage=80,    # LOW (>= 75)
        average_marks=35,            # HIGH (< 40)
        fees_pending_percentage=100  # HIGH (not paid)
    )
    assert result.risk_level == "HIGH", f"Expected HIGH, got {result.risk_level}"
    assert 30 <= result.confidence_score <= 49
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "HIGH"
    assert factors["fees"] == "HIGH"
    assert factors["attendance"] == "LOW"
    print(f"✓ HIGH RISK (Low Marks + No Fees Paid): {result.risk_level}, Confidence: {result.confidence_score}")


def test_high_risk_attendance_and_fees():
    """Test HIGH risk: Low attendance + Full fees pending"""
    result = classify_student_risk(
        attendance_percentage=45,    # HIGH (< 60)
        average_marks=75,            # LOW (>= 60)
        fees_pending_percentage=100  # HIGH (not paid)
    )
    assert result.risk_level == "HIGH", f"Expected HIGH, got {result.risk_level}"
    assert 30 <= result.confidence_score <= 49
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["attendance"] == "HIGH"
    assert factors["fees"] == "HIGH"
    assert factors["marks"] == "LOW"
    print(f"✓ HIGH RISK (Low Attendance + No Fees Paid): {result.risk_level}, Confidence: {result.confidence_score}")


def test_high_risk_all_high_factors():
    """Test HIGH risk: All three factors are HIGH"""
    result = classify_student_risk(
        attendance_percentage=40,    # HIGH (< 60)
        average_marks=35,            # HIGH (< 40)
        fees_pending_percentage=100  # HIGH (not paid)
    )
    assert result.risk_level == "HIGH", f"Expected HIGH, got {result.risk_level}"
    assert 30 <= result.confidence_score <= 49
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "HIGH"
    assert factors["attendance"] == "HIGH"
    assert factors["fees"] == "HIGH"
    print(f"✓ HIGH RISK (All HIGH factors): {result.risk_level}, Confidence: {result.confidence_score}")


# ============================================================================
# MEDIUM RISK TESTS
# ============================================================================

def test_medium_risk_one_high_factor():
    """Test MEDIUM risk: One HIGH factor (marks)"""
    result = classify_student_risk(
        attendance_percentage=80,    # LOW (>= 75)
        average_marks=35,            # HIGH (< 40)
        fees_pending_percentage=0    # LOW (fully paid)
    )
    assert result.risk_level == "MEDIUM", f"Expected MEDIUM, got {result.risk_level}"
    assert 50 <= result.confidence_score <= 79
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "HIGH"
    assert factors["attendance"] == "LOW"
    assert factors["fees"] == "LOW"
    print(f"✓ MEDIUM RISK (One HIGH - Marks): {result.risk_level}, Confidence: {result.confidence_score}")


def test_medium_risk_one_high_attendance():
    """Test MEDIUM risk: One HIGH factor (attendance)"""
    result = classify_student_risk(
        attendance_percentage=45,    # HIGH (< 60)
        average_marks=75,            # LOW (>= 60)
        fees_pending_percentage=0    # LOW (fully paid)
    )
    assert result.risk_level == "MEDIUM", f"Expected MEDIUM, got {result.risk_level}"
    assert 50 <= result.confidence_score <= 79
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["attendance"] == "HIGH"
    assert factors["marks"] == "LOW"
    assert factors["fees"] == "LOW"
    print(f"✓ MEDIUM RISK (One HIGH - Attendance): {result.risk_level}, Confidence: {result.confidence_score}")


def test_medium_risk_one_high_fees():
    """Test MEDIUM risk: One HIGH factor (fees)"""
    result = classify_student_risk(
        attendance_percentage=80,    # LOW (>= 75)
        average_marks=75,            # LOW (>= 60)
        fees_pending_percentage=100  # HIGH (not paid)
    )
    assert result.risk_level == "MEDIUM", f"Expected MEDIUM, got {result.risk_level}"
    assert 50 <= result.confidence_score <= 79
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["fees"] == "HIGH"
    assert factors["marks"] == "LOW"
    assert factors["attendance"] == "LOW"
    print(f"✓ MEDIUM RISK (One HIGH - Fees): {result.risk_level}, Confidence: {result.confidence_score}")


def test_medium_risk_two_medium_factors():
    """Test MEDIUM risk: Two or more MEDIUM factors"""
    result = classify_student_risk(
        attendance_percentage=65,    # MEDIUM (60-74)
        average_marks=50,            # MEDIUM (40-59)
        fees_pending_percentage=0    # LOW (fully paid)
    )
    assert result.risk_level == "MEDIUM", f"Expected MEDIUM, got {result.risk_level}"
    assert 50 <= result.confidence_score <= 79
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["attendance"] == "MEDIUM"
    assert factors["marks"] == "MEDIUM"
    assert factors["fees"] == "LOW"
    print(f"✓ MEDIUM RISK (Two MEDIUM factors): {result.risk_level}, Confidence: {result.confidence_score}")


def test_medium_risk_three_medium_factors():
    """Test MEDIUM risk: All three factors are MEDIUM"""
    result = classify_student_risk(
        attendance_percentage=70,    # MEDIUM (60-74)
        average_marks=50,            # MEDIUM (40-59)
        fees_pending_percentage=50   # MEDIUM (partially paid)
    )
    assert result.risk_level == "MEDIUM", f"Expected MEDIUM, got {result.risk_level}"
    assert 50 <= result.confidence_score <= 79
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["attendance"] == "MEDIUM"
    assert factors["marks"] == "MEDIUM"
    assert factors["fees"] == "MEDIUM"
    print(f"✓ MEDIUM RISK (All MEDIUM factors): {result.risk_level}, Confidence: {result.confidence_score}")


def test_medium_risk_mixed_high_and_low():
    """Test MEDIUM risk: Mixed HIGH and LOW with no MEDIUM"""
    result = classify_student_risk(
        attendance_percentage=80,    # LOW (>= 75)
        average_marks=35,            # HIGH (< 40)
        fees_pending_percentage=50   # MEDIUM (partially paid)
    )
    # 1 HIGH + 1 MEDIUM + 1 LOW = MEDIUM RISK (1 HIGH or 2+ MEDIUM)
    assert result.risk_level == "MEDIUM", f"Expected MEDIUM, got {result.risk_level}"
    print(f"✓ MEDIUM RISK (1 HIGH + 1 MEDIUM): {result.risk_level}, Confidence: {result.confidence_score}")


# ============================================================================
# LOW RISK TESTS (All LOW factors)
# ============================================================================

def test_low_risk_all_excellent():
    """Test LOW risk: Excellent in all factors"""
    result = classify_student_risk(
        attendance_percentage=95,    # LOW (>= 75)
        average_marks=85,            # LOW (>= 60)
        fees_pending_percentage=0    # LOW (fully paid)
    )
    assert result.risk_level == "LOW", f"Expected LOW, got {result.risk_level}"
    assert 80 <= result.confidence_score <= 100
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "LOW"
    assert factors["attendance"] == "LOW"
    assert factors["fees"] == "LOW"
    print(f"✓ LOW RISK (Excellent): {result.risk_level}, Confidence: {result.confidence_score}")


def test_low_risk_all_good():
    """Test LOW risk: Good in all factors"""
    result = classify_student_risk(
        attendance_percentage=80,    # LOW (>= 75)
        average_marks=70,            # LOW (>= 60)
        fees_pending_percentage=0    # LOW (fully paid)
    )
    assert result.risk_level == "LOW", f"Expected LOW, got {result.risk_level}"
    assert 80 <= result.confidence_score <= 100
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "LOW"
    assert factors["attendance"] == "LOW"
    assert factors["fees"] == "LOW"
    print(f"✓ LOW RISK (All Good): {result.risk_level}, Confidence: {result.confidence_score}")


def test_low_risk_borderline_passing():
    """Test LOW risk: Borderline passing in all factors"""
    result = classify_student_risk(
        attendance_percentage=75,    # LOW (exactly 75)
        average_marks=60,            # LOW (exactly 60)
        fees_pending_percentage=0    # LOW (fully paid)
    )
    assert result.risk_level == "LOW", f"Expected LOW, got {result.risk_level}"
    assert 80 <= result.confidence_score <= 100
    
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "LOW"
    assert factors["attendance"] == "LOW"
    assert factors["fees"] == "LOW"
    print(f"✓ LOW RISK (Borderline Passing): {result.risk_level}, Confidence: {result.confidence_score}")


def test_low_risk_one_fee_pending():
    """Test LOW risk: Small amount of fees pending (still LOW)"""
    result = classify_student_risk(
        attendance_percentage=85,    # LOW (>= 75)
        average_marks=70,            # LOW (>= 60)
        fees_pending_percentage=1    # MEDIUM (even 1% is partial)
    )
    # 2 LOW + 1 MEDIUM = LOW RISK (not 1 HIGH or 2+ MEDIUM)
    assert result.risk_level == "LOW", f"Expected LOW, got {result.risk_level}"
    assert 80 <= result.confidence_score <= 100
    print(f"✓ LOW RISK (Minimal Fee Pending): {result.risk_level}, Confidence: {result.confidence_score}")


# ============================================================================
# BOUNDARY TESTS
# ============================================================================

def test_marks_boundary_60():
    """Test marks boundary at exactly 60"""
    result = classify_student_risk(85, 60, 0)
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "LOW", "Marks=60 should be LOW"
    assert result.risk_level == "LOW"
    print(f"✓ Boundary: Marks=60 is LOW")


def test_marks_boundary_40():
    """Test marks boundary at exactly 40"""
    result = classify_student_risk(85, 40, 0)
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "MEDIUM", "Marks=40 should be MEDIUM"
    assert result.risk_level == "LOW"
    print(f"✓ Boundary: Marks=40 is MEDIUM")


def test_marks_boundary_39():
    """Test marks boundary at 39"""
    result = classify_student_risk(85, 39, 0)
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["marks"] == "HIGH", "Marks=39 should be HIGH"
    assert result.risk_level == "MEDIUM"
    print(f"✓ Boundary: Marks=39 is HIGH")


def test_attendance_boundary_75():
    """Test attendance boundary at exactly 75"""
    result = classify_student_risk(75, 75, 0)
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["attendance"] == "LOW", "Attendance=75 should be LOW"
    assert result.risk_level == "LOW"
    print(f"✓ Boundary: Attendance=75 is LOW")


def test_attendance_boundary_60():
    """Test attendance boundary at exactly 60"""
    result = classify_student_risk(60, 75, 0)
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["attendance"] == "MEDIUM", "Attendance=60 should be MEDIUM"
    assert result.risk_level == "LOW"
    print(f"✓ Boundary: Attendance=60 is MEDIUM")


def test_fees_boundary_0():
    """Test fees boundary at 0 (fully paid)"""
    result = classify_student_risk(85, 75, 0)
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["fees"] == "LOW", "Fees=0 should be LOW"
    assert result.risk_level == "LOW"
    print(f"✓ Boundary: Fees=0% is LOW")


def test_fees_boundary_100():
    """Test fees boundary at 100 (not paid)"""
    result = classify_student_risk(85, 75, 100)
    factors = {r.factor: r.risk for r in result.individual_risks}
    assert factors["fees"] == "HIGH", "Fees=100 should be HIGH"
    assert result.risk_level == "MEDIUM"
    print(f"✓ Boundary: Fees=100% is HIGH")


def test_input_clamping():
    """Test that inputs are clamped to 0-100 range"""
    result = classify_student_risk(
        attendance_percentage=150,
        average_marks=-50,
        fees_pending_percentage=200
    )
    assert result.risk_level == "HIGH"
    print(f"✓ Input Clamping: {result.risk_level}")


# ============================================================================
# RECOMMENDATIONS TESTS
# ============================================================================

def test_recommendations():
    """Test recommendation generation for all risk levels"""
    high_risk = classify_student_risk(40, 35, 100)
    medium_risk = classify_student_risk(65, 50, 50)
    low_risk = classify_student_risk(85, 75, 0)
    
    high_rec = get_risk_recommendation(high_risk)
    medium_rec = get_risk_recommendation(medium_risk)
    low_rec = get_risk_recommendation(low_risk)
    
    assert "Immediate intervention" in high_rec
    assert "Monitor closely" in medium_rec
    assert "No immediate action" in low_rec
    
    print(f"✓ HIGH RISK Recommendation: {high_rec}")
    print(f"✓ MEDIUM RISK Recommendation: {medium_rec}")
    print(f"✓ LOW RISK Recommendation: {low_rec}")


def run_all_tests():
    """Run all test cases"""
    print("\n" + "="*70)
    print("RULE-BASED STUDENT RISK CLASSIFICATION - TEST SUITE")
    print("="*70 + "\n")
    
    print("HIGH RISK TESTS (2+ HIGH factors):")
    print("-" * 70)
    test_high_risk_marks_and_attendance()
    test_high_risk_marks_and_fees()
    test_high_risk_attendance_and_fees()
    test_high_risk_all_high_factors()
    
    print("\n\nMEDIUM RISK TESTS (1 HIGH or 2+ MEDIUM factors):")
    print("-" * 70)
    test_medium_risk_one_high_factor()
    test_medium_risk_one_high_attendance()
    test_medium_risk_one_high_fees()
    test_medium_risk_two_medium_factors()
    test_medium_risk_three_medium_factors()
    test_medium_risk_mixed_high_and_low()
    
    print("\n\nLOW RISK TESTS (All LOW factors):")
    print("-" * 70)
    test_low_risk_all_excellent()
    test_low_risk_all_good()
    test_low_risk_borderline_passing()
    test_low_risk_one_fee_pending()
    
    print("\n\nBOUNDARY TESTS:")
    print("-" * 70)
    test_marks_boundary_60()
    test_marks_boundary_40()
    test_marks_boundary_39()
    test_attendance_boundary_75()
    test_attendance_boundary_60()
    test_fees_boundary_0()
    test_fees_boundary_100()
    test_input_clamping()
    
    print("\n\nRECOMMENDATIONS TEST:")
    print("-" * 70)
    test_recommendations()
    
    print("\n" + "="*70)
    print("ALL TESTS PASSED! ✓")
    print("="*70 + "\n")


if __name__ == "__main__":
    run_all_tests()
