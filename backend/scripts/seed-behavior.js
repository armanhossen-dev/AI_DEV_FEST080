import pg from "pg";

async function seedBehavior() {
  const client = new pg.Client({
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: 6543,
    user: "postgres.odexyyeipgspqvdepvoi",
    password: process.env.SUPABASE_DB_PASSWORD || "k6miiFd7ZA-5rA%",
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log("Connected to Supabase to seed customer behavior profiles...");

    // Get distinct sender names
    const res = await client.query(`SELECT DISTINCT sender_name, location FROM transactions LIMIT 150;`);
    console.log(`Found ${res.rows.length} unique customers.`);

    for (const row of res.rows) {
      await client.query(`
        INSERT INTO customer_behavior_profiles (
          customer_identifier, average_amount, median_amount,
          transaction_count_daily, normal_transaction_start_hour,
          normal_transaction_end_hour, known_device_count,
          known_beneficiary_count, typical_location
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (customer_identifier) DO NOTHING;
      `, [
        row.sender_name,
        parseFloat((1500 + Math.random() * 2500).toFixed(2)),
        parseFloat((1200 + Math.random() * 1800).toFixed(2)),
        parseFloat((1.5 + Math.random() * 2.5).toFixed(1)),
        8,
        22,
        Math.floor(1 + Math.random() * 2),
        Math.floor(3 + Math.random() * 5),
        row.location || "Dhaka",
      ]);
    }
    console.log("CUSTOMER BEHAVIOR PROFILES SEEDED SUCCESSFULLY!");
  } catch (err) {
    console.error("Seed behavior error:", err);
  } finally {
    await client.end();
  }
}

seedBehavior();
