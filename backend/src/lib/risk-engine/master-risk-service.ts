import { supabase, isSupabaseConfigured } from "../supabase/client";
import { extractFeatures } from "./feature-extraction";
import { calculateFraudScore } from "./fraud-scoring";
import { calculateAnomalyScore } from "./anomaly-scoring";
import { compareBehavioralBaseline } from "./behavior-model";
import { fuseRiskScores } from "./risk-fusion";
import { generateExplanation } from "./explanation-generation";
import { recommendAction, RecommendationOutput } from "./action-recommendation";
import { DbTransaction, BehavioralBaseline, RiskFactorItem, RiskLevel } from "../../types";

export interface MasterRiskAnalysisResult {
  transactionId: string;
  fraudProbability: number;
  fraudScore: number;
  anomalyScore: number;
  behaviorScore: number;
  contextualScore: number;
  finalRiskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  factors: RiskFactorItem[];
  recommendation: RecommendationOutput;
  modelVersion: string;
}

/**
 * Executes the complete end-to-end multi-stage risk evaluation pipeline for a transaction.
 *
 * Pipeline:
 * 1. Load transaction telemetry
 * 2. Load customer behavioral baseline profile
 * 3. Load recent customer transaction history for velocity metrics
 * 4. Derive engineered risk features
 * 5. Compute supervised XGBoost fraud score
 * 6. Compute unsupervised Isolation Forest anomaly score
 * 7. Compute customer behavioral deviation score
 * 8. Fuse scores into a calibrated 0-100 composite risk score with separate confidence
 * 9. Deconstruct top explainable risk factors with observed evidence
 * 10. Generate advisory recommendation (ALLOW / MONITOR / VERIFY / HOLD)
 * 11. Persist risk assessment and factors to database
 */
