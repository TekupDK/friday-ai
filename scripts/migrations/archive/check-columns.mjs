import dotenv from "dotenv";
import pg from "pg";

// Load environment variables from a specific path if provided,
// otherwise fall back to .env. This prevents overriding values
// injected via dotenv-cli (e.g. .env.prod).
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env" });

const { Client } = pg;

// Normalize the connection string similarly to drizzle.config.ts:
// - enforce sslmode=no-verify
// - strip any schema param (we explicitly query information_schema)
const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error("Missing DATABASE_URL in environment");
}

const url = new URL(rawUrl);
// Replace sslmode if present
if (url.searchParams.has("sslmode")) {
  url.searchParams.set("sslmode", "no-verify");
} else {
  url.searchParams.append("sslmode", "no-verify");
}
// Remove schema to avoid driver confusion
if (url.searchParams.has("schema")) {
  url.searchParams.delete("schema");
}

const client = new Client({
  connectionString: url.toString(),
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  // Check email_threads columns
  const result = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'friday_ai' 
    AND table_name = 'email_threads' 
    ORDER BY ordinal_position
  `);

  console.log("\n📊 Columns in email_threads table:");
  result.rows.forEach(row => {
    console.log(`  - ${row.column_name}`);
  });

  // Check users table
  const usersResult = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'friday_ai' 
    AND table_name = 'users' 
    ORDER BY ordinal_position
  `);

  console.log("\n📊 Columns in users table:");
  usersResult.rows.forEach(row => {
    console.log(`  - ${row.column_name}`);
  });

  // Check leads table
  const leadsResult = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'friday_ai' 
    AND table_name = 'leads' 
    ORDER BY ordinal_position
  `);

  console.log("\n📊 Columns in leads table:");
  leadsResult.rows.forEach(row => {
    console.log(`  - ${row.column_name}`);
  });
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await client.end();
}
