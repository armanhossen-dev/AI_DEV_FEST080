import { describe, it, expect, vi } from "vitest";
import {
  extractFeatures,
  calculateFraudScore,
  calculateAnomalyScore,
  fuseRiskScores,
  generateExplanation,
  recommendAction,
  analyzeTransactionObject,
} from "../lib/risk-engine";
import { calculateProfileDeviation } from "../services/behavior-service";
import { executeCopilotTool } from "../../server/copilot-tools";
import { CopilotResponseSchema } from "../services/copilot-service";
import { DbTransaction, BehavioralBaseline } from "../types";

describe("upay Sentinel — Comprehensive Backend & ML Intelligence Tests", () => {
  const sampleBaseline: BehavioralBaseline = {
    customer_id: "Karim Rahman",
    average_amount: 2200,
    median_amount: 1850,
    max_normal_amount: 8000,
    normal_hours_start: 8,
    normal_hours_end: 22,
    avg_daily_count: 2,
    known_devices: ["DEV-TRUSTED-01"],
    known_locations: ["Dhaka"],
    known_beneficiaries: ["BEN-RECHARGE"],
  };

  // ============================================================================
  // 1. FEATURE ENGINEERING TESTS
  // ============================================================================
  describe("Feature Engineering Layer", () => {
    it("computes accurate amount deviation against median baseline", () => {
      const normalTxn: any = {
        amount: 1850,
        device_id: "DEV-TRUSTED-01",
        device_new: false,
        beneficiary_new: false,
        location: "Dhaka",
        timestamp: "2026-10-07T12:00:00Z",
        ip_risk: 0,
      };
      const feats = extractFeatures(normalTxn, sampleBaseline);
      expect(feats.amount_deviation).toBe(1.0);
      expect(feats.device_anomaly_score).toBeLessThanOrEqual(10);
      expect(feats.beneficiary_anomaly_score).toBeLessThanOrEqual(10);

      const spikeTxn: any = {
        ...normalTxn,
        amount: 37000, // 20x median
      };
      const spikeFeats = extractFeatures(spikeTxn, sampleBaseline);
      expect(spikeFeats.amount_deviation).toBe(20.0);
    });

    it("detects off-hours transaction deviation", () => {
      const midnightTxn: any = {
        amount: 5000,
        device_id: "DEV-TRUSTED-01",
        device_new: false,
        beneficiary_new: false,
        location: "Dhaka",
        timestamp: "2026-10-07T03:15:00Z", // 3:15 AM
        ip_risk: 10,
      };
      const feats = extractFeatures(midnightTxn, sampleBaseline);
      expect(feats.time_anomaly_score).toBeGreaterThan(50);
    });

    it("evaluates behavioral profile deviation vector correctly", () => {
      const dev = calculateProfileDeviation(
        {
          amount: 45000,
          timestamp: "2026-10-07T02:00:00Z",
          device_new: true,
          beneficiary_new: true,
          location: "Sylhet",
        },
        {
          customerIdentifier: "Karim Rahman",
          averageAmount: 2200,
          medianAmount: 1850,
          transactionCountDaily: 2,
          normalHoursStart: 8,
          normalHoursEnd: 22,
          knownDeviceCount: 1,
          knownBeneficiaryCount: 3,
          typicalLocation: "Dhaka",
          updatedAt: new Date().toISOString(),
        }
      );

      expect(dev.isAmountAbnormal).toBe(true);
      expect(dev.isTimeOffHours).toBe(true);
      expect(dev.isNewDevice).toBe(true);
      expect(dev.isNewBeneficiary).toBe(true);
      expect(dev.isLocationMismatch).toBe(true);
      expect(dev.deviationSummary).toContain("Sylhet");
    });
  });

  // ============================================================================
  // 2. FRAUD MODEL & ANOMALY DETECTION TESTS
  // ============================================================================
  describe("ML Fraud & Anomaly Scoring Layer", () => {
    it("scores normal transaction low on fraud and anomaly", () => {
      const feats = extractFeatures(
        {
          amount: 500,
          device_id: "DEV-TRUSTED-01",
          device_new: false,
          beneficiary_new: false,
          location: "Dhaka",
          timestamp: "2026-10-07T14:00:00Z",
          ip_risk: 0,
        } as any,
        sampleBaseline
      );

      const fraud = calculateFraudScore(feats);
      const anomaly = calculateAnomalyScore(feats);

      expect(fraud).toBeLessThan(25);
      expect(anomaly).toBeLessThan(25);
    });

    it("scores multi-factor account takeover as critical fraud", () => {
      const atoFeats = extractFeatures(
        {
          amount: 48500,
          device_id: "DEV-SUSPICIOUS-NEW",
          device_new: true,
          beneficiary_new: true,
          location: "Dhaka",
          timestamp: "2026-10-07T02:30:00Z",
          ip_risk: 95,
        } as any,
        sampleBaseline
      );

      const fraud = calculateFraudScore(atoFeats);
      const anomaly = calculateAnomalyScore(atoFeats);

      expect(fraud).toBeGreaterThanOrEqual(75);
      expect(anomaly).toBeGreaterThanOrEqual(75);
    });

    it("preserves distinction between unusual behavior and fraudulent intent", () => {
      // High amount from trusted device during daytime to known beneficiary
      const unusualFeats = extractFeatures(
        {
          amount: 25000,
          device_id: "DEV-TRUSTED-01",
          device_new: false,
          beneficiary_new: false,
          location: "Dhaka",
          timestamp: "2026-10-07T11:00:00Z",
          ip_risk: 5,
        } as any,
        sampleBaseline
      );

      const fraud = calculateFraudScore(unusualFeats);
      const anomaly = calculateAnomalyScore(unusualFeats);

      // Anomaly is elevated due to 13x amount, but fraud probability remains controlled because device is authentic
      expect(anomaly).toBeGreaterThan(fraud);
    });
  });

  // ============================================================================
  // 3. RISK FUSION & CONFIDENCE CALCULATION
  // ============================================================================
  describe("Risk Fusion & Confidence Layer", () => {
    it("fuses scores within bounds 0-100 with accurate severity mapping", () => {
      const low = fuseRiskScores(15, 10, 10, 5);
      expect(low.final_risk_score).toBeLessThan(30);
      expect(low.risk_level).toBe("low");

      const med = fuseRiskScores(45, 50, 40, 30);
      expect(med.risk_level).toBe("medium");

      const high = fuseRiskScores(70, 75, 60, 50);
      expect(high.risk_level).toBe("high");

      const crit = fuseRiskScores(95, 90, 85, 90);
      expect(crit.final_risk_score).toBeGreaterThanOrEqual(80);
      expect(crit.risk_level).toBe("critical");
    });

    it("calculates confidence independently from final risk score", () => {
      const res = fuseRiskScores(85, 80, 75, 70);
      expect(res.confidence).not.toBe(res.final_risk_score);
      expect(res.confidence).toBeGreaterThanOrEqual(60);
      expect(res.confidence).toBeLessThanOrEqual(100);
    });
  });

  // ============================================================================
  // 4. EXPLAINABILITY & ADVISORY RECOMMENDATIONS
  // ============================================================================
  describe("Explainable AI & Recommendations", () => {
    it("generates concrete factor codes and human-readable evidence strings", () => {
      const feats = extractFeatures(
        {
          amount: 48500,
          device_id: "DEV-UNSEEN",
          device_new: true,
          beneficiary_new: true,
          location: "Dhaka",
          timestamp: "2026-10-07T02:00:00Z",
          ip_risk: 88,
        } as any,
        sampleBaseline
      );

      const { factors } = generateExplanation(feats, 88, "critical", 48500);
      expect(factors.length).toBeGreaterThan(0);

      const codes = factors.map((f) => f.factor_code);
      expect(codes).toContain("ABNORMAL_AMOUNT");
      expect(codes).toContain("NEW_DEVICE");
      expect(codes).toContain("NEW_BENEFICIARY");

      factors.forEach((f) => {
        expect(f.description).toBeTruthy();
        expect(f.evidence).toBeTruthy();
        expect(f.contribution).toBeGreaterThan(0);
      });
    });

    it("maps risk severity to correct advisory actions with human-in-the-loop disclaimers", () => {
      const crit = recommendAction("critical", 92);
      expect(crit.actionCode).toBe("HOLD");
      expect(crit.advisoryDisclaimer).toContain("Final authority remains strictly with authorized human fraud investigators");

      const high = recommendAction("high", 65);
      expect(high.actionCode).toBe("VERIFY");

      const med = recommendAction("medium", 40);
      expect(med.actionCode).toBe("MONITOR");

      const low = recommendAction("low", 15);
      expect(low.actionCode).toBe("ALLOW");
    });
  });

  // ============================================================================
  // 5. MASTER RISK SERVICE END-TO-END PIPELINE
  // ============================================================================
  describe("Master Risk Orchestrator (analyzeTransactionObject)", () => {
    it("runs complete end-to-end evaluation pipeline deterministically", () => {
      const txn: any = {
        transaction_reference: "TXN-TEST-PIPELINE",
        sender_name: "Karim Rahman",
        sender_phone_masked: "+880 17** ***124",
        receiver_name: "Recipient Outlet",
        receiver_phone_masked: "+880 18** ***999",
        amount: 45000,
        currency: "BDT",
        transaction_type: "send_money",
        timestamp: "2026-10-07T02:30:00Z",
        device_id: "DEV-NEW-888",
        device_new: true,
        location: "Dhaka",
        beneficiary_new: true,
        ip_risk: 85,
        transaction_status: "pending",
      };

      const result = analyzeTransactionObject(txn, sampleBaseline);

      expect(result.transactionId).toBe("TXN-SIMULATED");
      expect(result.finalRiskScore).toBeGreaterThanOrEqual(80);
      expect(result.riskLevel).toBe("critical");
      expect(result.fraudProbability).toBeGreaterThan(0.7);
      expect(result.recommendation.actionCode).toBe("HOLD");
      expect(result.factors.length).toBeGreaterThan(0);
      expect(result.modelVersion).toBe("sentinel-hybrid-v2.1");
    });
  });

  // ============================================================================
  // 6. GEMINI TOOLS & SAFETY POLICY TESTS
  // ============================================================================
  describe("Gemini Sentinel Copilot Tool Calling & Permissions", () => {
    it("denies autonomous approval, blocking, or funds release", async () => {
      const resApprove = await executeCopilotTool("approve_transaction", { transaction_id: "123" });
      expect(resApprove.status).toBe("denied");
      expect(resApprove.error).toContain("strictly require human investigator confirmation");

      const resBlock = await executeCopilotTool("block_transaction", { transaction_id: "123" });
      expect(resBlock.status).toBe("denied");

      const resAlter = await executeCopilotTool("alter_risk_score", { transaction_id: "123", score: 10 });
      expect(resAlter.status).toBe("denied");
    });

    it("handles unknown tool gracefully", async () => {
      const res = await executeCopilotTool("drop_database_table", {});
      expect(res.status).toBe("error");
      expect(res.error).toContain("Unknown tool name");
    });

    it("validates structured copilot response schema with Zod", () => {
      const validPayload = {
        intent: "investigation_analysis",
        summary: "Transaction TXN-01 is critical due to novel device and high amount.",
        risk_level: "critical",
        risk_score: 91,
        key_findings: ["Unrecognized hardware ID", "New recipient"],
        evidence: ["Hardware ID DEV-99 not seen previously"],
        recommended_actions: ["Temporarily hold transaction"],
        requires_human_review: true,
        confidence: 85,
        referenced_transaction_ids: ["TXN-01"],
        referenced_investigation_ids: [],
      };

      const parsed = CopilotResponseSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);

      const invalidPayload = {
        intent: "investigation_analysis",
        risk_score: "not-a-number", // wrong type
      };
      const invalidParsed = CopilotResponseSchema.safeParse(invalidPayload);
      expect(invalidParsed.success).toBe(false);
    });
  });
});
