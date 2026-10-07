import { TransactionFeatures } from "@/types";

export function calculateFraudScore(features: TransactionFeatures): number {
  const weights = {
    amountDeviation: 0.28,
    velocity: 0.20,
    newBeneficiary: 0.18,
    newDevice: 0.16,
    unusualTime: 0.10,
    locationDeviation: 0.08,
  };

  // 1. Amount deviation normalization (e.g. 5x = 50, 10x = 80, >=15x = 100)
  let normalizedAmount = 0;
  if (features.amount_deviation > 1.2) {
    normalizedAmount = Math.min(100, Math.round((features.amount_deviation - 1) * 8 + 15));
  }

  let baseScore =
    normalizedAmount * weights.amountDeviation +
    features.velocity_score * weights.velocity +
    features.beneficiary_anomaly_score * weights.newBeneficiary +
    features.device_anomaly_score * weights.newDevice +
    features.time_anomaly_score * weights.unusualTime +
    features.location_anomaly_score * weights.locationDeviation;

  // Synergy / Compound fraud risk:
  // If multiple critical indicators strike simultaneously (e.g., new device + new beneficiary + night hours)
  const isATOVector =
    features.device_anomaly_score > 70 &&
    features.beneficiary_anomaly_score > 70 &&
    (features.time_anomaly_score > 70 || features.velocity_score > 60);

  if (isATOVector) {
    baseScore += 22; // Acute ATO syndicate risk bonus
  } else if (features.amount_deviation > 15 && features.beneficiary_anomaly_score > 70) {
    baseScore += 16; // Extreme high-value unverified recipient bonus
  }

  return Math.min(100, Math.max(0, Math.round(baseScore)));
}