export async function analyzeTransaction(transactionId: string): Promise<MasterRiskAnalysisResult> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Master risk evaluation requires database access.");
  }

  // 1. Load transaction
  const { data: txn, error: txnErr } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (txnErr || !txn) {
    throw new Error(`Transaction ${transactionId} not found: ${txnErr?.message}`);
  }

  // 2. Load customer behavioral baseline
  let baseline: BehavioralBaseline = {
    customer_id: txn.sender_name,
    average_amount: 2200,
    median_amount: 1850,
    max_normal_amount: 10000,
    normal_hours_start: 8,
    normal_hours_end: 22,
    avg_daily_count: 2,
    known_devices: [txn.device_id],
    known_locations: [txn.location],
    known_beneficiaries: [],
  };

  const { data: profile } = await supabase
    .from("customer_behavior_profiles")
    .select("*")
    .eq("customer_identifier", txn.sender_name)
    .maybeSingle();

  if (profile) {
    baseline = {
      customer_id: profile.customer_identifier,
      average_amount: Number(profile.average_amount) || 2200,
      median_amount: Number(profile.median_amount) || 1850,
      max_normal_amount: (Number(profile.median_amount) || 1850) * 4,
      normal_hours_start: profile.normal_transaction_start_hour ?? 8,
      normal_hours_end: profile.normal_transaction_end_hour ?? 22,
      avg_daily_count: profile.transaction_count_daily ?? 2,
      known_devices: [txn.device_id],
      known_locations: [profile.typical_location || txn.location],
      known_beneficiaries: [],
    };
  }

  // 3. Load recent customer transaction history for velocity metrics
  const { data: recentTxns } = await supabase
    .from("transactions")
    .select("*")
    .eq("sender_name", txn.sender_name)
    .order("timestamp", { ascending: false })
    .limit(10);

  // 4. Derive engineered features
  const features = extractFeatures(txn, baseline);

  // 5. Compute Supervised Fraud Score (0-100) & Probability (0-1)
  const fraudScore = calculateFraudScore(features);
  const fraudProbability = Math.round((fraudScore / 100) * 100) / 100;

  // 6. Compute Unsupervised Anomaly Score (0-100)
  const anomalyScore = calculateAnomalyScore(features);

  // 7. Compute Customer Behavioral Deviation Score (0-100)
  const behaviorComparison = compareBehavioralBaseline(txn, baseline);
  const behaviorScore = behaviorComparison.behavior_score;

  // 8. Contextual Score (IP risk + location novelty)
  const contextualScore = Math.min(100, Math.round((Number(txn.ip_risk) || 0) * 0.7 + (features.location_anomaly_score || 0) * 0.3));

  // 9. Risk Fusion (0-100 calibrated score with separate confidence)
  const fusion = fuseRiskScores(fraudScore, anomalyScore, behaviorScore, contextualScore);

  // 10. Explainable AI Factors
  const { factors } = generateExplanation(features, fusion.final_risk_score, fusion.risk_level, Number(txn.amount));

  // 11. Advisory Action Recommendation
  const recommendation = recommendAction(fusion.risk_level, fusion.final_risk_score);

  const modelVersion = "sentinel-hybrid-v2.1";

  // 12. Persist Risk Assessment to Supabase
  const { data: existingAssess } = await supabase
    .from("risk_assessments")
    .select("id")
    .eq("transaction_id", transactionId)
    .maybeSingle();

  let assessmentId = existingAssess?.id;

  const assessmentPayload = {
    transaction_id: transactionId,
    fraud_score: fraudScore,
    anomaly_score: anomalyScore,
    behavior_score: behaviorScore,
    contextual_score: contextualScore,
    final_risk_score: fusion.final_risk_score,
    risk_level: fusion.risk_level,
    confidence: fusion.confidence,
    model_version: modelVersion,
    explanation_summary: factors[0]?.description || "Multi-stage risk evaluation completed.",
    recommended_action: recommendation.title,
  };

  if (assessmentId) {
    await supabase.from("risk_assessments").update(assessmentPayload).eq("id", assessmentId);
  } else {
    const { data: insertedAssess } = await supabase
      .from("risk_assessments")
      .insert([assessmentPayload])
      .select("id")
      .single();
    assessmentId = insertedAssess?.id;
  }

  // 13. Persist Risk Factors
  if (assessmentId && factors.length > 0) {
    // Clear previous factors to prevent stale duplications
    await supabase.from("risk_factors").delete().eq("assessment_id", assessmentId);

    const factorInserts = factors.map((f) => ({
      assessment_id: assessmentId,
      factor_code: f.factor_code,
      factor_name: f.factor_name,
      description: f.description,
      contribution: f.contribution,
      severity: f.severity,
      evidence: f.evidence,
    }));

    await supabase.from("risk_factors").insert(factorInserts);
  }

  // 14. Persist Engineered Features
  await supabase
    .from("transaction_features")
    .upsert({
      transaction_id: transactionId,
      amount_deviation: features.amount_deviation,
      velocity_score: features.velocity_score,
      time_anomaly_score: features.time_anomaly_score,
      device_anomaly_score: features.device_anomaly_score,
      location_anomaly_score: features.location_anomaly_score,
      beneficiary_anomaly_score: features.beneficiary_anomaly_score,
      historical_behavior_score: features.historical_behavior_score,
      failed_attempt_score: features.failed_attempt_score,
      account_age_score: features.account_age_score,
    }, { onConflict: "transaction_id" });

  return {
    transactionId,
    fraudProbability,
    fraudScore,
    anomalyScore,
    behaviorScore,
    contextualScore,
    finalRiskScore: fusion.final_risk_score,
    riskLevel: fusion.risk_level,
    confidence: fusion.confidence,
    factors,
    recommendation,
    modelVersion,
  };
}

/**
 * Pure memory evaluation function for testing and fast simulations without database overhead.
 */
export function analyzeTransactionObject(
  txn: Omit<DbTransaction, "id" | "created_at"> & { id?: string },
  baseline: BehavioralBaseline
): MasterRiskAnalysisResult {
  const features = extractFeatures(txn, baseline);
  const fraudScore = calculateFraudScore(features);
  const fraudProbability = Math.round((fraudScore / 100) * 100) / 100;
  const anomalyScore = calculateAnomalyScore(features);
  const behaviorComparison = compareBehavioralBaseline(txn, baseline);
  const behaviorScore = behaviorComparison.behavior_score;
  const contextualScore = Math.min(100, Math.round((Number(txn.ip_risk) || 0) * 0.7 + (features.location_anomaly_score || 0) * 0.3));

  const fusion = fuseRiskScores(fraudScore, anomalyScore, behaviorScore, contextualScore);
  const { factors } = generateExplanation(features, fusion.final_risk_score, fusion.risk_level, Number(txn.amount));
  const recommendation = recommendAction(fusion.risk_level, fusion.final_risk_score);

  return {
    transactionId: txn.id || "TXN-SIMULATED",
    fraudProbability,
    fraudScore,
    anomalyScore,
    behaviorScore,
    contextualScore,
    finalRiskScore: fusion.final_risk_score,
    riskLevel: fusion.risk_level,
    confidence: fusion.confidence,
    factors,
    recommendation,
    modelVersion: "sentinel-hybrid-v2.1",
  };
}
