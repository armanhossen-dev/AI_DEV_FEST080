import { Transaction } from "@/types";
import { RuleViolation, RiskLevel } from "./types";
import { KNOWN_MULE_WALLETS } from "./mule-detector";

export interface RuleEvaluationResult {
  triggeredRules: RuleViolation[];
  ruleRiskScore: number;
  highestSeverity: RiskLevel;
}

export function evaluateRules(
  txn: Partial<Transaction>,
  context?: {
    customerAvgAmount?: number;
    pinResetMinutesAgo?: number;
    simSwapDetected?: boolean;
  }
): RuleEvaluationResult {
  const amount = Number(txn.amount) || 0;
  const time = txn.time || "12:00 PM";
  const type = txn.type || "Wallet Transfer";
  const isNewDevice = txn.isNewDevice ?? false;
  const recipient = txn.recipient || "";
  const flagsLower = (txn.flags || []).map((f) => f.toLowerCase());
  const customerAvg = context?.customerAvgAmount || 6800;

  const triggeredRules: RuleViolation[] = [];

  // Check off-hours (12:00 AM - 05:00 AM)
  const isNocturnal =
    time.includes("AM") &&
    ["12", "01", "02", "03", "04", "05"].some((h) => time.startsWith(h));

  // 1. Bangladesh Bank High-Value Threshold Rule
  if (amount >= 50000) {
    triggeredRules.push({
      ruleId: "RULE_BB_HIGH_VALUE",
      ruleName: "Bangladesh Bank High-Value Transaction Threshold",
      severity: "High",
      description: `Transaction amount ৳${amount.toLocaleString()} meets or exceeds the Bangladesh Bank regulatory scrutiny threshold of ৳50,000.`,
      threshold: "৳50,000",
      actualValue: `৳${amount.toLocaleString()}`,
    });
  }

  // 2. Nocturnal High-Value Transfer Rule
  if (isNocturnal && amount >= 20000) {
    triggeredRules.push({
      ruleId: "RULE_NOCTURNAL_BURST",
      ruleName: "Nocturnal High-Value Liquidation Rule",
      severity: "High",
      description: `High-value transfer (৳${amount.toLocaleString()}) initiated during Bangladesh dormant nocturnal window (${time}).`,
      threshold: "৳20,000 between 00:00 - 05:00",
      actualValue: `${time} (৳${amount.toLocaleString()})`,
    });
  }

  // 3. New Device + Large Transfer Rule
  if (isNewDevice && amount >= customerAvg * 2.5) {
    triggeredRules.push({
      ruleId: "RULE_NEW_DEVICE_LARGE_TRANSFER",
      ruleName: "Unregistered Device Large Transfer Scrutiny",
      severity: "Critical",
      description: `Transfer of ৳${amount.toLocaleString()} (${(amount / customerAvg).toFixed(1)}× baseline) originating from unrecognized hardware fingerprint (${txn.device || "Unknown"}).`,
      threshold: `${(2.5 * customerAvg).toFixed(0)} on new device`,
      actualValue: `৳${amount.toLocaleString()} on ${txn.device || "Unknown"}`,
    });
  }

  // 4. Known Mule Network Interaction Rule
  if (KNOWN_MULE_WALLETS[recipient]) {
    const muleInfo = KNOWN_MULE_WALLETS[recipient];
    triggeredRules.push({
      ruleId: "RULE_FLAGGED_MULE_INTERACTION",
      ruleName: "Intervention on Sanctioned/Mule Wallet Interaction",
      severity: "Critical",
      description: `Target recipient ${recipient} is registered in active Mule Syndicate Cluster #${muleInfo.clusterId} (${muleInfo.role}).`,
      threshold: "Clean recipient status",
      actualValue: `Mule Cluster #${muleInfo.clusterId}`,
    });
  }

  // 5. SIM Swap Velocity Rule
  const hasSimSwap =
    context?.simSwapDetected ||
    flagsLower.some((f) => f.includes("sim swap"));
  if (hasSimSwap) {
    triggeredRules.push({
      ruleId: "RULE_SIM_SWAP_COOL_DOWN",
      ruleName: "SIM Swap Cooling-off Violation",
      severity: "Critical",
      description: "Transfer attempted while registered SIM card is within mandatory 24h post-swap security hold period.",
      threshold: "24h SIM Swap Hold",
      actualValue: "Immediate execution attempted",
    });
  }

  // 6. Micro-Structuring Skirting Regulatory Limit
  const isStructuring =
    (amount >= 23500 && amount <= 24999) ||
    (amount >= 47000 && amount <= 49999);
  if (isStructuring) {
    triggeredRules.push({
      ruleId: "RULE_MICRO_STRUCTURING",
      ruleName: "Anti-Structuring / Smurfing Threshold Detection",
      severity: "High",
      description: `Amount ৳${amount.toLocaleString()} is calibrated within 5% below regulatory threshold (${amount > 40000 ? "৳50,000" : "৳25,000"}).`,
      threshold: "Below threshold margin",
      actualValue: `৳${amount.toLocaleString()}`,
    });
  }

  // 7. Rapid Cash-out Post-PIN Reset
  const hasPinReset =
    (context?.pinResetMinutesAgo !== undefined && context.pinResetMinutesAgo <= 60) ||
    flagsLower.some((f) => f.includes("pin reset") || f.includes("password change"));
  if (hasPinReset && (type === "Cash Out" || amount >= 20000)) {
    triggeredRules.push({
      ruleId: "RULE_RAPID_CASHOUT_POST_RESET",
      ruleName: "Credential Reset Followed by Immediate Cash-out",
      severity: "Critical",
      description: "Immediate cash-out or high-value transfer requested within 60 minutes of USSD/App PIN reset.",
      threshold: "PIN reset cooling window",
      actualValue: "Cash-out attempted",
    });
  }

  // Compute rule risk score and highest severity
  let ruleRiskScore = 10;
  let highestSeverity: RiskLevel = "Low";

  if (triggeredRules.some((r) => r.severity === "Critical")) {
    highestSeverity = "Critical";
    ruleRiskScore = 95;
  } else if (triggeredRules.some((r) => r.severity === "High")) {
    highestSeverity = "High";
    ruleRiskScore = 80;
  } else if (triggeredRules.length > 0) {
    highestSeverity = "Medium";
    ruleRiskScore = 55;
  }

  return {
    triggeredRules,
    ruleRiskScore,
    highestSeverity,
  };
}
