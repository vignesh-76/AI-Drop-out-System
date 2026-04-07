# Student Risk Classification System

A comprehensive risk classification system that categorizes students into three risk levels (LOW, MEDIUM, HIGH) based on their academic and financial metrics.

## Features

- **Three Risk Levels**: LOW, MEDIUM, HIGH
- **Three Input Metrics**: Attendance%, Average Marks%, Fees Pending%
- **Confidence Scoring**: 0-100 scale based on severity
- **Critical Factors**: Identifies which factors contribute to risk
- **Recommendations**: Provides intervention recommendations
- **Available in**: Python (Backend) & TypeScript (Frontend)

## Risk Classification Rules

### HIGH RISK
Triggered when ANY of these conditions are true:
- Attendance < 50%
- Average Marks < 40%
- Fees Pending > 70%

**Confidence**: 70-100 (higher with more critical factors)

### MEDIUM RISK
Triggered when ANY of these conditions are true (and no HIGH RISK):
- Attendance between 50-75%
- Average Marks between 40-60%
- Fees Pending between 30-70%

**Confidence**: 40-69 (higher with more factors)

### LOW RISK
All conditions must be true:
- Attendance > 75%
- Average Marks > 60%
- Fees Pending < 30%

**Confidence**: 0-39 (higher for better metrics)

## Python Usage (Backend)

### Installation
No extra dependencies required (uses only Python standard library).

### Basic Usage

```python
from risk_classifier import classify_student_risk, get_risk_recommendation

# Classify a student
result = classify_student_risk(
    attendance_percentage=65,
    average_marks=50,
    fees_pending_percentage=40
)

print(f"Risk Level: {result.risk_level}")
print(f"Confidence: {result.confidence_score}%")
print(f"Critical Factors: {result.critical_factors}")

# Get recommendation
recommendation = get_risk_recommendation(result)
print(f"Recommendation: {recommendation}")
```

### Output Example
```
Risk Level: MEDIUM
Confidence: 50%
Critical Factors: ['Medium attendance: 65%', 'Medium marks: 50%', 'Medium fees pending: 40%']
Recommendation: Monitor closely. Provide academic support and fee assistance options.
```

### Using with FastAPI

```python
from fastapi import APIRouter
from risk_classifier import classify_student_risk, get_risk_recommendation

router = APIRouter()

@router.post("/api/students/assess-risk")
async def assess_student_risk(
    attendance: float,
    average_marks: float,
    fees_pending: float
):
    classification = classify_student_risk(
        attendance_percentage=attendance,
        average_marks=average_marks,
        fees_pending_percentage=fees_pending
    )
    
    return {
        "risk_level": classification.risk_level,
        "confidence_score": classification.confidence_score,
        "critical_factors": classification.critical_factors,
        "recommendation": get_risk_recommendation(classification)
    }
```

## TypeScript Usage (Frontend)

### Installation
No extra dependencies required.

### Basic Usage

```typescript
import { classifyStudentRisk, getRiskRecommendation } from "@/lib/risk-classifier";

// Classify a student
const result = classifyStudentRisk(
  65, // attendance
  50, // average_marks
  40  // fees_pending
);

console.log(`Risk Level: ${result.risk_level}`);
console.log(`Confidence: ${result.confidence_score}%`);
console.log(`Factors: ${result.critical_factors}`);

// Get recommendation
const recommendation = getRiskRecommendation(result);
console.log(`Recommendation: ${recommendation}`);
```

### React Component Example

```typescript
import { classifyStudentRisk, getRiskBadgeVariant, getRiskColor } from "@/lib/risk-classifier";
import { Badge } from "@/components/ui/badge";

export function StudentRiskBadge({ 
  attendance, 
  marks, 
  fees 
}: StudentData) {
  const classification = classifyStudentRisk(attendance, marks, fees);
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={getRiskBadgeVariant(classification.risk_level)}>
        {classification.risk_level}
      </Badge>
      <span className="text-sm text-gray-600">
        Confidence: {classification.confidence_score}%
      </span>
    </div>
  );
}
```

### Table Cell Display

```typescript
import { classifyStudentRisk, getRiskColor } from "@/lib/risk-classifier";

export function RiskLevelCell({ student }: { student: Student }) {
  const classification = classifyStudentRisk(
    student.attendance,
    student.average_marks,
    student.fees_pending
  );
  
  return (
    <div 
      style={{ color: getRiskColor(classification.risk_level) }}
      className="font-medium"
    >
      {classification.risk_level}
    </div>
  );
}
```

## Response Structure

### RiskClassification Object

**Python:**
```python
@dataclass
class RiskClassification:
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    confidence_score: int  # 0-100
    critical_factors: list  # List of factor descriptions
```

**TypeScript:**
```typescript
interface RiskClassification {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  confidence_score: number; // 0-100
  critical_factors: string[];
}
```

## Examples

### Example 1: High Risk Student
```
Input: attendance=40, marks=35, fees=80
Output:
  risk_level: "HIGH"
  confidence_score: 90
  critical_factors: [
    "Very low attendance: 40%",
    "Very low marks: 35%",
    "High fees pending: 80%"
  ]
  recommendation: "Immediate intervention required..."
```

### Example 2: Medium Risk Student
```
Input: attendance=65, marks=50, fees=40
Output:
  risk_level: "MEDIUM"
  confidence_score: 50
  critical_factors: [
    "Medium attendance: 65%",
    "Medium marks: 50%",
    "Medium fees pending: 40%"
  ]
  recommendation: "Monitor closely..."
```

### Example 3: Low Risk Student
```
Input: attendance=85, marks=75, fees=20
Output:
  risk_level: "LOW"
  confidence_score: 85
  critical_factors: []
  recommendation: "No immediate action needed..."
```

## Testing

### Run Python Tests
```bash
cd backend
python test_risk_classifier.py
```

### Test Cases Included
- HIGH RISK: Low attendance, low marks, high fees
- MEDIUM RISK: Medium metrics in multiple areas
- LOW RISK: Excellent to borderline good metrics
- Edge cases: Clamping, multiple factors
- Recommendations: All three risk levels

## AI/ML Integration

This classifier can be used as:

1. **Preprocessing** for ML models (feature engineering)
2. **Rule-based baseline** for comparison with ML models
3. **Real-time scoring** without ML model latency
4. **Explainable AI** (clear which factors matter)
5. **Threshold for alerts** (HIGH/MEDIUM trigger notifications)

## Future Enhancements

- [ ] Weight adjustment based on institution policies
- [ ] Historical trend analysis
- [ ] Student engagement metrics
- [ ] Peer group comparison
- [ ] Predictive risk trajectory
- [ ] Integration with early warning system
- [ ] Custom risk thresholds per institution

## Files

- `backend/risk_classifier.py` - Python implementation
- `backend/test_risk_classifier.py` - Python tests
- `lib/risk-classifier.ts` - TypeScript implementation
- `RISK_CLASSIFICATION_USAGE.md` - This file

## License

Part of EduPulse Student Risk Analysis System
