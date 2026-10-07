import {
  DbTransaction,
  RiskAssessment,
  InvestigationCase,
  DemoScenario,
  BehavioralBaseline,
  InvestigationAction,
} from "@/types";
import { evaluateTransaction } from "@/lib/risk-engine";

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "SCENARIO_NORMAL",
    title: "1. Normal Daytime Recharge",
    subtitle: "Low Risk — Baseline Concordance",
    description: "Habitual mobile recharge of ৳350 at 02:30 PM from the primary verified smartphone. Conforms 100% to historical habits.",
    expectedRiskLevel: "low",
    baseline: {
      customer_id: "CUST-NORM-01",
      average_amount: 500,
      median_amount: 350,
      max_normal_amount: 3000,
      normal_hours_start: 8,
      normal_hours_end: 22,
      avg_daily_count: 2,
      known_devices: ["DEV-PRIMARY-SAMSUNG"],
      known_locations: ["Dhaka"],
      known_beneficiaries: ["BEN-ROBI-01"],
    },
    transaction: {
      transaction_reference: "TXN-NORM-0012",
      sender_name: "Karim Rahman",
      sender_phone_masked: "+880 17** ***124",
      receiver_name: "Robi Axiata Ltd",
      receiver_phone_masked: "+880 18** ***999",
      amount: 350,
      currency: "BDT",
      transaction_type: "recharge",
      timestamp: new Date().toISOString(),
      device_id: "DEV-PRIMARY-SAMSUNG",
      device_new: false,
      location: "Dhaka",
      beneficiary_new: false,
      ip_risk: 4,
      transaction_status: "completed",
    },
  },
  {
    id: "SCENARIO_ANOMALY",
    title: "2. High-Value Anomaly (Not Fraud)",
    subtitle: "High Risk — Large Outlier Transfer",
    description: "A ৳65,000 wallet transfer to purchase seasonal supplies. Initiated from known device during regular hours, but amount is 15× higher than median.",
    expectedRiskLevel: "high",
    baseline: {
      customer_id: "CUST-ANOM-02",
      average_amount: 4200,
      median_amount: 3500,
      max_normal_amount: 15000,
      normal_hours_start: 9,
      normal_hours_end: 21,
      avg_daily_count: 3,
      known_devices: ["DEV-OFFICE-MAC"],
      known_locations: ["Chattogram"],
      known_beneficiaries: ["BEN-SUPPLIER-01"],
    },
    transaction: {
      transaction_reference: "TXN-ANOM-7821",
      sender_name: "Nusrat Jahan",
      sender_phone_masked: "+880 18** ***551",
      receiver_name: "Chattogram Agro Store",
      receiver_phone_masked: "+880 19** ***342",
      amount: 65000,
      currency: "BDT",
      transaction_type: "send_money",
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      device_id: "DEV-OFFICE-MAC",
      device_new: false,
      location: "Chattogram",
      beneficiary_new: true,
      ip_risk: 32,
      transaction_status: "under_review",
    },
  },
  {
    id: "SCENARIO_ATO",
    title: "3. Account Takeover (ATO) Pattern",
    subtitle: "Critical Risk — Midnight Account Drain",
    description: "Account compromised via SIM swap/phishing. New unrecognized device logs in at 02:13 AM, adds an unknown recipient, and initiates a ৳48,500 maximum drain transfer.",
    expectedRiskLevel: "critical",
    baseline: {
      customer_id: "CUST-VICTIM-03",
      average_amount: 2100,
      median_amount: 1800,
      max_normal_amount: 8000,
      normal_hours_start: 8,
      normal_hours_end: 22,
      avg_daily_count: 2,
      known_devices: ["DEV-HOME-REALME"],
      known_locations: ["Dhaka"],
      known_beneficiaries: [],
    },
    transaction: {
      transaction_reference: "TXN-CRIT-ATO-8821",
      sender_name: "Tanvir Hossain",
      sender_phone_masked: "+880 17** ***912",
      receiver_name: "Syndicate Mule Acc #14",
      receiver_phone_masked: "+880 19** ***831",
      amount: 48500,
      currency: "BDT",
      transaction_type: "send_money",
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      device_id: "DEV-SUSP-9921",
      device_new: true,
      location: "Dhaka",
      beneficiary_new: true,
      ip_risk: 88,
      transaction_status: "held",
    },
  },
  {
    id: "SCENARIO_SYNDICATE",
    title: "4. Mule Syndicate / Rapid Velocity Burst",
    subtitle: "Critical Risk — Micro-Structuring Wave",
    description: "Money mule ring dispersing illicit funds across 7 consecutive transactions in under 10 minutes from a high-risk proxy IP.",
    expectedRiskLevel: "critical",
    baseline: {
      customer_id: "CUST-MULE-04",
      average_amount: 3000,
      median_amount: 2500,
      max_normal_amount: 10000,
      normal_hours_start: 9,
      normal_hours_end: 20,
      avg_daily_count: 1,
      known_devices: [],
      known_locations: ["Sylhet"],
      known_beneficiaries: [],
    },
    transaction: {
      transaction_reference: "TXN-CRIT-BURST-9904",
      sender_name: "Arif Chowdhury",
      sender_phone_masked: "+880 15** ***762",
      receiver_name: "Syndicate Drop Hub #09",
      receiver_phone_masked: "+880 16** ***411",
      amount: 42000,
      currency: "BDT",
      transaction_type: "cash_out",
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      device_id: "DEV-EMULATOR-819",
      device_new: true,
      location: "Sylhet",
      beneficiary_new: true,
      ip_risk: 94,
      transaction_status: "blocked",
    },
  },
];

