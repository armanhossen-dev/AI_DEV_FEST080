import { CustomerBaseline, Anomaly, RiskFactor } from "./types";
import { Transaction } from "@/types";

export const DEFAULT_CUSTOMER_BASELINES: Record<string, CustomerBaseline> = {
  "U-1042": {
    customerId: "U-1042",
    name: "Tanvir Ahmed",
    avgAmount: 6800,
    stdAmount: 2200,
    maxAmount: 25000,
    typicalHours: { startHour: 9, endHour: 22 },
    knownDevices: ["DEV-2211", "DEV-3012"],
    knownLocations: ["Dhaka", "Gulshan", "Banani"],
    recentTransactionCount24h: 2,
    accountAgeDays: 1150,
    kycTier: "Verified",
  },
  "U-2214": {
    customerId: "U-2214",
    name: "Rahim Chowdhury",
    avgAmount: 4500,
    stdAmount: 1800,
    maxAmount: 15000,
    typicalHours: { startHour: 8, endHour: 21 },
    knownDevices: ["DEV-1049"],
    knownLocations: ["Sylhet"],
    recentTransactionCount24h: 1,
    accountAgeDays: 720,
    kycTier: "Verified",
  },
  "U-4421": {
    customerId: "U-4421",
    name: "Mehedi Hassan",
    avgAmount: 8200,
    stdAmount: 3100,
    maxAmount: 30000,
    typicalHours: { startHour: 10, endHour: 23 },
    knownDevices: ["DEV-4402"],
    knownLocations: ["Sylhet"],
    recentTransactionCount24h: 4,
    accountAgeDays: 540,
    kycTier: "Tier-1",
  },
  "U-8821": {
    customerId: "U-8821",
    name: "Farhana Yasmin",
    avgAmount: 3500,
    stdAmount: 1200,
    maxAmount: 12000,
    typicalHours: { startHour: 8, endHour: 20 },
    knownDevices: ["DEV-7721"],
    knownLocations: ["Dhaka"],
    recentTransactionCount24h: 1,
    accountAgeDays: 980,
    kycTier: "Verified",
  },
  "U-2910": {
    customerId: "U-2910",
    name: "Shafiqul Islam",
    avgAmount: 2400,
    stdAmount: 800,
    maxAmount: 10000,
    typicalHours: { startHour: 9, endHour: 22 },
    knownDevices: ["DEV-2910", "DEV-2211"],
    knownLocations: ["Dhaka"],
    recentTransactionCount24h: 2,
    accountAgeDays: 1400,
    kycTier: "Verified",
  },
  "U-9182": {
    customerId: "U-9182",
    name: "Kamrul Ahsan",
    avgAmount: 9500,
    stdAmount: 3000,
    maxAmount: 35000,
    typicalHours: { startHour: 9, endHour: 21 },
    knownDevices: ["DEV-9182"],
    knownLocations: ["Dhaka", "Sylhet"],
    recentTransactionCount24h: 0,
    accountAgeDays: 820,
    kycTier: "Verified",
  },
};

export interface BehavioralAnalysisResult {
  behavioralScore: number;
  amountRatio: number;
  zScore: number;
  isOffHours: boolean;
  isNewDevice: boolean;
  isNewLocation: boolean;
  anomalies: Anomaly[];
  factors: RiskFactor[];
}

