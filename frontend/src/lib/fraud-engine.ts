import { RiskLevel, Transaction, RiskFactor } from "@/types";
import { evaluateRisk, RiskAssessment } from "./risk-engine";

export interface ScoringResult {
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  factors: RiskFactor[];
  flags: string[];
  recommendation: string;
  assessment?: RiskAssessment;
}

export function scoreTransaction(
  txn: Partial<Transaction>,
  _customerBaseline?: { avgAmount?: number; maxAmount?: number; knownDevices?: string[] }
): ScoringResult {
  const assessment = evaluateRisk(txn);

  // Extract human-readable flags from rules and anomalies
  const flags: string[] = [];
  assessment.rulesTriggered.forEach((r) => flags.push(r.description));
  assessment.anomalies.forEach((a) => {
    if (!flags.includes(a.description)) flags.push(a.description);
  });

  return {
    riskScore: assessment.riskScore,
    riskLevel: assessment.riskLevel,
    confidence: assessment.confidence,
    factors: assessment.factors,
    flags: flags.length > 0 ? flags : txn.flags || [],
    recommendation:
      assessment.recommendedActions.find((a) => a.priority === "IMMEDIATE" || a.priority === "HIGH")?.reason ||
      assessment.explanationSummary,
    assessment,
  };
}
