import { TransactionFeatures } from "@/types";

export function calculateAnomalyScore(features: TransactionFeatures): number {
  const weights = {
    amountOutlier: 0.40,
    temporalDeviation: 0.25,
    hardwareDeviceShift: 0.20,
    geographicShift: 0.15,
  };

  const amountOutlierScore = Math.min(100, Math.max(0, (features.amount_deviation - 1) * 7 + 10));

  const rawAnomaly =
    amountOutlierScore * weights.amountOutlier +
    features.time_anomaly_score * weights.temporalDeviation +
    features.device_anomaly_score * weights.hardwareDeviceShift +
    features.location_anomaly_score * weights.geographicShift;

  return Math.min(100, Math.max(0, Math.round(rawAnomaly)));
}
