import { Transaction } from "@/types";
import { Anomaly, RiskFactor } from "./types";

export interface ScamDetectionResult {
  scamScore: number;
  isScamSuspected: boolean;
  scamIndicators: string[];
  anomalies: Anomaly[];
  factor: RiskFactor;
}

export function detectScamPattern(
  txn: Partial<Transaction>,
  context?: {
    isFirstTimeRecipient?: boolean;
    customerAgeYears?: number;
    callDuringTransferDetected?: boolean;
  }
): ScamDetectionResult {
  const flags = txn.flags || [];
  const flagsLower = flags.map((f) => f.toLowerCase());
  const type = txn.type || "Wallet Transfer";
  const amount = Number(txn.amount) || 0;
  const indicators: string[] = [];
  let score = 15;

  // 1. Social engineering / fake lottery / prize flags
  const hasScamFlag = flagsLower.some(
    (f) =>
      f.includes("scam") ||
      f.includes("impersonation") ||
      f.includes("urgency") ||
      f.includes("unverified recipient") ||
      f.includes("complaints filed")
  );

  if (hasScamFlag) {
    score += 45;
    indicators.push("Counterparty matches reported social engineering/scam vector");
  }

  // 2. High amount transfer to first-time recipient
  const isFirstTime =
    context?.isFirstTimeRecipient ??
    flagsLower.some((f) => f.includes("brand new recipient") || f.includes("first-time"));

  if (isFirstTime && amount >= 25000) {
    score += 30;
    indicators.push(`High-value outbound transfer (৳${amount.toLocaleString()}) to unverified first-time recipient`);
  }

  // 3. Active voice call during transfer (common scam vulnerability marker in MFS)
  if (context?.callDuringTransferDetected) {
    score += 25;
    indicators.push("Concurrent active voice call detected during payment submission (high coaching indicator)");
  }

  const finalScore = Math.min(99, Math.max(10, score));
  const isScamSuspected = finalScore >= 65;

  const anomalies: Anomaly[] = [];
  if (isScamSuspected) {
    anomalies.push({
      type: "AMOUNT_DEVIATION",
      severity: finalScore >= 80 ? "Critical" : "High",
      description: `Suspected social engineering / scam vector: ${indicators[0] || "Urgent high-value payment to unverified recipient"}`,
      deviationScore: finalScore,
      metadata: { indicators, amount, type },
    });
  }

  const factor: RiskFactor = {
    name: "Social Engineering & Scam Indicators",
    score: finalScore,
    weight: 0.12,
    description: isScamSuspected
      ? indicators[0] || "Suspicious unverified recipient transfer"
      : "No scam or social engineering markers detected",
    deviated: isScamSuspected,
  };

  return {
    scamScore: finalScore,
    isScamSuspected,
    scamIndicators: indicators,
    anomalies,
    factor,
  };
}
