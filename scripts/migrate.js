import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const password = process.env.SUPABASE_DB_PASSWORD || "k6miiFd7ZA-5rA%";
const host = "aws-0-ap-northeast-1.pooler.supabase.com";
const port = 6543;
const user = "postgres.odexyyeipgspqvdepvoi";

async function run() {
  const sqlPath = path.resolve(__dirname, "../supabase/migrations/20260301000000_initial_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log(`Connecting to ${host}:${port} as ${user}...`);
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
    console.log("Connected successfully to Supabase PostgreSQL!");
    console.log("Executing migration SQL script...");
    await client.query(sql);
    console.log("MIGRATION COMPLETED SUCCESSFULLY!");

    // Query tables created
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("Verified Public Tables in Supabase:", res.rows.map(r => r.table_name));
  } catch (err) {
    console.error("Migration execution failed:", err);
  } finally {
    await client.end();
  }
}

run();
