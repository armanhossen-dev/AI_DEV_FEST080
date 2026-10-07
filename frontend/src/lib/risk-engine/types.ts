import { RiskLevel, Transaction, TransactionType } from "@/types";
export type { RiskLevel, Transaction, TransactionType };

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  deviated: boolean;
}

export interface Anomaly {
  type: "AMOUNT_DEVIATION" | "NEW_DEVICE" | "TIME_ANOMALY" | "VELOCITY_BURST" | "GEO_JUMP" | "NETWORK_PROXIMITY" | "MULE_PASS_THROUGH";
  severity: RiskLevel;
  description: string;
  deviationScore: number;
  metadata?: Record<string, unknown>;
}

export interface RuleViolation {
  ruleId: string;
  ruleName: string;
  severity: RiskLevel;
  description: string;
  threshold?: string | number;
  actualValue?: string | number;
}

export interface NetworkRiskAssessment {
  hubProximity: number; // 0 - 100
  hopDistance: number;
  clusterId?: number;
  isMuleCluster: boolean;
  connectedFlaggedNodes: string[];
  riskScore: number; // 0 - 100
}

export interface RecommendedAction {
  action: "ALLOW" | "MONITOR" | "STEP_UP_2FA" | "HOLD" | "FREEZE_RECIPIENT" | "ESCALATE_LEGAL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "IMMEDIATE";
  reason: string;
  humanOversightRequired: boolean;
}

export interface RiskAssessment {
  transactionId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  evaluatedAt: string;
  mlProbability?: number;
  factors: RiskFactor[];
  anomalies: Anomaly[];
  rulesTriggered: RuleViolation[];
  networkRisk: NetworkRiskAssessment;
  recommendedActions: RecommendedAction[];
  explanationSummary: string;
}

export interface CustomerBaseline {
  customerId: string;
  name: string;
  avgAmount: number;
  stdAmount: number;
  maxAmount: number;
  typicalHours: { startHour: number; endHour: number }; // 24-hr format
  knownDevices: string[];
  knownLocations: string[];
  recentTransactionCount24h: number;
  accountAgeDays: number;
  kycTier: "Tier-1" | "Verified" | "Enterprise";
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  isoTime: string;
  eventType:
    | "TRANSACTION_EVALUATED"
    | "ALERT_TRIGGERED"
    | "CASE_CREATED"
    | "CASE_STATUS_CHANGED"
    | "ANALYST_ACTION"
    | "STEP_UP_CHALLENGE"
    | "MODEL_EVALUATED"
    | "SCENARIO_INJECTED"
    | "SYSTEM_CONFIG";
  actor: string; // e.g. "SYSTEM_SENTINEL", "ANALYST: Arman Hossen"
  relatedId?: string; // transactionId or caseId
  details: string;
  metadata?: Record<string, unknown>;
}

export interface ModelMetrics {
  totalSamples: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
  falsePositiveRate: number;
  evaluatedAt: string;
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  category: "ATO" | "MULE_RING" | "VELOCITY" | "SIM_SWAP" | "NORMAL";
  expectedRiskLevel: RiskLevel;
  transactionPayload: Partial<Transaction> & {
    historicalContext?: {
      priorTransactionsIn10m?: number;
      pinResetMinutesAgo?: number;
      simSwapMinutesAgo?: number;
      linkedMuleCluster?: number;
    };
  };
}
