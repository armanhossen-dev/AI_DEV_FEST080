import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20260301000001_copilot_behavior_schema.sql"), "utf-8");
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
    console.log("Connected to Supabase PostgreSQL!");
    await client.query(sql);
    console.log("MIGRATION 2 EXECUTED SUCCESSFULLY!");

    const r = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log("All Public Tables in Supabase:", r.rows.map(x => x.table_name));
  } catch (err) {
    console.error("Migration 2 error:", err);
  } finally {
    await client.end();
  }
}

run();
