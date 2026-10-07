import { RiskLevel } from "@/types";

export interface FusionOutput {
  final_risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
}

export function fuseRiskScores(
  fraudScore: number,
  anomalyScore: number,
  behaviorScore: number,
  contextScoreOrMultiplier = 0
): FusionOutput {
  // Configurable weights matching Section 14 & 16:
  // 0.45 * Fraud + 0.30 * Anomaly + 0.15 * Behavior + 0.10 * Context
  let rawFused: number;
  if (contextScoreOrMultiplier <= 1.5 && contextScoreOrMultiplier > 0) {
    rawFused = (fraudScore * 0.45 + anomalyScore * 0.30 + behaviorScore * 0.15 + 10 * 0.10) * contextScoreOrMultiplier;
  } else {
    rawFused = fraudScore * 0.45 + anomalyScore * 0.30 + behaviorScore * 0.15 + contextScoreOrMultiplier * 0.10;
  }

  // If one of the primary models indicates critical danger, elevate the composite fusion
  if (fraudScore >= 85 || (fraudScore >= 75 && anomalyScore >= 75)) {
    rawFused = Math.max(rawFused, Math.round(Math.max(fraudScore, anomalyScore) * 0.95));
  }

  const final_risk_score = Math.min(100, Math.max(0, Math.round(rawFused)));

  // Risk Level thresholds as strictly specified
  let risk_level: RiskLevel;
  if (final_risk_score >= 80) {
    risk_level = "critical";
  } else if (final_risk_score >= 60) {
    risk_level = "high";
  } else if (final_risk_score >= 30) {
    risk_level = "medium";
  } else {
    risk_level = "low";
  }

  // Confidence calculation is based on signal concordance and data completeness, NOT equal to risk score
  const scoreDivergence = Math.abs(fraudScore - anomalyScore);
  const alignmentBonus = Math.max(0, 20 - scoreDivergence * 0.25);
  const baselineConfidence = 70;
  const calculatedConfidence = Math.min(96, Math.max(55, Math.round(baselineConfidence + alignmentBonus)));

  return {
    final_risk_score,
    risk_level,
    confidence: calculatedConfidence,
  };
}