// In-memory demo store initialized from curated scenarios
export function generateCuratedDemoState() {
  const transactions: DbTransaction[] = [];
  const assessments: Record<string, RiskAssessment> = {};
  const investigations: InvestigationCase[] = [];
  const actions: InvestigationAction[] = [];

  DEMO_SCENARIOS.forEach((scenario, index) => {
    const id = `txn-demo-${index + 1}`;
    const txn: DbTransaction = {
      ...scenario.transaction,
      id,
      created_at: new Date(Date.now() - (index + 1) * 3600000).toISOString(),
    };
    transactions.push(txn);

    const evaluated = evaluateTransaction(txn, scenario.baseline);
    const assessId = `assess-demo-${index + 1}`;
    const assessment: RiskAssessment = {
      id: assessId,
      transaction_id: id,
      fraud_score: evaluated.fraud_score,
      anomaly_score: evaluated.anomaly_score,
      account_risk_score: evaluated.account_risk_score,
      final_risk_score: evaluated.final_risk_score,
      risk_level: evaluated.risk_level,
      confidence: evaluated.confidence,
      model_version: "v1.4.2-sentinel-fusion",
      explanation_summary: evaluated.explanation_summary,
      recommended_action: evaluated.recommended_action,
      created_at: txn.created_at,
      factors: evaluated.factors,
    };
    assessments[id] = assessment;

    if (evaluated.risk_level === "critical" || evaluated.risk_level === "high") {
      const invId = `inv-demo-${index + 1}`;
      investigations.push({
        id: invId,
        transaction_id: id,
        assigned_to: null,
        status: evaluated.risk_level === "critical" ? "investigating" : "open",
        priority: evaluated.risk_level === "critical" ? "critical" : "high",
        investigator_notes: `Auto-flagged case for transaction ${txn.transaction_reference}. Composite risk score: ${evaluated.final_risk_score}/100.`,
        final_decision: txn.transaction_status === "held" ? "held" : txn.transaction_status === "blocked" ? "blocked" : null,
        created_at: txn.created_at,
        updated_at: txn.created_at,
        transaction: txn,
        assessment,
      });

      actions.push({
        id: `act-demo-${index + 1}`,
        investigation_id: invId,
        actor_name: "Sentinel Risk Engine",
        action_type: "opened_case",
        action_details: { risk_level: evaluated.risk_level, score: evaluated.final_risk_score },
        created_at: txn.created_at,
      });
    }
  });

  return { transactions, assessments, investigations, actions };
}
