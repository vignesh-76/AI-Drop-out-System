/**
 * Student Risk Classification Module
 * 
 * Rule-based student risk evaluation system using three factors:
 * - Marks (0-100)
 * - Attendance (0-100)
 * - Fee Payment Status (0-100 as pending percentage)
 * 
 * Evaluates each factor independently and combines results using final risk rules.
 */

export interface IndividualRiskLevel {
  factor: "marks" | "attendance" | "fees";
  risk: "LOW" | "MEDIUM" | "HIGH";
  value: number; // The actual value of the factor
  reason: string; // Human-readable reason
}

export interface RiskClassification {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  confidence_score: number; // 0-100
  individual_risks: IndividualRiskLevel[]; // Breakdown by factor
  critical_factors: string[]; // List of concerning factors
}

/**
 * Evaluate risk level based on marks.
 * 
 * Rules:
 * - Marks >= 60 → LOW
 * - Marks 40-59 → MEDIUM
 * - Marks < 40 → HIGH
 */
function evaluateMarksRisk(marks: number): "LOW" | "MEDIUM" | "HIGH" {
  if (marks >= 60) {
    return "LOW";
  } else if (marks >= 40 && marks < 60) {
    return "MEDIUM";
  } else {
    return "HIGH";
  }
}

/**
 * Evaluate risk level based on attendance.
 * 
 * Rules:
 * - Attendance >= 75 → LOW
 * - Attendance 60-74 → MEDIUM
 * - Attendance < 60 → HIGH
 */
function evaluateAttendanceRisk(attendance: number): "LOW" | "MEDIUM" | "HIGH" {
  if (attendance >= 75) {
    return "LOW";
  } else if (attendance >= 60 && attendance < 75) {
    return "MEDIUM";
  } else {
    return "HIGH";
  }
}

/**
 * Evaluate risk level based on fee payment status.
 * 
 * Rules:
 * - Fees fully paid (0% pending) → LOW
 * - Fees partially paid (1-99% pending) → MEDIUM
 * - Fees not paid (100% pending) → HIGH
 */
function evaluateFeesRisk(
  fees_pending_percentage: number
): "LOW" | "MEDIUM" | "HIGH" {
  if (fees_pending_percentage === 0) {
    return "LOW";
  } else if (
    fees_pending_percentage > 0 &&
    fees_pending_percentage < 100
  ) {
    return "MEDIUM";
  } else {
    return "HIGH";
  }
}

/**
 * Determine final risk level based on individual factor risks.
 * 
 * Rules:
 * - If two or more conditions are HIGH → HIGH RISK
 * - If one HIGH or two or more MEDIUM → MEDIUM RISK
 * - If all are LOW → LOW RISK
 */
function determineFinalRiskLevel(
  marksRisk: "LOW" | "MEDIUM" | "HIGH",
  attendanceRisk: "LOW" | "MEDIUM" | "HIGH",
  feesRisk: "LOW" | "MEDIUM" | "HIGH"
): "LOW" | "MEDIUM" | "HIGH" {
  const riskFactors = [marksRisk, attendanceRisk, feesRisk];

  const highCount = riskFactors.filter((r) => r === "HIGH").length;
  const mediumCount = riskFactors.filter((r) => r === "MEDIUM").length;

  // Two or more HIGH → HIGH RISK
  if (highCount >= 2) {
    return "HIGH";
  }

  // One HIGH or two or more MEDIUM → MEDIUM RISK
  if (highCount >= 1 || mediumCount >= 2) {
    return "MEDIUM";
  }

  // All LOW → LOW RISK
  return "LOW";
}

/**
 * Calculate confidence score based on final risk level.
 * 
 * Rules:
 * - LOW → 80–100
 * - MEDIUM → 50–79
 * - HIGH → 30–49
 * 
 * Returns a random value within the appropriate range for variation.
 */
function calculateConfidenceScore(risk_level: "LOW" | "MEDIUM" | "HIGH"): number {
  if (risk_level === "LOW") {
    return Math.floor(Math.random() * (100 - 80 + 1)) + 80;
  } else if (risk_level === "MEDIUM") {
    return Math.floor(Math.random() * (79 - 50 + 1)) + 50;
  } else {
    // HIGH
    return Math.floor(Math.random() * (49 - 30 + 1)) + 30;
  }
}

