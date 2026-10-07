import { Transaction } from "@/types";
import { Anomaly, RiskFactor } from "./types";

export interface ATODetectionResult {
  atoScore: number;
  isPotentialATO: boolean;
  signals: string[];
  anomalies: Anomaly[];
  factor: RiskFactor;
}

export function detectAccountTakeover(
  txn: Partial<Transaction>,
  context?: {
    pinResetMinutesAgo?: number;
    simSwapDetected?: boolean;
    priorLocation?: string;
    priorLocationTimeMinutesAgo?: number;
  }
): ATODetectionResult {
  const flags = txn.flags || [];
  const flagsLower = flags.map((f) => f.toLowerCase());
  const isNewDevice = txn.isNewDevice ?? false;
  const isNewLocation = txn.isNewLocation ?? false;
  const type = txn.type || "Wallet Transfer";
  const amount = Number(txn.amount) || 0;
  const time = txn.time || "12:00 PM";

  const signals: string[] = [];
  let score = 10;

  // 1. PIN Reset / Credential Modification
  const hasPinResetInFlag = flagsLower.some(
    (f) => f.includes("pin reset") || f.includes("password change") || f.includes("credential reset")
  );
  const pinResetRecently =
    (context?.pinResetMinutesAgo !== undefined && context.pinResetMinutesAgo <= 60) ||
    hasPinResetInFlag;

  if (pinResetRecently) {
    score += 40;
    signals.push("Recent PIN/credential reset occurred within 60 minutes");
  }

  // 2. SIM Swap
  const hasSimSwapInFlag = flagsLower.some((f) => f.includes("sim swap"));
  const simSwapped = context?.simSwapDetected || hasSimSwapInFlag;

  if (simSwapped) {
    score += 45;
    signals.push("Carrier SIM Swap event logged prior to transaction execution");
  }

  // 3. Unrecognized Device
  if (isNewDevice) {
    score += 25;
    signals.push(`Unrecognized device fingerprint: ${txn.device || "Unknown Hardware"}`);
  }

  // 4. Impossible Travel / Geographic Jump
  const hasGeoJumpInFlag = flagsLower.some(
    (f) => f.includes("jump") || f.includes("geographic jump") || f.includes("unusual location")
  );
  if (isNewLocation || hasGeoJumpInFlag) {
    score += 20;
    signals.push(`Geographic anomaly: Unfamiliar location (${txn.location || "Unknown"})`);
  }

  // 5. High-Value Full Balance Drain / Immediate Cash-Out
  const isDrainOrCashout =
    (type === "Cash Out" && amount >= 20000) ||
    flagsLower.some((f) => f.includes("balance sweep") || f.includes("max limit") || f.includes("drain"));

  if (isDrainOrCashout) {
    score += 25;
    signals.push(`Sudden liquidation/cash-out pattern of ৳${amount.toLocaleString()}`);
  }

  // 6. Nocturnal Window (1:00 AM - 5:00 AM)
  const isNocturnal =
    time.includes("AM") &&
    ["01", "02", "03", "04", "05", "12"].some((h) => time.startsWith(h));

  if (isNocturnal && (isNewDevice || pinResetRecently || simSwapped)) {
    score += 15;
    signals.push(`Nocturnal execution window (${time}) during victim dormant hours`);
  }

  const finalScore = Math.min(99, Math.max(8, score));
  const isPotentialATO = finalScore >= 70;

  const anomalies: Anomaly[] = [];
  if (isPotentialATO) {
    anomalies.push({
      type: "NEW_DEVICE",
      severity: finalScore >= 85 ? "Critical" : "High",
      description: `High-confidence Account Takeover (ATO) pattern: ${signals.slice(0, 2).join("; ")}`,
      deviationScore: finalScore,
      metadata: { signals, simSwapped, pinResetRecently, isNewDevice },
    });
  }

  const factor: RiskFactor = {
    name: "Account Takeover (ATO) Indicators",
    score: finalScore,
    weight: 0.16,
    description: isPotentialATO
      ? signals[0] || "Multiple credential and hardware deviations"
      : "No ATO or credential tampering signals",
    deviated: isPotentialATO,
  };

  return {
    atoScore: finalScore,
    isPotentialATO,
    signals,
    anomalies,
    factor,
  };
}
