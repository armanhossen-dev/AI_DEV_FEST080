import { describe, it, expect } from "vitest";
import {
  extractFeatures,
  calculateFraudScore,
  calculateAnomalyScore,
  fuseRiskScores,
  generateExplanation,
  recommendAction,
  evaluateTransaction,
} from "../lib/risk-engine";
import { DbTransaction, BehavioralBaseline } from "../types";

describe("upay Sentinel — Modular Risk Engine Tests", () => {
  const normalBaseline: BehavioralBaseline = {
    customer_id: "CUST-001",
    average_amount: 2000,
    median_amount: 1800,
    max_normal_amount: 8000,
    normal_hours_start: 8,
    normal_hours_end: 22,
    avg_daily_count: 2,
    known_devices: ["DEV-PRIMARY-01"],
    known_locations: ["Dhaka"],
    known_beneficiaries: ["BEN-001"],
  };

  it("1. Normal Transaction produces Low Risk (< 30) and ALLOW recommendation", () => {
    const normalTxn: Omit<DbTransaction, "id" | "created_at"> = {
      transaction_reference: "TXN-NORM-01",
      sender_name: "Karim Rahman",
      sender_phone_masked: "+880 17** ***124",
      receiver_name: "Robi Axiata",
      receiver_phone_masked: "+880 18** ***999",
      amount: 450,
      currency: "BDT",
      transaction_type: "recharge",
      timestamp: "2026-10-07T14:30:00Z", // daytime 2:30 PM
      device_id: "DEV-PRIMARY-01",
      device_new: false,
      location: "Dhaka",
      beneficiary_new: false,
      ip_risk: 5,
      transaction_status: "completed",
    };

    const result = evaluateTransaction(normalTxn, normalBaseline);

    expect(result.final_risk_score).toBeLessThan(30);
    expect(result.risk_level).toBe("low");
    expect(result.recommended_action).toContain("ALLOW");
    expect(result.confidence).toBeGreaterThanOrEqual(60);
  });

  it("2. Large unusual transfer produces High Risk with abnormal amount factor", () => {
    const largeTxn: Omit<DbTransaction, "id" | "created_at"> = {
      transaction_reference: "TXN-LARGE-01",
      sender_name: "Karim Rahman",
      sender_phone_masked: "+880 17** ***124",
      receiver_name: "New Supplier",
      receiver_phone_masked: "+880 19** ***555",
      amount: 45000, // 25x median
      currency: "BDT",
      transaction_type: "send_money",
      timestamp: "2026-10-07T12:00:00Z",
      device_id: "DEV-PRIMARY-01", // known device
      device_new: false,
      location: "Dhaka",
      beneficiary_new: true,
      ip_risk: 30,
      transaction_status: "pending",
    };

    const result = evaluateTransaction(largeTxn, normalBaseline);

    expect(result.final_risk_score).toBeGreaterThanOrEqual(50);
    expect(result.features.amount_deviation).toBeGreaterThan(15);
    expect(result.factors.some((f) => f.factor_code === "ABNORMAL_AMOUNT")).toBe(true);
    expect(result.recommended_action).toMatch(/VERIFY|HOLD|MONITOR/);
  });

  it("3. New Device + New Beneficiary + Off-hours produces Critical Risk (>= 80) and HOLD recommendation", () => {
    const atoTxn: Omit<DbTransaction, "id" | "created_at"> = {
      transaction_reference: "TXN-ATO-01",
      sender_name: "Karim Rahman",
      sender_phone_masked: "+880 17** ***124",
      receiver_name: "Mule Account #99",
      receiver_phone_masked: "+880 16** ***111",
      amount: 48500,
      currency: "BDT",
      transaction_type: "send_money",
      timestamp: "2026-10-07T02:13:00Z", // 02:13 AM dead night
      device_id: "DEV-EMULATOR-NEW",
      device_new: true,
      location: "Dhaka",
      beneficiary_new: true,
      ip_risk: 92,
      transaction_status: "pending",
    };

    const result = evaluateTransaction(atoTxn, normalBaseline);

    expect(result.final_risk_score).toBeGreaterThanOrEqual(80);
    expect(result.risk_level).toBe("critical");
    expect(result.recommended_action).toContain("HOLD");
    // Concrete explainable factors
    const codes = result.factors.map((f) => f.factor_code);
    expect(codes).toContain("ABNORMAL_AMOUNT");
    expect(codes).toContain("NEW_BENEFICIARY");
    expect(codes).toContain("NEW_DEVICE");
  });

  it("4. Anomaly does NOT automatically equal fraud: verifies distinct scoring", () => {
    const features = extractFeatures(
      {
        transaction_reference: "TXN-ANOM-TEST",
        sender_name: "Test User",
        sender_phone_masked: "+880 17** ***124",
        receiver_name: "Known Outlet",
        receiver_phone_masked: "+880 18** ***999",
        amount: 8500, // moderately high
        currency: "BDT",
        transaction_type: "merchant_payment",
        timestamp: "2026-10-07T15:00:00Z",
        device_id: "DEV-PRIMARY-01",
        device_new: false,
        location: "Dhaka",
        beneficiary_new: false,
        ip_risk: 10,
        transaction_status: "completed",
      },
      normalBaseline
    );

    const fraud = calculateFraudScore(features);
    const anomaly = calculateAnomalyScore(features);

    // Fraud score should remain modest because hardware and beneficiary are trusted
    expect(fraud).toBeLessThan(45);
    // Anomaly score reflects moderate deviation without marking critical criminal fraud
    expect(anomaly).toBeGreaterThanOrEqual(10);
  });

  it("5. Confidence is independently calculated and never identically equal to risk score", () => {
    const fusion1 = fuseRiskScores(90, 85, 70);
    expect(fusion1.confidence).not.toBe(fusion1.final_risk_score);

    const fusion2 = fuseRiskScores(10, 15, 10);
    expect(fusion2.confidence).not.toBe(fusion2.final_risk_score);
  });
});
