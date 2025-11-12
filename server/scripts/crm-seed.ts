import "dotenv/config";
import { nanoid } from "nanoid";
import { router } from "../_core/trpc";
import { crmCustomerRouter } from "../routers/crm-customer-router";
import { crmLeadRouter } from "../routers/crm-lead-router";
import { crmBookingRouter } from "../routers/crm-booking-router";
import * as db from "../db";
import { ENV } from "../_core/env";
import { leads } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Normalize DATABASE_URL for local dev/staging if needed
const normalizeDatabaseUrl = () => {
  const url = process.env.DATABASE_URL ?? "";
  if (url.includes("@localhost:")) {
    process.env.DATABASE_URL = url.replace("@localhost:", "@127.0.0.1:");
  }
};

const log = (...args: unknown[]) => console.log("[crm-seed]", ...args);

async function main() {
  normalizeDatabaseUrl();
  const dbConn = await db.getDb();

  // Seed marker to make data easy to find and clean up
  // Use a highly unique token to avoid ChromaDB duplicate-detection collisions across runs
  const seedToken = `crm-seed-${new Date().toISOString()}-${nanoid(6)}`;

  // Optional cleanup mode: remove previous seed entities
  const cleanup = process.argv.includes("--cleanup");
  if (cleanup) {
    log("Cleanup mode enabled — deleting previous seed leads");
    const previous = await dbConn
      .delete(leads)
      .where(eq(leads.source, seedToken))
      .returning();
    log(`Deleted ${previous.length} prior seed leads`);
  }

  // Construct a minimal tRPC app router to reuse existing business logic
  const appRouter = router({
    crm: router({
      customer: crmCustomerRouter,
      lead: crmLeadRouter,
      booking: crmBookingRouter,
    }),
  });

  // Resolve a user to act as owner for seeded data
  const ownerOpenId = ENV.ownerOpenId;
  if (!ownerOpenId) {
    throw new Error("ENV.ownerOpenId is required to seed CRM data");
  }

  // Minimal auth context with the owner user
  // Ensure owner user exists and fetch numeric ID
  await db.upsertUser({
    openId: ownerOpenId,
    name: ENV.ownerName ?? "CRM Seed Owner",
    loginMethod: "dev",
    lastSignedIn: new Date().toISOString(),
  });
  const user = await db.getUserByOpenId(ownerOpenId);
  if (!user) throw new Error("Failed to create/find owner user");

  const ctx = {
    req: {} as any,
    res: { cookie: () => {}, clearCookie: () => {} } as any,
    user,
  };

  const caller = appRouter.createCaller(ctx);

  // Create deterministic test leads via DB helpers
  log("Creating leads");
  const uniquePhoneA = `45${Date.now().toString().slice(-8)}`;
  const uniquePhoneB = `46${(Date.now() + 12345).toString().slice(-8)}`;

  const leadAlpha = await db.createLead({
    userId: user.id,
    source: seedToken,
    name: "Alpha Seed",
    email: `alpha+${seedToken}@example.com`,
    status: "new",
    score: 0,
    notes: "Created by CRM seed script",
    company: `SeedCo-A-${seedToken}`,
    phone: uniquePhoneA,
    metadata: null,
  } as any);
  const leadBeta = await db.createLead({
    userId: user.id,
    source: seedToken,
    name: "Beta Seed",
    email: `beta+${seedToken}@example.com`,
    status: "contacted",
    score: 0,
    notes: "Created by CRM seed script",
    company: `SeedCo-B-${seedToken}`,
    phone: uniquePhoneB,
    metadata: null,
  } as any);

  // Convert leads to customer profiles via router logic
  log("Converting leads to customer profiles");
  const alphaProfileConv = await caller.crm.lead.convertLeadToCustomer({
    id: (leadAlpha as any).id,
  });
  const betaProfileConv = await caller.crm.lead.convertLeadToCustomer({
    id: (leadBeta as any).id,
  });
  const alphaProfileId =
    (alphaProfileConv as any).customerProfileId ??
    (alphaProfileConv as any).id ??
    (alphaProfileConv as any);
  const betaProfileId =
    (betaProfileConv as any).customerProfileId ??
    (betaProfileConv as any).id ??
    (betaProfileConv as any);

  // Create properties for each profile
  log("Creating properties");
  const alphaProperty = await caller.crm.customer.createProperty({
    customerProfileId: alphaProfileId,
    address: `Seed St 1, ${seedToken}`,
    city: "Seedville",
    notes: "Alpha property from seed script",
  });
  const betaProperty = await caller.crm.customer.createProperty({
    customerProfileId: betaProfileId,
    address: `Seed St 2, ${seedToken}`,
    city: "Seedville",
    notes: "Beta property from seed script",
  });

  // Create a booking for alpha
  log("Creating booking for alpha");
  const now = Date.now();
  const booking = await caller.crm.booking.createBooking({
    customerProfileId: alphaProfileId,
    propertyId: alphaProperty.id,
    scheduledStart: new Date(now + 24 * 60 * 60 * 1000).toISOString(),
    scheduledEnd: new Date(now + 25 * 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    reference: `SEED-${nanoid(6)}`,
    notes: `Seed booking ${seedToken}`,
  });

  // Summary
  log("Seed completed:");
  console.table([
    { type: "lead", id: leadAlpha.id, email: leadAlpha.email },
    { type: "lead", id: leadBeta.id, email: leadBeta.email },
    { type: "profile", id: alphaProfileId },
    { type: "profile", id: betaProfileId },
    { type: "property", id: alphaProperty.id, address: alphaProperty.address },
    { type: "property", id: betaProperty.id, address: betaProperty.address },
    { type: "booking", id: booking.id, reference: booking.reference },
  ]);
}

main().catch(err => {
  console.error("[crm-seed] Error:", err);
  process.exit(1);
});
