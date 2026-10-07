import { Transaction } from "@/types";
import { Anomaly, RiskFactor } from "./types";

export interface MuleDetectionResult {
  muleScore: number;
  isMuleDetected: boolean;
  muleClusterId?: number;
  signals: string[];
  anomalies: Anomaly[];
  factor: RiskFactor;
}

// Known syndicate mule wallets and clusters identified by upstream graph intelligence
export const KNOWN_MULE_WALLETS: Record<string, { clusterId: number; role: string; risk: number }> = {
  "U-8831": { clusterId: 17, role: "Primary Mule Conduit", risk: 94 },
  "U-4412": { clusterId: 17, role: "Secondary Consolidation Hub", risk: 92 },
  "U-9288": { clusterId: 17, role: "Final Liquidation Wallet", risk: 95 },
  "U-3018": { clusterId: 17, role: "Rapid Cash-out Conduit", risk: 89 },
  "U-5509": { clusterId: 17, role: "Smurfing Inflow Node", risk: 84 },
  "U-2198": { clusterId: 17, role: "Cross-border Remittance Relay", risk: 86 },
  "U-9901": { clusterId: 99, role: "Rogue Syndicate Liquidation Hub", risk: 98 },
  "AG-3091": { clusterId: 17, role: "High-Volume Collusion Agent", risk: 88 },
};

export function detectMuleActivity(
  txn: Partial<Transaction>,
  context?: {
    knownMules?: Record<string, { clusterId: number; role: string; risk: number }>;
    isLayeringObserved?: boolean;
    fanInCount?: number;
  }
): MuleDetectionResult {
  const recipient = txn.recipient || "";
  const customer = txn.customer || "";
  const flags = txn.flags || [];
  const flagsLower = flags.map((f) => f.toLowerCase());
  const amount = Number(txn.amount) || 0;

  const muleRegistry = context?.knownMules || KNOWN_MULE_WALLETS;
  const targetMuleInfo = muleRegistry[recipient];
  const sourceMuleInfo = muleRegistry[customer];

  const signals: string[] = [];
  let score = 12;
  let clusterId: number | undefined;

  // 1. Direct Hit to Flagged Mule Wallet
  if (targetMuleInfo) {
    score = Math.max(score, targetMuleInfo.risk);
    clusterId = targetMuleInfo.clusterId;
    signals.push(
      `Recipient ${recipient} is registered in Mule Syndicate Cluster #${targetMuleInfo.clusterId} (${targetMuleInfo.role})`
    );
  }

  // 2. Source Wallet is Flagged
  if (sourceMuleInfo) {
    score = Math.max(score, sourceMuleInfo.risk);
    clusterId = clusterId || sourceMuleInfo.clusterId;
    signals.push(
      `Originating account ${customer} is an active node in Mule Cluster #${sourceMuleInfo.clusterId}`
    );
  }

  // 3. Flags indicating mule behavior
  const hasMuleFlag = flagsLower.some(
    (f) =>
      f.includes("mule") ||
      f.includes("layering") ||
      f.includes("smurfing") ||
      f.includes("conduit") ||
      f.includes("cluster")
  );

  if (hasMuleFlag) {
    score = Math.max(score, 88);
    signals.push("Graph topology match: Conduit intermediary pattern detected in flow");
  }

  // 4. Fan-In Smurfing / Rapid aggregation
  if (context?.isLayeringObserved || (context?.fanInCount && context.fanInCount >= 4)) {
    score = Math.max(score, 85);
    signals.push(`Rapid fund aggregation: Multiple inbound transfers converging into single outflow`);
  }

  const finalScore = Math.min(99, Math.max(10, score));
  const isMuleDetected = finalScore >= 75;

  const anomalies: Anomaly[] = [];
  if (isMuleDetected) {
    anomalies.push({
      type: "MULE_PASS_THROUGH",
      severity: finalScore >= 90 ? "Critical" : "High",
      description: `Mule syndicate correlation: ${signals[0]}`,
      deviationScore: finalScore,
      metadata: { clusterId, recipient, customer, amount },
    });
  }

  const factor: RiskFactor = {
    name: "Money Mule & Smurfing Network",
    score: finalScore,
    weight: 0.18,
    description: isMuleDetected
      ? `Linked to Mule Cluster #${clusterId || 17} (${signals[0]?.slice(0, 40)}...)`
      : "Standard counterparty with no known syndicate links",
    deviated: isMuleDetected,
  };

  return {
    muleScore: finalScore,
    isMuleDetected,
    muleClusterId: clusterId,
    signals,
    anomalies,
    factor,
  };
}