/**
 * Classify student risk level based on three factors.
 * 
 * @param attendance_percentage - Student attendance (0-100)
 * @param average_marks - Average marks across subjects (0-100)
 * @param fees_pending_percentage - Percentage of fees pending (0-100)
 * @returns RiskClassification with complete breakdown
 * 
 * @example
 * ```typescript
 * const result = classifyStudentRisk(85, 75, 0);
 * console.log(result.risk_level); // "LOW"
 * console.log(result.confidence_score >= 80); // true
 * ```
 */
export function classifyStudentRisk(
  attendance_percentage: number,
  average_marks: number,
  fees_pending_percentage: number
): RiskClassification {
  // Clamp inputs to 0-100 range
  const attendance = Math.max(0, Math.min(100, attendance_percentage));
  const marks = Math.max(0, Math.min(100, average_marks));
  const fees = Math.max(0, Math.min(100, fees_pending_percentage));

  // Evaluate each factor independently
  const marksRisk = evaluateMarksRisk(marks);
  const attendanceRisk = evaluateAttendanceRisk(attendance);
  const feesRisk = evaluateFeesRisk(fees);

  // Build individual risk details
  const individualRisks: IndividualRiskLevel[] = [
    {
      factor: "marks",
      risk: marksRisk,
      value: marks,
      reason: `Marks: ${Math.round(marks)}%`,
    },
    {
      factor: "attendance",
      risk: attendanceRisk,
      value: attendance,
      reason: `Attendance: ${Math.round(attendance)}%`,
    },
    {
      factor: "fees",
      risk: feesRisk,
      value: fees,
      reason: `Fees pending: ${Math.round(fees)}%`,
    },
  ];

  // Determine final risk level
  const finalRisk = determineFinalRiskLevel(marksRisk, attendanceRisk, feesRisk);

  // Calculate confidence score
  const confidence = calculateConfidenceScore(finalRisk);

  // Build list of critical factors for display
  const criticalFactors: string[] = [];
  for (const risk of individualRisks) {
    if (risk.risk === "HIGH") {
      criticalFactors.push(
        `${risk.factor.charAt(0).toUpperCase() + risk.factor.slice(1)} - HIGH: ${risk.reason}`
      );
    } else if (risk.risk === "MEDIUM") {
      criticalFactors.push(
        `${risk.factor.charAt(0).toUpperCase() + risk.factor.slice(1)} - MEDIUM: ${risk.reason}`
      );
    }
  }

  return {
    risk_level: finalRisk,
    confidence_score: confidence,
    individual_risks: individualRisks,
    critical_factors: criticalFactors,
  };
}

/**
 * Get intervention recommendation based on risk classification.
 * 
 * @param risk_classification - RiskClassification object
 * @returns String recommendation for intervention
 */
export function getRiskRecommendation(
  risk_classification: RiskClassification
): string {
  if (risk_classification.risk_level === "HIGH") {
    return "Immediate intervention required. Schedule meeting with student and counselor.";
  } else if (risk_classification.risk_level === "MEDIUM") {
    return "Monitor closely. Provide academic support and fee assistance options.";
  } else {
    return "No immediate action needed. Continue regular monitoring.";
  }
}

/**
 * Get color for risk level (for UI display)
 * @param risk_level - Risk level string
 * @returns Color code
 */
export function getRiskColor(risk_level: "LOW" | "MEDIUM" | "HIGH"): string {
  switch (risk_level) {
    case "HIGH":
      return "#ef4444"; // red
    case "MEDIUM":
      return "#f59e0b"; // amber
    case "LOW":
      return "#10b981"; // green
  }
}

/**
 * Get badge variant for risk level (for shadcn/ui Badge)
 * @param risk_level - Risk level string
 * @returns Badge variant
 */
export function getRiskBadgeVariant(
  risk_level: "LOW" | "MEDIUM" | "HIGH"
): "default" | "secondary" | "destructive" | "outline" {
  switch (risk_level) {
    case "HIGH":
      return "destructive";
    case "MEDIUM":
      return "secondary";
    case "LOW":
      return "default";
  }
}
