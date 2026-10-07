import { TransactionFeatures, RiskFactorItem, RiskLevel } from "@/types";

export interface ExplanationOutput {
  summary: string;
  factors: RiskFactorItem[];
}

export function generateExplanation(
  features: TransactionFeatures,
  finalRiskScore: number,
  riskLevel: RiskLevel,
  amount: number
): ExplanationOutput {
  const factors: RiskFactorItem[] = [];

  // 1. Amount factor
  if (features.amount_deviation > 2.5) {
    const contribution = Math.min(28, Math.round(features.amount_deviation * 2.2));
    factors.push({
      factor_code: "ABNORMAL_AMOUNT",
      factor_name: "Abnormal Amount Deviation",
      description: `Transaction amount (৳${amount.toLocaleString()}) deviates by ${features.amount_deviation}× from the user's historical median pattern.`,
      contribution,
      severity: features.amount_deviation > 8 ? "critical" : "high",
      evidence: `Amount: ৳${amount.toLocaleString()} vs median baseline. Deviation ratio: ${features.amount_deviation}x`,
    });
  }

  // 2. Beneficiary factor
  if (features.beneficiary_anomaly_score >= 70) {
    factors.push({
      factor_code: "NEW_BENEFICIARY",
      factor_name: "Unrecognized Beneficiary",
      description: "First-time transfer destination wallet with no prior transaction history.",
      contribution: 24,
      severity: "high",
      evidence: "Beneficiary wallet added within 10 minutes of transfer initiation",
    });
  }

  // 3. Device factor
  if (features.device_anomaly_score >= 70) {
    factors.push({
      factor_code: "NEW_DEVICE",
      factor_name: "Unrecognized Device Fingerprint",
      description: "Transaction originated from an unfamiliar hardware identifier not registered on account.",
      contribution: 18,
      severity: "high",
      evidence: "New device fingerprint detected without prior 2FA confirmation",
    });
  }

  // 4. Velocity factor
  if (features.velocity_score >= 50) {
    factors.push({
      factor_code: "HIGH_VELOCITY",
      factor_name: "High Transaction Velocity",
      description: "Multiple high-frequency outbound transfers executed in an unusually short window.",
      contribution: 16,
      severity: features.velocity_score > 70 ? "critical" : "medium",
      evidence: `Velocity index: ${features.velocity_score}/100. Rapid drain pattern detected.`,
    });
  }

  // 5. Unusual time factor
  if (features.time_anomaly_score >= 50) {
    factors.push({
      factor_code: "UNUSUAL_TIME",
      factor_name: "Off-Hours Activity",
      description: "Transfer initiated during off-peak sleep hours (01:00 AM - 05:00 AM).",
      contribution: 12,
      severity: "medium",
      evidence: "Initiated at unusual hour outside normal 08:00-22:00 window",
    });
  }

  // 6. Location factor
  if (features.location_anomaly_score >= 60) {
    factors.push({
      factor_code: "LOCATION_MISMATCH",
      factor_name: "Geographic Location Mismatch",
      description: "Transaction location diverges from customary regional cluster.",
      contribution: 10,
      severity: "medium",
      evidence: "Geographic discrepancy with recent activity",
    });
  }

  // If low risk / safe transaction
  if (factors.length === 0) {
    factors.push({
      factor_code: "BASELINE_CONCORDANCE",
      factor_name: "Consistent Behavioral Baseline",
      description: "Transaction parameters, device, and schedule match established historical norms.",
      contribution: 5,
      severity: "low",
      evidence: "Known device + normal transfer amount + active daytime window",
    });
  }

  // Sort factors by contribution descending
  factors.sort((a, b) => b.contribution - a.contribution);

  // Generate explainable plain-language summary for investigators
  let summary = "";
  if (riskLevel === "critical") {
    summary = `CRITICAL RISK: Transaction amount of ৳${amount.toLocaleString()} is ${features.amount_deviation}× normal baseline from an unrecognized device to a new recipient wallet. Rapid velocity and off-hours execution indicate potential account takeover or syndicate mule transfer.`;
  } else if (riskLevel === "high") {
    summary = `HIGH RISK: Significant deviation observed with ৳${amount.toLocaleString()} outbound transfer involving unfamiliar device or unverified beneficiary. Additional analyst review required before fund release.`;
  } else if (riskLevel === "medium") {
    summary = `ELEVATED ANOMALY: Moderate behavioral divergence detected. While not definitively fraudulent, the transaction departs from standard baseline patterns. Continued behavioral monitoring recommended.`;
  } else {
    summary = `NORMAL ACTIVITY: Transaction conforms to established user habits, trusted device history, and expected amount ranges. Safe for immediate automated processing.`;
  }

  return { summary, factors };
}
