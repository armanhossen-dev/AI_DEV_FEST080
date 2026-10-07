import { DbTransaction, BehavioralBaseline, TransactionFeatures } from "@/types";

export function extractFeatures(
  transaction: DbTransaction | Omit<DbTransaction, "id" | "created_at">,
  baseline?: BehavioralBaseline
): TransactionFeatures {
  const effectiveBaseline: BehavioralBaseline = baseline || {
    customer_id: "DEFAULT",
    average_amount: 2500,
    median_amount: 2000,
    max_normal_amount: 15000,
    normal_hours_start: 8,
    normal_hours_end: 22,
    avg_daily_count: 3,
    known_devices: ["DEV-PRIMARY-01"],
    known_locations: ["Dhaka"],
    known_beneficiaries: [],
  };

  // 1. Amount deviation
  const amount = Number(transaction.amount);
  const amountDeviation = effectiveBaseline.median_amount > 0
    ? Number((amount / effectiveBaseline.median_amount).toFixed(2))
    : 1.0;

  // 2. Time anomaly (parse UTC or ISO hours)
  const txnDate = new Date(transaction.timestamp);
  const isUtc = typeof transaction.timestamp === "string" && transaction.timestamp.endsWith("Z");
  const hour = isUtc ? txnDate.getUTCHours() : txnDate.getHours();

  let timeAnomalyScore = 0;
  if (hour < effectiveBaseline.normal_hours_start || hour > effectiveBaseline.normal_hours_end) {
    if (hour >= 1 && hour <= 4) {
      timeAnomalyScore = 95; // Dead of night / high fraud window
    } else {
      timeAnomalyScore = 60; // Minor off-hours
    }
  }

  // 3. Device anomaly
  const isKnownDevice = effectiveBaseline.known_devices.includes(transaction.device_id);
  const deviceAnomalyScore = (transaction.device_new || !isKnownDevice) ? 90 : 5;

  // 4. Location anomaly
  const isKnownLocation = effectiveBaseline.known_locations.some(
    (loc) => loc.toLowerCase() === (transaction.location || "").toLowerCase()
  );
  const locationAnomalyScore = (!isKnownLocation && effectiveBaseline.known_locations.length > 0) ? 75 : 10;

  // 5. Beneficiary anomaly
  const beneficiaryAnomalyScore = transaction.beneficiary_new ? 85 : 10;

  // 6. Velocity score
  let velocityScore = 15;
  if (transaction.ip_risk > 60) {
    velocityScore = Math.min(100, Math.round(transaction.ip_risk * 1.05));
  } else if (transaction.amount > 30000 && (transaction.device_new || transaction.beneficiary_new)) {
    velocityScore = 75;
  }

  // 7. Historical behavior & failed attempts
  const historicalBehaviorScore = Math.min(100, Math.round(amountDeviation * 14));
  const failedAttemptScore = transaction.ip_risk > 70 ? 70 : 5;
  const accountAgeScore = 25;

  return {
    transaction_id: (transaction as any).id || "TXN-EVAL",
    amount_deviation: amountDeviation,
    velocity_score: velocityScore,
    time_anomaly_score: timeAnomalyScore,
    device_anomaly_score: deviceAnomalyScore,
    location_anomaly_score: locationAnomalyScore,
    beneficiary_anomaly_score: beneficiaryAnomalyScore,
    historical_behavior_score: historicalBehaviorScore,
    failed_attempt_score: failedAttemptScore,
    account_age_score: accountAgeScore,
  };
}
