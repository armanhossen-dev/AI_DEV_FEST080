import assert from "node:assert/strict";
import {
  evaluateRisk,
  analyzeBehavioralBaseline,
  analyzeVelocity,
  detectAccountTakeover,
  detectMuleActivity,
  detectScamPattern,
  evaluateRules,
  evaluateBenchmarkDataset,
  auditLogger,
  globalVelocityTracker,
  globalNetworkIntelligence,
} from "../src/lib/risk-engine";

console.log("=================================================");
console.log("🧪 RUNNING UPAY SENTINEL RISK ENGINE TEST SUITE");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err.message || err);
    throw err;
  }
}

// 1. Behavioral Baseline Tests
test("1. Behavioral Baseline: Correctly scores legitimate daytime transaction", () => {
  const result = analyzeBehavioralBaseline({
    customer: "U-2910",
    amount: 2400,
    device: "DEV-2910",
    isNewDevice: false,
    location: "Dhaka",
    isNewLocation: false,
    time: "02:30 PM",
  });

  assert.ok(result.behavioralScore < 40, `Expected low score, got ${result.behavioralScore}`);
  assert.equal(result.isOffHours, false);
  assert.equal(result.isNewDevice, false);
  assert.equal(result.isNewLocation, false);
});

test("2. Behavioral Baseline: Flags severe amount deviation and new hardware", () => {
  const result = analyzeBehavioralBaseline({
    customer: "U-1042", // normal median: 6,800
    amount: 48500, // 7.1x median
    device: "DEV-NEW-99",
    isNewDevice: true,
    location: "Dhaka",
    time: "02:13 AM", // Nocturnal
  });

  assert.ok(result.behavioralScore >= 75, `Expected high score, got ${result.behavioralScore}`);
  assert.equal(result.isOffHours, true);
  assert.equal(result.isNewDevice, true);
  assert.ok(result.anomalies.some((a) => a.type === "AMOUNT_DEVIATION"));
  assert.ok(result.anomalies.some((a) => a.type === "NEW_DEVICE"));
});

// 2. Velocity & Structuring Tests
test("3. Velocity Detector: Identifies micro-structuring beneath regulatory limit", () => {
  const result = analyzeVelocity({
    customer: "U-8821",
    amount: 24800, // Just under BDT 25,000 threshold
  });

  assert.equal(result.isMicroStructuring, true);
  assert.ok(result.velocityScore >= 70);
});

test("4. Velocity Detector: Flags rapid transfer burst", () => {
  const result = analyzeVelocity({
    customer: "U-8821",
    amount: 15000,
    flags: ["Micro-structuring velocity: 6 transfers in 180 seconds"],
  });

  assert.equal(result.isBurst, true);
  assert.ok(result.velocityScore >= 80);
});

// 3. Account Takeover (ATO) Detection Tests
test("5. ATO Detector: Detects post-reset nocturnal cash-out", () => {
  const result = detectAccountTakeover(
    {
      customer: "U-2214",
      amount: 32000,
      type: "Cash Out",
      device: "DEV-9932",
      isNewDevice: true,
      time: "03:15 AM",
      flags: ["USSD credential reset preceding transaction", "Immediate full-balance cash-out attempt"],
    },
    { pinResetMinutesAgo: 15 }
  );

  assert.equal(result.isPotentialATO, true);
  assert.ok(result.atoScore >= 80, `Expected ATO score >= 80, got ${result.atoScore}`);
  assert.ok(result.signals.length >= 2);
});

// 4. Money Mule Ring Detection Tests
test("6. Mule Detector: Flags direct hit to Mule Syndicate Cluster #17", () => {
  const result = detectMuleActivity({
    customer: "U-1042",
    recipient: "U-8831", // Known primary mule conduit
    amount: 48500,
  });

  assert.equal(result.isMuleDetected, true);
  assert.equal(result.muleClusterId, 17);
  assert.ok(result.muleScore >= 90);
});

// 5. Compliance & Rule Engine Tests
test("7. Rule Engine: Triggers Bangladesh Bank high-value scrutiny threshold", () => {
  const result = evaluateRules({
    amount: 65000, // > 50,000 BDT
    time: "03:30 PM",
  });

  assert.ok(result.triggeredRules.some((r) => r.ruleId === "RULE_BB_HIGH_VALUE"));
});

test("8. Rule Engine: Triggers SIM swap 24h cooling-off violation", () => {
  const result = evaluateRules(
    {
      amount: 45000,
      flags: ["Sim swap detected"],
    },
    { simSwapDetected: true }
  );

  assert.equal(result.highestSeverity, "Critical");
  assert.ok(result.triggeredRules.some((r) => r.ruleId === "RULE_SIM_SWAP_COOL_DOWN"));
});

