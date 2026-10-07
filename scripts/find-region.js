import pg from "pg";

const regions = [
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "eu-north-1",
  "ca-central-1",
  "me-central-1",
  "sa-east-1"
];

const password = "k6miiFd7ZA-5rA%";
const projectRef = "odexyyeipgspqvdepvoi";

async function findRegion() {
  for (const reg of regions) {
    const host = `aws-0-${reg}.pooler.supabase.com`;
    const client = new pg.Client({
      host,
      port: 6543,
      user: `postgres.${projectRef}`,
      password: password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3500,
    });
    try {
      await client.connect();
      console.log(`FOUND REGION: ${reg}! Host: ${host}`);
      await client.end();
      return reg;
    } catch (err) {
      if (!err.message.includes("not found")) {
        console.log(`Region ${reg} returned:`, err.message);
      }
    }
  }
  console.log("No pooler region matched.");
}

findRegion();
