import pg from "pg";
import { v4 as uuidv4 } from "uuid";

const password = process.env.SUPABASE_DB_PASSWORD || "k6miiFd7ZA-5rA%";
const host = "aws-0-ap-northeast-1.pooler.supabase.com";
const port = 6543;
const user = "postgres.odexyyeipgspqvdepvoi";

async function populateRelatedTables() {
  console.log(`Connecting to ${host} to link risk assessments & features to all transactions...`);
  const client = new pg.Client({
    host,
    port,
    user,
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();

    const txns = await client.query(`
      SELECT t.id, t.transaction_reference, t.amount, t.device_new, t.beneficiary_new, t.ip_risk, t.transaction_status, t.timestamp
      FROM transactions t
      LEFT JOIN risk_assessments r ON r.transaction_id = t.id
      WHERE r.id IS NULL;
    `);

    console.log(`Found ${txns.rows.length} transactions needing risk assessment & features.`);

    for (const txn of txns.rows) {
      const amount = parseFloat(txn.amount);
      const isCritical = amount > 35000 || txn.ip_risk > 70;
      const isSuspicious = amount > 18000 || txn.ip_risk > 45;

      let riskScore = 15;
      let riskLevel = "low";

      if (isCritical) {
        riskScore = Math.floor(82 + Math.random() * 16);
        riskLevel = "critical";
      } else if (isSuspicious) {
        riskScore = Math.floor(61 + Math.random() * 18);
        riskLevel = "high";
      } else if (amount > 8000) {
        riskScore = Math.floor(35 + Math.random() * 20);
        riskLevel = "medium";
      }

      const fraud = Math.min(100, Math.round(riskScore * 1.05));
      const anomaly = Math.min(100, Math.round(riskScore * 0.95));
      const assessId = uuidv4();

      let summary = "NORMAL ACTIVITY: Matches customary user baseline envelope.";
      let recommendation = "ALLOW — Continue normal monitoring";
      if (riskLevel === "critical") {
        summary = `CRITICAL RISK: High-value transaction of ৳${amount.toLocaleString()} flags multiple behavioral anomalies (deviation ratio ${(amount/2200).toFixed(1)}x) and new hardware signature.`;
        recommendation = "HOLD — Temporarily hold transaction and escalate for investigation";
      } else if (riskLevel === "high") {
        summary = `HIGH RISK: Large transfer of ৳${amount.toLocaleString()} with elevated IP risk requires analyst verification.`;
        recommendation = "VERIFY — Require additional verification and analyst review";
      } else if (riskLevel === "medium") {
        summary = `ELEVATED ANOMALY: Moderate behavioral divergence detected.`;
        recommendation = "MONITOR — Additional behavioral monitoring recommended";
      }

      // Insert features
      await client.query(`
        INSERT INTO transaction_features (
          transaction_id, amount_deviation, velocity_score, time_anomaly_score,
          device_anomaly_score, location_anomaly_score, beneficiary_anomaly_score,
          historical_behavior_score, failed_attempt_score, account_age_score
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING;
      `, [
        txn.id,
        parseFloat((amount / 2200).toFixed(2)),
        isCritical ? 80 : 15,
        new Date(txn.timestamp).getHours() < 5 ? 85 : 0,
        txn.device_new ? 85 : 5,
        isSuspicious ? 65 : 5,
        txn.beneficiary_new ? 80 : 10,
        Math.min(100, Math.round((amount / 2200) * 10)),
        isCritical ? 65 : 5,
        25,
      ]);

      // Insert assessment
      await client.query(`
        INSERT INTO risk_assessments (
          id, transaction_id, fraud_score, anomaly_score, account_risk_score,
          final_risk_score, risk_level, confidence, explanation_summary, recommended_action
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING;
      `, [
        assessId,
        txn.id,
        fraud,
        anomaly,
        Math.floor(riskScore * 0.7),
        riskScore,
        riskLevel,
        Math.floor(70 + Math.random() * 20),
        summary,
        recommendation,
      ]);

      // Insert factors for high/critical
      if (isCritical || isSuspicious) {
        await client.query(`
          INSERT INTO risk_factors (
            assessment_id, factor_code, factor_name, description, contribution, severity, evidence
          ) VALUES ($1, $2, $3, $4, $5, $6, $7);
        `, [
          assessId,
          isCritical ? "ABNORMAL_AMOUNT" : "NEW_BENEFICIARY",
          isCritical ? "Abnormal Amount Deviation" : "Unrecognized Beneficiary",
          `Transaction amount ৳${amount.toLocaleString()} flags elevated operational scrutiny.`,
          isCritical ? 26 : 18,
          isCritical ? "critical" : "high",
          `Amount: ৳${amount.toLocaleString()}. Composite risk score: ${riskScore}/100.`,
        ]);

        // Insert investigation
        const invRes = await client.query(`
          INSERT INTO investigations (
            transaction_id, status, priority, investigator_notes, final_decision
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id;
        `, [
          txn.id,
          isCritical ? "investigating" : "open",
          isCritical ? "critical" : "high",
          `Automatically routed by Sentinel Risk Engine (Score: ${riskScore}/100).`,
          txn.transaction_status === "held" ? "held" : txn.transaction_status === "blocked" ? "blocked" : null,
        ]);

        if (invRes.rows.length > 0) {
          await client.query(`
            INSERT INTO investigation_actions (
              investigation_id, actor_name, action_type, action_details
            ) VALUES ($1, $2, $3, $4);
          `, [
            invRes.rows[0].id,
            "Sentinel Risk Engine",
            "opened_case",
            JSON.stringify({ risk_level: riskLevel, risk_score: riskScore }),
          ]);
        }
      }
    }

    console.log("ALL RISK ASSESSMENTS, FEATURES, AND INVESTIGATIONS FULLY POPULATED!");
  } catch (err) {
    console.error("Populate error:", err);
  } finally {
    await client.end();
  }
}

populateRelatedTables();
