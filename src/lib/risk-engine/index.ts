import { DbTransaction, BehavioralBaseline, EvaluationResult } from "@/types";
import { extractFeatures } from "./feature-extraction";
import { calculateFraudScore } from "./fraud-scoring";
import { calculateAnomalyScore } from "./anomaly-scoring";
import { fuseRiskScores } from "./risk-fusion";
import { generateExplanation } from "./explanation-generation";
import { recommendAction } from "./action-recommendation";

export * from "./feature-extraction";
export * from "./fraud-scoring";
export * from "./anomaly-scoring";
export * from "./risk-fusion";
export * from "./explanation-generation";
export * from "./action-recommendation";

/**
 * Evaluates a transaction through the complete multi-stage Sentinel Risk Engine:
 * Transaction -> Feature Analysis -> Fraud Model + Anomaly Model -> Risk Fusion -> Explainability -> Action Recommendation
 */
export function evaluateTransaction(
  transaction: DbTransaction | Omit<DbTransaction, "id" | "created_at">,
  baseline?: BehavioralBaseline
): EvaluationResult {
  // 1. Feature Analysis
  const features = extractFeatures(transaction, baseline);

  // 2. Fraud Risk Model (Deterministic weighted signals)
  const fraudScore = calculateFraudScore(features);

  // 3. Behavioral Anomaly Model (Deviation from baseline)
  const anomalyScore = calculateAnomalyScore(features);

  // 4. Account Risk Model (Baseline risk based on account age & prior flags)
  const accountRiskScore = Math.min(100, Math.round(features.account_age_score * 0.8 + features.failed_attempt_score * 0.4));

  // 5. Risk Fusion (Composite score, risk level, confidence)
  const { final_risk_score, risk_level, confidence } = fuseRiskScores(
    fraudScore,
    anomalyScore,
    accountRiskScore
  );

  // 6. Explainable AI (What, Why, Evidence, Impact)
  const { summary: explanation_summary, factors } = generateExplanation(
    features,
    final_risk_score,
    risk_level,
    Number(transaction.amount)
  );

  // 7. Recommended Action Engine (Advisory guidance for human investigators)
  const recommendation = recommendAction(risk_level, final_risk_score);

  return {
    features,
    fraud_score: fraudScore,
    anomaly_score: anomalyScore,
    account_risk_score: accountRiskScore,
    final_risk_score,
    risk_level,
    confidence,
    explanation_summary,
    recommended_action: recommendation.title,
    factors,
  };
}
