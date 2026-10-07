export interface VelocityMetrics {
  transactions_last_1_minute: number;
  transactions_last_5_minutes: number;
  transactions_last_10_minutes: number;
  transactions_last_1_hour: number;
  amount_last_10_minutes: number;
  unique_beneficiaries_last_10_minutes: number;
  velocity_risk_score: number;
  is_rapid_drain_pattern: boolean;
}

export class TransactionVelocityModel {
  static calculate(recentTxns: Array<{ amount: number; timestamp: string | number; receiver: string }>): VelocityMetrics {
    const now = Date.now();
    let count1m = 0;
    let count5m = 0;
    let count10m = 0;
    let count1h = 0;
    let amount10m = 0;
    const recipients10m = new Set<string>();

    for (const t of recentTxns) {
      const tTime = typeof t.timestamp === "number" ? t.timestamp : new Date(t.timestamp).getTime();
      const diffMs = now - tTime;

      if (diffMs <= 60 * 1000) count1m++;
      if (diffMs <= 5 * 60 * 1000) count5m++;
      if (diffMs <= 10 * 60 * 1000) {
        count10m++;
        amount10m += Number(t.amount);
        if (t.receiver) recipients10m.add(t.receiver);
      }
      if (diffMs <= 60 * 60 * 1000) count1h++;
    }

    let velocityScore = 15;
    if (count10m >= 5) velocityScore += 45;
    else if (count10m >= 3) velocityScore += 25;

    if (recipients10m.size >= 3) velocityScore += 25;
    if (amount10m > 40000) velocityScore += 20;

    const velocity_risk_score = Math.min(100, Math.max(0, velocityScore));
    const is_rapid_drain_pattern = count10m >= 4 && recipients10m.size >= 2;

    return {
      transactions_last_1_minute: count1m,
      transactions_last_5_minutes: count5m,
      transactions_last_10_minutes: count10m,
      transactions_last_1_hour: count1h,
      amount_last_10_minutes: amount10m,
      unique_beneficiaries_last_10_minutes: recipients10m.size,
      velocity_risk_score,
      is_rapid_drain_pattern,
    };
  }
}
