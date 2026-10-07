import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { BehavioralBaseline, DbTransaction } from "@/types";

export interface CustomerBehaviorProfileResult {
  customerIdentifier: string;
  averageAmount: number;
  medianAmount: number;
  transactionCountDaily: number;
  normalHoursStart: number;
  normalHoursEnd: number;
  knownDeviceCount: number;
  knownBeneficiaryCount: number;
  typicalLocation: string;
  updatedAt: string;
}

export interface BaselineDeviationAnalysis {
  amountDeviation: number;
  isAmountAbnormal: boolean;
  isTimeOffHours: boolean;
  isNewDevice: boolean;
  isNewBeneficiary: boolean;
  isLocationMismatch: boolean;
  deviationSummary: string;
}

/**
 * Retrieves the established behavioral baseline profile for a customer.
 */
export async function getCustomerBehaviorProfile(
  customerId: string
): Promise<CustomerBehaviorProfileResult> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from("customer_behavior_profiles")
        .select("*")
        .eq("customer_identifier", customerId)
        .maybeSingle();

      if (data && !error) {
        return {
          customerIdentifier: data.customer_identifier,
          averageAmount: Number(data.average_amount) || 2000,
          medianAmount: Number(data.median_amount) || 1800,
          transactionCountDaily: data.transaction_count_daily || 2,
          normalHoursStart: data.normal_transaction_start_hour ?? 8,
          normalHoursEnd: data.normal_transaction_end_hour ?? 22,
          knownDeviceCount: data.known_device_count || 1,
          knownBeneficiaryCount: data.known_beneficiary_count || 5,
          typicalLocation: data.typical_location || "Dhaka",
          updatedAt: data.updated_at || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn("Failed to fetch customer profile from Supabase:", err);
    }
  }

  // Deterministic fallback envelope for testing / offline
  return {
    customerIdentifier: customerId,
    averageAmount: 2200,
    medianAmount: 1850,
    transactionCountDaily: 2,
    normalHoursStart: 8,
    normalHoursEnd: 22,
    knownDeviceCount: 2,
    knownBeneficiaryCount: 7,
    typicalLocation: "Dhaka",
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculates current-vs-baseline deviation vector for a live transaction against customer baseline profile.
 */
export function calculateProfileDeviation(
  txn: Pick<DbTransaction, "amount" | "timestamp" | "device_new" | "beneficiary_new" | "location">,
  profile: CustomerBehaviorProfileResult
): BaselineDeviationAnalysis {
  const amount = Number(txn.amount);
  const median = profile.medianAmount || 1850;
  const amountRatio = Math.round((amount / median) * 10) / 10;
  const isAmountAbnormal = amountRatio > 4.0;

  const txnDate = new Date(txn.timestamp);
  const hour = txnDate.getUTCHours(); // evaluate against normal operating hours
  const isTimeOffHours = hour < profile.normalHoursStart || hour > profile.normalHoursEnd;

  const isLocationMismatch = Boolean(
    txn.location &&
    profile.typicalLocation &&
    txn.location.toLowerCase() !== profile.typicalLocation.toLowerCase()
  );

  const notes: string[] = [];
  if (isAmountAbnormal) notes.push(`Amount is ${amountRatio}× median baseline (৳${median})`);
  if (isTimeOffHours) notes.push(`Transaction occurred outside typical hours (${profile.normalHoursStart}:00–${profile.normalHoursEnd}:00 UTC)`);
  if (txn.device_new) notes.push("Initiated from unrecognized hardware identifier");
  if (txn.beneficiary_new) notes.push("Recipient wallet has no established history with customer");
  if (isLocationMismatch) notes.push(`Location ${txn.location} differs from primary cluster ${profile.typicalLocation}`);

  return {
    amountDeviation: amountRatio,
    isAmountAbnormal,
    isTimeOffHours,
    isNewDevice: Boolean(txn.device_new),
    isNewBeneficiary: Boolean(txn.beneficiary_new),
    isLocationMismatch,
    deviationSummary: notes.length > 0 ? notes.join("; ") : "Conforms to customer baseline envelope",
  };
}
