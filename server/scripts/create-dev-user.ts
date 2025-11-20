import "dotenv/config";
import { eq } from "drizzle-orm";

import { users } from "../../drizzle/schema";
import * as db from "../db";

async function main() {
  console.log("Creating dev user...");
  const email = "dev@friday.ai";
  const password = "password"; // Not actually stored, just needs to be passed to login in dev mode
  const openId = `email:${email}`;

  const database = await db.getDb();
  if (!database) {
    console.error("Database not connected");
    process.exit(1);
  }

  const existing = await database.select().from(users).where(eq(users.email, email));
  
  if (existing && existing.length > 0) {
    console.log("Dev user already exists:", existing[0]);
    return;
  }

  await db.upsertUser({
    openId: openId,
    name: "Dev User",
    email: email,
    loginMethod: "email",
    role: "admin",
    lastSignedIn: new Date().toISOString(),
  });

  console.log("Dev user created:");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main().catch(console.error).finally(() => process.exit(0));




