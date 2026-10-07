import { Transaction, RiskLevel } from "@/types";
import {
  RiskAssessment,
  RiskFactor,
  Anomaly,
  RuleViolation,
  RecommendedAction,
} from "./types";
import { analyzeBehavioralBaseline } from "./behavioral-baseline";
import { analyzeVelocity } from "./velocity-detector";
import { detectAccountTakeover } from "./ato-detector";
import { detectMuleActivity } from "./mule-detector";
import { detectScamPattern } from "./scam-detector";
import { evaluateRules } from "./rule-engine";
import { globalNetworkIntelligence } from "./network-analyzer";

export function evaluateRisk(
  txn: Partial<Transaction>,
  options?: {
    mlProbability?: number;
    customHistory?: Transaction[];
  }
): RiskAssessment {
  const transactionId = txn.id || `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const now = new Date();
  const evaluatedAt = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // 1. Run All Sub-Detectors
  const behavioral = analyzeBehavioralBaseline(txn);
  const velocity = analyzeVelocity(txn, options?.customHistory);
  const ato = detectAccountTakeover(txn);
  const mule = detectMuleActivity(txn);
  const scam = detectScamPattern(txn);
  const rules = evaluateRules(txn);
  const network = globalNetworkIntelligence.assessTransaction(txn);

  // 2. Weights Matrix (Sum = 1.0)
  const weights = {
    behavioral: 0.22,
    velocity: 0.18,
    mule: 0.18,
    ato: 0.16,
    network: 0.14,
    scam: 0.12,
  };

  const weightedSum =
    behavioral.behavioralScore * weights.behavioral +
    velocity.velocityScore * weights.velocity +
    mule.muleScore * weights.mule +
    ato.atoScore * weights.ato +
    network.riskScore * weights.network +
    scam.scamScore * weights.scam;

  let rawScore = Math.round(weightedSum);

  // 3. Rule Engine Scrutiny Floor
  // If critical regulatory or security rule was violated, risk score cannot drop below high/critical floor
  if (rules.highestSeverity === "Critical") {
    rawScore = Math.max(rawScore, 88);
  } else if (rules.highestSeverity === "High") {
    rawScore = Math.max(rawScore, 72);
  }

  // 4. ML Model Blending (if ML probability provided)
  let finalScore = rawScore;
  if (options?.mlProbability !== undefined && options.mlProbability !== null) {
    const mlScore = Math.round(options.mlProbability * 100);
    // 75% Multi-signal rules & analytics + 25% deep neural network probability
    finalScore = Math.round(rawScore * 0.75 + mlScore * 0.25);
  }

  finalScore = Math.min(99, Math.max(5, finalScore));

  // 5. Categorize Risk Level
  let riskLevel: RiskLevel = "Low";
  if (finalScore >= 85) riskLevel = "Critical";
  else if (finalScore >= 70) riskLevel = "High";
  else if (finalScore >= 45) riskLevel = "Medium";

  // 6. Aggregate Anomalies and Risk Factors
  const allAnomalies: Anomaly[] = [
    ...behavioral.anomalies,
    ...velocity.anomalies,
    ...ato.anomalies,
    ...mule.anomalies,
    ...scam.anomalies,
  ];

  const factors: RiskFactor[] = [
    ...behavioral.factors,
    velocity.factor,
    ato.factor,
    mule.factor,
    {
      name: "Network Graph Topology",
      score: network.riskScore,
      weight: weights.network,
      description:
        network.hopDistance === 0
          ? "Direct member of flagged syndicate cluster"
          : network.hopDistance === 1
          ? `1-hop distance to Mule Cluster #${network.clusterId || 17}`
          : "Clean network topology distance",
      deviated: network.riskScore > 60,
    },
    scam.factor,
  ];

  // 7. Generate Recommended Interventions with Strict Human Oversight Flag
  const recommendedActions: RecommendedAction[] = [];

  if (riskLevel === "Critical") {
    recommendedActions.push(
      {
        action: "HOLD",
        priority: "IMMEDIATE",
        reason: "Hold outgoing settlement to prevent irreversible fund dissipation pending human review.",
        humanOversightRequired: true,
      },
      {
        action: "FREEZE_RECIPIENT",
        priority: "IMMEDIATE",
        reason: `Temporarily restrict counterparty wallet ${txn.recipient || "target"} from cash-out or secondary transfers.`,
        humanOversightRequired: true,
      },
      {
        action: "STEP_UP_2FA",
        priority: "HIGH",
        reason: "Prompt customer registered primary SIM for interactive biometric / OTP re-authentication.",
        humanOversightRequired: false,
      },
      {
        action: "ESCALATE_LEGAL",
        priority: "HIGH",
        reason: "Log dossier for AML compliance and law enforcement subpoena staging.",
        humanOversightRequired: true,
      }
    );
  } else if (riskLevel === "High") {
    recommendedActions.push(
      {
        action: "HOLD",
        priority: "HIGH",
        reason: "Hold transaction in analyst review queue for step-up verification.",
        humanOversightRequired: true,
      },
      {
        action: "STEP_UP_2FA",
        priority: "HIGH",
        reason: "Trigger automated biometric step-up challenge.",
        humanOversightRequired: false,
      },
      {
        action: "MONITOR",
        priority: "MEDIUM",
        reason: "Place customer account under 24-hour enhanced surveillance window.",
        humanOversightRequired: false,
      }
    );
  } else if (riskLevel === "Medium") {
    recommendedActions.push(
      {
        action: "MONITOR",
        priority: "MEDIUM",
        reason: "Allow transaction with stepped-up behavioral telemetry for consecutive 48 hours.",
        humanOversightRequired: false,
      },
      {
        action: "STEP_UP_2FA",
        priority: "LOW",
        reason: "Require standard SMS OTP re-verification for subsequent transfers.",
        humanOversightRequired: false,
      }
    );
  } else {
    recommendedActions.push({
      action: "ALLOW",
      priority: "LOW",
      reason: "Approve transaction and log standard audit telemetry.",
      humanOversightRequired: false,
    });
  }

  // 8. Deterministic Confidence Calculation
  // Derived from the concordant agreement across independent risk detectors
  const deviatedCount = factors.filter((f) => f.deviated).length;
  let confidence = 85;
  if (deviatedCount >= 4 || (riskLevel === "Critical" && rules.triggeredRules.length >= 2)) {
    confidence = Math.min(98, 92 + deviatedCount);
  } else if (deviatedCount === 0 && riskLevel === "Low") {
    confidence = 96;
  } else {
    confidence = 88;
  }

  // 9. Structured Human-Readable Explanation
  const topDeviations = factors
    .filter((f) => f.deviated)
    .sort((a, b) => b.score - a.score)
    .map((f) => f.name);

  let explanationSummary = "";
  if (riskLevel === "Critical" || riskLevel === "High") {
    explanationSummary = `Transaction received a ${riskLevel} risk rating (${finalScore}/100) driven by ${
      topDeviations.length > 0 ? topDeviations.slice(0, 3).join(", ") : "severe multi-vector anomalies"
    }. ${
      rules.triggeredRules.length > 0
        ? `Triggered ${rules.triggeredRules.length} compliance rules including ${rules.triggeredRules[0].ruleName}.`
        : ""
    } Human analyst oversight required before fund release.`;
  } else if (riskLevel === "Medium") {
    explanationSummary = `Transaction presents moderate deviations (${finalScore}/100) primarily in ${
      topDeviations.length > 0 ? topDeviations[0] : "spending envelope"
    }. Account flagged for 24-hour telemetry surveillance.`;
  } else {
    explanationSummary = `Transaction conforms to historical spending baseline and trusted hardware fingerprints (${finalScore}/100). Approved under normal telemetry.`;
  }

  return {
    transactionId,
    riskScore: finalScore,
    riskLevel,
    confidence,
    evaluatedAt,
    mlProbability: options?.mlProbability,
    factors,
    anomalies: allAnomalies,
    rulesTriggered: rules.triggeredRules,
    networkRisk: network,
    recommendedActions,
    explanationSummary,
  };
}
