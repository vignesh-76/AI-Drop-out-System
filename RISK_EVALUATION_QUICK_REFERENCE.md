# Risk Evaluation System - Quick Reference Guide

## Quick Rules Cheat Sheet

### Individual Risk Levels

```
MARKS
├─ >= 60     → LOW ✓
├─ 40-59     → MEDIUM ⚠️
└─ < 40      → HIGH ✗

ATTENDANCE
├─ >= 75%    → LOW ✓
├─ 60-74%    → MEDIUM ⚠️
└─ < 60%     → HIGH ✗

FEES (% pending)
├─ 0%        → LOW ✓
├─ 1-99%     → MEDIUM ⚠️
└─ 100%      → HIGH ✗
```

### Final Risk Determination

```
2+ HIGH factors  →  HIGH RISK
1 HIGH OR 2+ MEDIUM  →  MEDIUM RISK
All LOW  →  LOW RISK
```

### Confidence Scores

```
LOW     : 80-100  (High confidence in good standing)
MEDIUM  : 50-79   (Moderate confidence in caution needed)
HIGH    : 30-49   (Lower confidence, but definitely concerning)
```

---

## Common Scenarios

| Marks | Attendance | Fees | Risk Level | Reason |
|-------|-----------|------|-----------|--------|
| 75 (L) | 85 (L) | 0% (L) | **LOW** | All LOW |
| 50 (M) | 70 (M) | 50% (M) | **MEDIUM** | 3 MEDIUM factors |
| 35 (H) | 50 (H) | 100% (H) | **HIGH** | 3 HIGH factors |
| 35 (H) | 80 (L) | 0% (L) | **MEDIUM** | 1 HIGH |
| 50 (M) | 65 (M) | 0% (L) | **MEDIUM** | 2 MEDIUM |
| 75 (L) | 75 (L) | 50% (M) | **LOW** | Only 1 MEDIUM (need 2+) |
| 35 (H) | 50 (H) | 0% (L) | **HIGH** | 2 HIGH |

---

## Implementation Quick Start

### Python
```python
from backend.risk_classifier import classify_student_risk

result = classify_student_risk(attendance=65, marks=35, fees_pending=100)
print(result.risk_level)  # "MEDIUM"
print(result.confidence_score)  # e.g., 67
```

### TypeScript
```typescript
import { classifyStudentRisk } from '@/lib/risk-classifier';

const result = classifyStudentRisk(65, 35, 100);
console.log(result.risk_level);  // "MEDIUM"
console.log(result.confidence_score);  // e.g., 67
```

---

## Output Structure

### Individual Risk Breakdown

```python
result.individual_risks = [
    {"factor": "marks", "risk": "HIGH", "value": 35, "reason": "Marks: 35%"},
    {"factor": "attendance", "risk": "MEDIUM", "value": 65, "reason": "Attendance: 65%"},
    {"factor": "fees", "risk": "HIGH", "value": 100, "reason": "Fees pending: 100%"}
]
```

### Critical Factors (Only concerning ones)

```python
result.critical_factors = [
    "Marks - HIGH: Marks: 35%",
    "Attendance - MEDIUM: Attendance: 65%",
    "Fees - HIGH: Fees pending: 100%"
]
```

---

## Testing Quick Commands

```bash
# Run all tests
cd backend
python test_risk_classifier.py

# Run specific test
python -m pytest test_risk_classifier.py::test_high_risk_marks_and_attendance -v
```

---

## Integration Checklist

- [ ] Import functions from correct module
- [ ] Validate inputs are in 0-100 range (auto-clamped)
- [ ] Check for None values before calling risk function
- [ ] Display confidence score to indicate certainty
- [ ] Show critical factors in UI (only MEDIUM/HIGH)
- [ ] Use recommendation text for action items
- [ ] Handle edge cases (missing data, invalid inputs)

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Risk level always LOW | Check if inputs are actually LOW threshold values |
| Confidence score seems random | It's intentional - randomized within range for variation |
| Result doesn't match expected | Check individual_risks - may have unexpected threshold boundary |
| High confidence on HIGH risk | Multiple HIGH factors = more certainty about risk |
| Missing critical factors | Only MEDIUM/HIGH factors appear - all LOW factors are hidden |

---

## Threshold Reference (For Easy Lookup)

| Factor | HIGH | MEDIUM | LOW |
|--------|------|--------|-----|
| **Marks** | <40 | 40-59 | ≥60 |
| **Attendance** | <60% | 60-74% | ≥75% |
| **Fees Pending** | 100% | 1-99% | 0% |

---

## Next Steps

1. Review complete documentation: `RISK_EVALUATION_SYSTEM.md`
2. Check test cases: `backend/test_risk_classifier.py`
3. Integrate into student dashboard
4. Add risk evaluation to student detail pages
5. Create intervention workflow for HIGH risk students
6. Monitor system accuracy and adjust thresholds as needed
