import "dotenv/config";
import { sql } from "drizzle-orm";

import * as db from "../db";

// Simple cleanup for seedede CRM-data oprettet af crm-seed.ts
// Matcher kun entiteter med den unikke seedToken-prefix 'crm-seed-'
// Understøtter --dry-run for sikkerhed og valgfri --token=<prefix> (default 'crm-seed-')

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find(a => a.startsWith(prefix));
  return arg ? arg.substring(prefix.length) : undefined;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const token = getArg("token") || "crm-seed-";
  const like = `%${token}%`;

  const dbConn = await db.getDb();
  if (!dbConn) throw new Error("Database not available");

  const execCount = async (query: any, label: string) => {
    const res: any = await dbConn.execute(query);
    const row = Array.isArray(res) ? res[0] : (res?.[0] ?? res);
    const count = Number(row?.count ?? 0);
    console.log(`[crm-cleanup] ${label} (dry-run) matches:`, count);
    return count;
  };
  const execDelete = async (query: any, label: string) => {
    const res: any = await dbConn.execute(query);
    const rows = Array.isArray(res) ? res : [];
    const count = rows.length ?? Number((res as any)?.count ?? 0);
    console.log(`[crm-cleanup] ${label} deleted:`, count);
    return count;
  };

  // Bookings: notes indeholder 'Seed booking <token>'
  const countBookings = sql`SELECT COUNT(*) AS count FROM friday_ai.bookings WHERE notes ILIKE ${like}`;
  const delBookings = sql`DELETE FROM friday_ai.bookings WHERE notes ILIKE ${like} RETURNING id`;
  if (dryRun) await execCount(countBookings, "bookings");
  else await execDelete(delBookings, "bookings");

  // Customer properties: address/notes indeholder seedToken
  const countProps = sql`SELECT COUNT(*) AS count FROM friday_ai.customer_properties WHERE address ILIKE ${like} OR notes ILIKE ${like}`;
  const delProps = sql`DELETE FROM friday_ai.customer_properties WHERE address ILIKE ${like} OR notes ILIKE ${like} RETURNING id`;
  if (dryRun) await execCount(countProps, "customer_properties");
  else await execDelete(delProps, "customer_properties");

  // Leads: source er sat til seedToken og email/company indeholder token
  const countLeads = sql`SELECT COUNT(*) AS count FROM friday_ai.leads WHERE source ILIKE ${like} OR email ILIKE ${like} OR company ILIKE ${like}`;
  const delLeads = sql`DELETE FROM friday_ai.leads WHERE source ILIKE ${like} OR email ILIKE ${like} OR company ILIKE ${like} RETURNING id`;
  if (dryRun) await execCount(countLeads, "leads");
  else await execDelete(delLeads, "leads");

  // Customers: forsigtig cleanup — matcher på email eller navn fra seed
  const countCustomers = sql`SELECT COUNT(*) AS count FROM friday_ai.customers WHERE email ILIKE ${like} OR name ILIKE 'Alpha Seed' OR name ILIKE 'Beta Seed'`;
  const delCustomers = sql`DELETE FROM friday_ai.customers WHERE email ILIKE ${like} OR name ILIKE 'Alpha Seed' OR name ILIKE 'Beta Seed' RETURNING id`;
  if (dryRun) await execCount(countCustomers, "customers");
  else await execDelete(delCustomers, "customers");

  console.log("[crm-cleanup] Done", dryRun ? "(dry-run)" : "");
}

main().catch(err => {
  console.error("[crm-cleanup] Error:", err);
  process.exit(1);
});
