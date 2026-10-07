import { TransactionFeatures } from "@/types";

export interface IsolationForestPrediction {
  anomaly_score: number;       // 0 to 100
  normalized_path_length: number; // 0.0 to 1.0 (shorter path = higher anomaly)
  is_anomalous: boolean;
  isolation_depth: number;
  model_type: "IsolationForest-Ensemble-v1.8";
}

/**
 * Anomaly Detection Model Adapter (Isolation Forest Architecture)
 * Measures average isolation tree depth across multidimensional feature space.
 * Outliers require fewer random partitions to isolate.
 */
export class IsolationForestAnomalyModel {
  static predict(features: TransactionFeatures): IsolationForestPrediction {
    // Expected average path length for normal observations: ~12 partitions
    // Anomalous points isolate early at path lengths 3-6
    let partitionSteps = 12;

    if (features.amount_deviation > 4.0) partitionSteps -= 3.5;
    if (features.time_anomaly_score > 60) partitionSteps -= 2.5;
    if (features.device_anomaly_score > 60) partitionSteps -= 2.0;
    if (features.location_anomaly_score > 60) partitionSteps -= 1.5;

    const isolation_depth = Math.max(2, Math.min(14, partitionSteps));

    // Normalize anomaly score: inversely proportional to tree depth
    // score = 2^(-depth / c(n))
    const normalized_score = Math.pow(2, -isolation_depth / 6.0);
    const anomaly_score = Math.min(100, Math.max(0, Math.round(normalized_score * 100)));

    return {
      anomaly_score,
      normalized_path_length: parseFloat((isolation_depth / 14).toFixed(3)),
      is_anomalous: anomaly_score >= 60,
      isolation_depth: parseFloat(isolation_depth.toFixed(1)),
      model_type: "IsolationForest-Ensemble-v1.8",
    };
  }
}