// 6. Network Graph Intelligence Tests
test("9. Network Analyzer: Calculates 1-hop distance to mule syndicate", () => {
  const result = globalNetworkIntelligence.assessTransaction({
    customer: "U-1042",
    recipient: "U-8831",
    device: "DEV-8821",
  });

  assert.ok(result.isMuleCluster);
  assert.ok(result.riskScore >= 85);
});

// 7. Composite Risk Scorer Tests
test("10. Composite Scorer: Approves benign transaction with low risk score", () => {
  const assessment = evaluateRisk({
    customer: "U-2910",
    recipient: "M-291",
    amount: 2450,
    type: "Merchant Pay",
    device: "DEV-2910",
    isNewDevice: false,
    location: "Dhaka",
    isNewLocation: false,
    time: "02:30 PM",
  });

  assert.equal(assessment.riskLevel, "Low");
  assert.ok(assessment.riskScore < 45);
  assert.ok(assessment.recommendedActions.some((a) => a.action === "ALLOW"));
});

test("11. Composite Scorer: Flags critical multi-vector attack with human oversight requirement", () => {
  const assessment = evaluateRisk({
    customer: "U-1042",
    recipient: "U-8831",
    amount: 48500,
    type: "Wallet Transfer",
    device: "DEV-8821",
    isNewDevice: true,
    location: "Dhaka",
    time: "02:13 AM",
    flags: ["Amount 4.8x above baseline", "Recipient linked to mule cluster #17"],
  });

  assert.equal(assessment.riskLevel, "Critical");
  assert.ok(assessment.riskScore >= 85);
  assert.ok(assessment.confidence >= 90);
  assert.ok(assessment.recommendedActions.some((a) => a.action === "HOLD"));
  assert.ok(assessment.recommendedActions.some((a) => a.humanOversightRequired === true));
});

// 8. Model Evaluation & Benchmark Metrics Tests
test("12. Model Evaluator: Computes genuine Confusion Matrix on 100 held-out samples", () => {
  const { metrics, predictions } = evaluateBenchmarkDataset();

  assert.equal(metrics.totalSamples, 100);
  assert.equal(predictions.length, 100);
  assert.equal(metrics.truePositives + metrics.falsePositives + metrics.trueNegatives + metrics.falseNegatives, 100);

  // Assert genuine production-prototype quality standards
  assert.ok(metrics.precision >= 0.85, `Precision too low: ${metrics.precision}`);
  assert.ok(metrics.recall >= 0.85, `Recall too low: ${metrics.recall}`);
  assert.ok(metrics.f1Score >= 0.85, `F1 Score too low: ${metrics.f1Score}`);
  assert.ok(metrics.accuracy >= 0.85, `Accuracy too low: ${metrics.accuracy}`);
  assert.ok(metrics.falsePositiveRate <= 0.15, `FPR too high: ${metrics.falsePositiveRate}`);

  console.log("   📊 Benchmark Evaluation Metrics:");
  console.log(`      • Total Held-out Samples: ${metrics.totalSamples}`);
  console.log(`      • True Positives (TP):    ${metrics.truePositives}`);
  console.log(`      • False Positives (FP):   ${metrics.falsePositives}`);
  console.log(`      • True Negatives (TN):    ${metrics.trueNegatives}`);
  console.log(`      • False Negatives (FN):   ${metrics.falseNegatives}`);
  console.log(`      • Precision:              ${(metrics.precision * 100).toFixed(1)}%`);
  console.log(`      • Recall:                 ${(metrics.recall * 100).toFixed(1)}%`);
  console.log(`      • F1 Score:               ${(metrics.f1Score * 100).toFixed(1)}%`);
  console.log(`      • Accuracy:               ${(metrics.accuracy * 100).toFixed(1)}%`);
  console.log(`      • False Positive Rate:    ${(metrics.falsePositiveRate * 100).toFixed(1)}%`);
});

// 9. Centralized Audit Log Tests
test("13. Audit Logger: Records and retrieves immutable session events", () => {
  const event = auditLogger.recordEvent({
    eventType: "ANALYST_ACTION",
    actor: "ANALYST: Arman Hossen",
    relatedId: "INV-1042",
    details: "Settlement hold placed on recipient U-8831 pending biometric verification.",
  });

  assert.ok(event.id.startsWith("AUDIT-"));
  assert.equal(event.actor, "ANALYST: Arman Hossen");

  const events = auditLogger.getEvents({ relatedId: "INV-1042" });
  assert.ok(events.length >= 1);
});

console.log("\n=================================================");
console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log("=================================================\n");
