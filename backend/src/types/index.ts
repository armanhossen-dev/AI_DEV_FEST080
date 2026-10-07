// ==============================================================================
// upay Sentinel — Enterprise Trust & Risk Intelligence Type Definitions
// ==============================================================================

export type UserRole = "investigator" | "analyst" | "admin";

export interface UserProfile {
  id: string;
  firebase_uid: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type TransactionType =
  | "send_money"
  | "merchant_payment"
  | "cash_out"
  | "bill_payment"
  | "recharge"
  | "Wallet Transfer"
  | "Merchant Pay"
  | "Cash Out"
  | "Add Money"
  | "Mobile Recharge"
  | "Utility Bill";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "held"
  | "blocked"
  | "under_review"
  | "Approved"
  | "Monitoring"
  | "Flagged"
  | "Investigating"
  | "Blocked";

export type RiskSeverity = "low" | "medium" | "high" | "critical" | "Low" | "Medium" | "High" | "Critical";
export type RiskLevel = "low" | "medium" | "high" | "critical" | "Low" | "Medium" | "High" | "Critical";

export interface DbTransaction {
  id: string;
  transaction_reference: string;
  sender_name: string;
  sender_phone_masked: string;
  receiver_name: string;
  receiver_phone_masked: string;
  amount: number;
  currency: string;
  transaction_type: TransactionType;
  timestamp: string;
  device_id: string;
  device_new: boolean;
  location: string;
  beneficiary_new: boolean;
  ip_risk: number;
  transaction_status: TransactionStatus;
  created_at: string;
}

// Legacy alias for existing UI mockups
export interface Transaction {
  id: string;
  customer?: string;
  recipient?: string;
  amount: number;
  time?: string;
  timestamp?: number | string;
  type?: any;
  device?: string;
  isNewDevice?: boolean;
  location?: string;
  isNewLocation?: boolean;
  riskLevel?: any;
  riskScore?: number;
  status?: any;
  flags?: string[];
  [key: string]: any;
}

export interface TransactionFeatures {
  id?: string;
  transaction_id: string;
  amount_deviation: number;
  velocity_score: number;
  time_anomaly_score: number;
  device_anomaly_score: number;
  location_anomaly_score: number;
  beneficiary_anomaly_score: number;
  historical_behavior_score: number;
  failed_attempt_score: number;
  account_age_score: number;
  created_at?: string;
}

export interface RiskFactorItem {
  id?: string;
  assessment_id?: string;
  factor_code: string;
  factor_name: string;
  description: string;
  contribution: number;
  severity: RiskSeverity;
  evidence: string;
  created_at?: string;
}

export interface RiskAssessment {
  id: string;
  transaction_id: string;
  fraud_score: number;
  anomaly_score: number;
  account_risk_score: number;
  final_risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  model_version: string;
  explanation_summary: string;
  recommended_action: string;
  created_at: string;
  factors?: RiskFactorItem[];
}

export type InvestigationStatus =
  | "open"
  | "investigating"
  | "resolved"
  | "escalated"
  | "Investigating"
  | "Pending Review"
  | "Monitoring"
  | "Resolved"
  | "Escalated";

export type InvestigationDecision = "approved" | "held" | "blocked" | "false_positive";

export interface InvestigationCase {
  id: string;
  transaction_id?: string;
  assigned_to?: string | null;
  status: InvestigationStatus;
  priority?: RiskSeverity;
  investigator_notes?: string | null;
  final_decision?: InvestigationDecision | null;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string | null;
  transaction?: DbTransaction;
  assessment?: RiskAssessment;
  actions?: InvestigationAction[];
  customer?: string;
  amount?: number;
  reason?: string;
  analyst?: string;
  updated?: string;
  createdTime?: string;
  exposure?: number;
  transactionsCount?: number;
  networkConnections?: number;
  riskScore?: number;
  summary?: string;
  recommendation?: string;
  confidence?: number;
  riskLevel?: any;
  [key: string]: any;
}

export interface InvestigationAction {
  id: string;
  investigation_id: string;
  actor_id?: string | null;
  actor_name: string;
  action_type:
    | "opened_case"
    | "assigned_case"
    | "added_note"
    | "changed_priority"
    | "held_transaction"
    | "blocked_transaction"
    | "approved_transaction"
    | "escalated_case"
    | "marked_false_positive";
  action_details: Record<string, any>;
  created_at: string;
}

export interface BehavioralBaseline {
  customer_id: string;
  average_amount: number;
  median_amount: number;
  max_normal_amount: number;
  normal_hours_start: number;
  normal_hours_end: number;
  avg_daily_count: number;
  known_devices: string[];
  known_locations: string[];
  known_beneficiaries: string[];
}

export interface EvaluationResult {
  features: TransactionFeatures;
  fraud_score: number;
  anomaly_score: number;
  account_risk_score: number;
  final_risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  explanation_summary: string;
  recommended_action: string;
  factors: RiskFactorItem[];
}

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  expectedRiskLevel: RiskLevel;
  transaction: Omit<DbTransaction, "id" | "created_at">;
  baseline: BehavioralBaseline;
}

export interface DashboardMetrics {
  transactionsMonitored: number;
  highRiskTransactions: number;
  criticalAlerts: number;
  underInvestigation: number;
  blockedTransactions: number;
  estimatedPreventedLoss: number;
  falsePositiveRate: number;
}

// Legacy types for compatibility
export type NavigationPage =
  | "overview"
  | "transactions"
  | "risk"
  | "network"
  | "investigations"
  | "investigation"
  | "customers"
  | "alerts"
  | "analytics";

export interface RiskFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
  deviated: boolean;
  [key: string]: any;
}

export interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  isCritical?: boolean;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: "customer" | "recipient" | "device" | "merchant" | "agent";
  risk: any;
  x: number;
  y: number;
  clusterId?: number;
  amount?: number;
  details?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  amount?: number;
  isHot?: boolean;
  type?: "transfer" | "shared_device" | "agent_cashout";
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  riskLevel: any;
  riskScore: number;
  kycStatus: "Verified" | "Tier-1" | "Pending";
  [key: string]: any;
}

export interface AlertItem {
  id: string;
  title: string;
  severity: any;
  time?: string;
  timeAgo?: string;
  description: string;
  read?: boolean;
  unread?: boolean;
  iconType?: string;
  confidence?: number;
  relatedId?: string;
  [key: string]: any;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "sentinel" | "analyst" | "ai";
  text: string;
  time?: string;
  timestamp?: string;
  suggestedActions?: string[];
  evidenceUsed?: string[];
  disclaimer?: string;
  [key: string]: any;
}
