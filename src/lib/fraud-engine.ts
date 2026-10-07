import { RiskLevel, Transaction, RiskFactor } from "@/types";

export interface ScoringResult {
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  factors: RiskFactor[];
  flags: string[];
  recommendation: string;
}

export function scoreTransaction(
  txn: Partial<Transaction>,
  customerBaseline = { avgAmount: 6800, maxAmount: 25000, knownDevices: ["DEV-2211", "DEV-3012"] }
): ScoringResult {
  const amount = txn.amount || 0;
  const isNewDevice = txn.isNewDevice ?? !customerBaseline.knownDevices.includes(txn.device || "");
  const isNewLocation = txn.isNewLocation ?? false;
  const time = txn.time || "12:00 PM";

  // Check off hours (11:00 PM - 05:00 AM)
  const isOffHours =
    time.includes("AM") &&
    (time.startsWith("01") ||
      time.startsWith("02") ||
      time.startsWith("03") ||
      time.startsWith("04") ||
      time.startsWith("05") ||
      time.startsWith("12"));

  // 1. Amount Factor (0 - 100)
  const amountRatio = amount / (customerBaseline.avgAmount || 1);
  let amountScore = 15;
  if (amountRatio > 5) amountScore = 95;
  else if (amountRatio > 3) amountScore = 85;
  else if (amountRatio > 1.8) amountScore = 65;
  else if (amountRatio > 1.2) amountScore = 35;

  // 2. Device Factor
  const deviceScore = isNewDevice ? 85 : 12;

  // 3. Time Factor
  const timeScore = isOffHours ? 80 : 15;

  // 4. Velocity Factor
  const velocityScore = txn.flags?.some((f) => f.toLowerCase().includes("velocity") || f.toLowerCase().includes("rapid"))
    ? 88
    : 20;

  // 5. Recipient Risk
  const recipientScore =
    txn.recipient?.includes("8831") || txn.recipient?.includes("4412") || txn.recipient?.includes("9288")
      ? 92
      : 25;

  // 6. Location Anomaly
  const locationScore = isNewLocation ? 70 : 18;

  // Weights (Sum = 1.0)
  const weights = {
    amount: 0.28,
    velocity: 0.2,
    device: 0.18,
    recipient: 0.18,
    time: 0.08,
    location: 0.08,
  };

  const composite = Math.round(
    amountScore * weights.amount +
      velocityScore * weights.velocity +
      deviceScore * weights.device +
      recipientScore * weights.recipient +
      timeScore * weights.time +
      locationScore * weights.location
  );

  const finalScore = Math.min(99, Math.max(5, composite));

  let riskLevel: RiskLevel = "Low";
  if (finalScore >= 85) riskLevel = "Critical";
  else if (finalScore >= 70) riskLevel = "High";
  else if (finalScore >= 45) riskLevel = "Medium";

  const flags: string[] = [];
  if (amountRatio >= 2.5) flags.push(`Amount ৳${amount.toLocaleString()} is ${amountRatio.toFixed(1)}× above customer baseline`);
  if (isNewDevice) flags.push(`Unrecognized hardware fingerprint (${txn.device || "Unknown Device"})`);
  if (isOffHours) flags.push(`Transacted during high-risk nocturnal window (${time})`);
  if (recipientScore > 80) flags.push(`Target wallet ${txn.recipient} flagged in mule graph analysis`);
  if (velocityScore > 50) flags.push("Multiple transactions detected within short velocity window");

  const factors: RiskFactor[] = [
    {
      name: "Transaction Amount",
      score: amountScore,
      weight: weights.amount,
      description: `Amount ratio: ${amountRatio.toFixed(1)}× median`,
      deviated: amountScore > 60,
    },
    {
      name: "Transaction Velocity",
      score: velocityScore,
      weight: weights.velocity,
      description: "Frequency and interval relative to historical threshold",
      deviated: velocityScore > 50,
    },
    {
      name: "Device Anomaly",
      score: deviceScore,
      weight: weights.device,
      description: isNewDevice ? "First-time device ID" : "Known trusted device",
      deviated: isNewDevice,
    },
    {
      name: "Recipient Risk",
      score: recipientScore,
      weight: weights.recipient,
      description: recipientScore > 80 ? "Proximity to high-risk cluster" : "Standard recipient",
      deviated: recipientScore > 60,
    },
    {
      name: "Time Anomaly",
      score: timeScore,
      weight: weights.time,
      description: isOffHours ? "Off-hours transaction" : "Standard business hours",
      deviated: isOffHours,
    },
    {
      name: "Location Anomaly",
      score: locationScore,
      weight: weights.location,
      description: isNewLocation ? "Unusual geographic cluster" : "Normal location",
      deviated: isNewLocation,
    },
  ];

  let recommendation = "Approve and log standard telemetry.";
  if (riskLevel === "Critical") {
    recommendation =
      "Intervene immediately: hold transaction, freeze recipient wallet pending 2FA step-up verification, and alert human risk analyst.";
  } else if (riskLevel === "High") {
    recommendation = "Route to manual analyst queue and challenge user with biometric step-up.";
  } else if (riskLevel === "Medium") {
    recommendation = "Allow with stepped-up behavioral surveillance for subsequent 24 hours.";
  }

  const confidence = Math.min(98, Math.max(88, 85 + Math.round((Math.abs(finalScore - 50) / 50) * 13)));

  return {
    riskScore: finalScore,
    riskLevel,
    confidence,
    factors,
    flags,
    recommendation,
  };
}