/** Parses time string into 24-hour integer (0-23) */
function parseHourFromTimeStr(timeStr: string): number {
  if (!timeStr) return 12;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 12;

  let hour = parseInt(match[1], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;
  return hour;
}

export function getCustomerBaseline(customerId: string): CustomerBaseline {
  if (DEFAULT_CUSTOMER_BASELINES[customerId]) {
    return DEFAULT_CUSTOMER_BASELINES[customerId];
  }
  // Default population baseline for new or unprofiled accounts
  return {
    customerId,
    name: "MFS User",
    avgAmount: 5000,
    stdAmount: 2000,
    maxAmount: 25000,
    typicalHours: { startHour: 8, endHour: 22 },
    knownDevices: ["DEV-UNKNOWN"],
    knownLocations: ["Dhaka"],
    recentTransactionCount24h: 1,
    accountAgeDays: 180,
    kycTier: "Tier-1",
  };
}

export function analyzeBehavioralBaseline(
  txn: Partial<Transaction>,
  customBaseline?: CustomerBaseline
): BehavioralAnalysisResult {
  const customerId = txn.customer || "U-UNKNOWN";
  const baseline = customBaseline || getCustomerBaseline(customerId);
  const amount = Number(txn.amount) || 0;
  const device = txn.device || "";
  const location = txn.location || "Dhaka";
  const timeStr = txn.time || "12:00 PM";

  // 1. Amount statistical anomaly
  const amountRatio = baseline.avgAmount > 0 ? amount / baseline.avgAmount : 1;
  const zScore = baseline.stdAmount > 0 ? (amount - baseline.avgAmount) / baseline.stdAmount : 0;

  let amountScore = 15;
  if (amountRatio >= 5.0 || zScore >= 4.0) amountScore = 95;
  else if (amountRatio >= 3.0 || zScore >= 3.0) amountScore = 85;
  else if (amountRatio >= 2.0 || zScore >= 2.0) amountScore = 65;
  else if (amountRatio >= 1.3 || zScore >= 1.0) amountScore = 40;

  // 2. Hardware Device Anomaly
  const isNewDevice =
    txn.isNewDevice !== undefined
      ? txn.isNewDevice
      : !baseline.knownDevices.includes(device);
  const deviceScore = isNewDevice ? 85 : 12;

  // 3. Location Anomaly
  const isNewLocation =
    txn.isNewLocation !== undefined
      ? txn.isNewLocation
      : !baseline.knownLocations.some((l) =>
          location.toLowerCase().includes(l.toLowerCase())
        );
  const locationScore = isNewLocation ? 75 : 15;

  // 4. Time Window Anomaly
  const hour = parseHourFromTimeStr(timeStr);
  const isOffHours =
    hour < baseline.typicalHours.startHour || hour > baseline.typicalHours.endHour;
  const isNocturnal = hour >= 0 && hour <= 5;
  const timeScore = isNocturnal ? 88 : isOffHours ? 60 : 15;

  // Weighted composite behavioral score
  const behavioralScore = Math.round(
    amountScore * 0.4 +
    deviceScore * 0.3 +
    timeScore * 0.18 +
    locationScore * 0.12
  );

  const anomalies: Anomaly[] = [];
  const factors: RiskFactor[] = [];

  if (amountRatio >= 2.5) {
    anomalies.push({
      type: "AMOUNT_DEVIATION",
      severity: amountRatio >= 4.0 ? "Critical" : "High",
      description: `Amount ৳${amount.toLocaleString()} is ${amountRatio.toFixed(1)}× above customer 30-day baseline median (৳${baseline.avgAmount.toLocaleString()})`,
      deviationScore: amountScore,
      metadata: { amount, baselineAvg: baseline.avgAmount, ratio: amountRatio, zScore },
    });
  }

  if (isNewDevice) {
    anomalies.push({
      type: "NEW_DEVICE",
      severity: "High",
      description: `Unrecognized hardware fingerprint (${device || "Unknown Hardware"}). Zero historical links to ${customerId}.`,
      deviationScore: deviceScore,
      metadata: { device, knownDevices: baseline.knownDevices },
    });
  }

  if (isNocturnal || isOffHours) {
    anomalies.push({
      type: "TIME_ANOMALY",
      severity: isNocturnal ? "High" : "Medium",
      description: `Transacted during high-risk off-hours (${timeStr}). Customer historical active window is ${baseline.typicalHours.startHour}:00 - ${baseline.typicalHours.endHour}:00.`,
      deviationScore: timeScore,
      metadata: { timeStr, hour, typicalHours: baseline.typicalHours },
    });
  }

  if (isNewLocation) {
    anomalies.push({
      type: "GEO_JUMP",
      severity: "Medium",
      description: `Transaction initiated from unfamiliar location: ${location}. Known customer hubs: ${baseline.knownLocations.join(", ")}.`,
      deviationScore: locationScore,
      metadata: { location, knownLocations: baseline.knownLocations },
    });
  }

  factors.push(
    {
      name: "Transaction Amount Deviation",
      score: amountScore,
      weight: 0.25,
      description: `Amount ৳${amount.toLocaleString()} is ${amountRatio.toFixed(1)}× customer median (z-score: ${zScore.toFixed(2)})`,
      deviated: amountScore > 60,
    },
    {
      name: "Hardware Device Fingerprint",
      score: deviceScore,
      weight: 0.2,
      description: isNewDevice ? "First-time unregistered device detected" : "Known trusted customer device",
      deviated: isNewDevice,
    },
    {
      name: "Temporal & Operating Hours",
      score: timeScore,
      weight: 0.15,
      description: isNocturnal ? "Nocturnal transaction (00:00 - 05:00)" : isOffHours ? "Outside standard operating hours" : "Normal active hours",
      deviated: isOffHours,
    },
    {
      name: "Geographic Location Consistency",
      score: locationScore,
      weight: 0.1,
      description: isNewLocation ? `First activity recorded in ${location}` : "Known customer geographic profile",
      deviated: isNewLocation,
    }
  );

  return {
    behavioralScore,
    amountRatio,
    zScore,
    isOffHours,
    isNewDevice,
    isNewLocation,
    anomalies,
    factors,
  };
}
