import { DbTransaction, BehavioralBaseline } from "@/types";

export interface BehaviorComparison {
  behavior_score: number;
  amount_ratio: number;
  is_within_normal_hours: boolean;
  is_known_device: boolean;
  is_known_location: boolean;
  frequency_deviation: number;
}

export class CustomerBehaviorModel {
  static evaluate(
    transaction: DbTransaction | Omit<DbTransaction, "id" | "created_at">,
    baseline: BehavioralBaseline
  ): BehaviorComparison {
    const amount = Number(transaction.amount);
    const amount_ratio = baseline.median_amount > 0 ? amount / baseline.median_amount : 1.0;

    const txnDate = new Date(transaction.timestamp);
    const isUtc = typeof transaction.timestamp === "string" && transaction.timestamp.endsWith("Z");
    const hour = isUtc ? txnDate.getUTCHours() : txnDate.getHours();

    const is_within_normal_hours =
      hour >= baseline.normal_hours_start && hour <= baseline.normal_hours_end;

    const is_known_device = baseline.known_devices.includes(transaction.device_id);
    const is_known_location = baseline.known_locations.some(
      (l) => l.toLowerCase() === (transaction.location || "").toLowerCase()
    );

    let devScore = 10;
    if (amount_ratio > 3.0) devScore += Math.min(45, (amount_ratio - 1) * 3);
    if (!is_within_normal_hours) devScore += 20;
    if (!is_known_device) devScore += 18;
    if (!is_known_location && baseline.known_locations.length > 0) devScore += 12;

    const behavior_score = Math.min(100, Math.max(0, Math.round(devScore)));

    return {
      behavior_score,
      amount_ratio: parseFloat(amount_ratio.toFixed(2)),
      is_within_normal_hours,
      is_known_device,
      is_known_location,
      frequency_deviation: 1.2,
    };
  }
}

export const compareBehavioralBaseline = CustomerBehaviorModel.evaluate;
