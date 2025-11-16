// Force TLS to accept self-signed chain in Supabase and load env from .env.prod
process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";
process.env.DOTENV_CONFIG_PATH = process.env.DOTENV_CONFIG_PATH || ".env.prod";
import "dotenv/config";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { leads } from "../../drizzle/schema";
import type { TrpcContext } from "../_core/context";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { getUserLeads } from "../lead-db";
import { inboxRouter } from "../routers/inbox-router";

// Normalize DATABASE_URL for postgres.js and Supabase (ensure sslmode=no-verify)
function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    const sslmode = u.searchParams.get("sslmode");
    if (!sslmode || sslmode === "require") {
      u.searchParams.set("sslmode", "no-verify");
    }
    // postgres.js does not support schema param in connection string; getDb sets search_path
    if (u.searchParams.has("schema")) {
      u.searchParams.delete("schema");
    }
    return u.toString();
  } catch {
    return url; // if it's not a URL, leave as-is
  }
}

// Apply normalization before connecting
process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);

describe("Email → Lead E2E Flow", () => {
  const testRouter = router({
    inbox: inboxRouter,
  });

  let testUserId: number;
  let testUser: any;
  let createdLeadIds: number[] = [];

  beforeAll(async () => {
    // Ensure owner user exists in database
    const { ENV } = await import("../_core/env");
    const { upsertUser, getUserByOpenId } = await import("../db");

    await upsertUser({
      openId: ENV.ownerOpenId,
      name: "Test Owner",
      loginMethod: "dev",
      lastSignedIn: new Date().toISOString(),
    });

    const user = await getUserByOpenId(ENV.ownerOpenId);
    if (!user) throw new Error("Failed to create/find test user");
    testUser = user;
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup: delete test leads
    const database = await getDb();
    if (database && createdLeadIds.length > 0) {
      // Delete leads with numeric userId
      for (const leadId of createdLeadIds) {
        await database.delete(leads).where(eq(leads.id, leadId));
      }
    }
  });

  it("should create a lead from email data", async () => {
    const mockContext: TrpcContext = {
      user: testUser,
      req: {} as any,
      res: {} as any,
    };

    const caller = testRouter.createCaller(mockContext);

    // Test email data
    const testEmail = `lead-${nanoid()}@example.com`;
    const testName = "John Doe";
    const testPhone = "+4512345678";
    const testCompany = "Test Company";

    // Call createLeadFromEmail
    const result = await caller.inbox.email.createLeadFromEmail({
      email: testEmail,
      name: testName,
      phone: testPhone,
      company: testCompany,
      source: "email",
    });

    // Assert lead was created
    expect(result).toBeDefined();
    expect(result.lead).toBeDefined();
    expect(result.created).toBe(true);
    expect(result.lead.email).toBe(testEmail);
    expect(result.lead.name).toBe(testName);
    expect(result.lead.phone).toBe(testPhone);
    expect(result.lead.company).toBe(testCompany);
    expect(result.lead.source).toBe("email");
    expect(result.lead.status).toBe("new");

    // Track created lead for cleanup
    createdLeadIds.push(result.lead.id);

    // Verify lead exists in database
    const dbLeads = await getUserLeads(testUserId);
    const createdLead = dbLeads.find(l => l.id === result.lead.id);
    expect(createdLead).toBeDefined();
    expect(createdLead?.email).toBe(testEmail);
  });

  it("should deduplicate leads when same email is used twice", async () => {
    const mockContext: TrpcContext = {
      user: testUser,
      req: {} as any,
      res: {} as any,
    };

    const caller = testRouter.createCaller(mockContext);

    // Use same email for deduplication test
    const testEmail = `dedupe-${nanoid()}@example.com`;
    const testName = "Jane Smith";

    // First call - should create lead
    const firstResult = await caller.inbox.email.createLeadFromEmail({
      email: testEmail,
      name: testName,
      source: "email",
    });

    expect(firstResult.created).toBe(true);
    expect(firstResult.lead.email).toBe(testEmail);
    createdLeadIds.push(firstResult.lead.id);

    // Second call - should return existing lead (deduplication)
    const secondResult = await caller.inbox.email.createLeadFromEmail({
      email: testEmail,
      name: "Different Name", // Different name but same email
      source: "email",
    });

    expect(secondResult.created).toBe(false);
    expect(secondResult.lead.id).toBe(firstResult.lead.id);
    expect(secondResult.lead.email).toBe(testEmail);
    // Original name should be preserved
    expect(secondResult.lead.name).toBe(testName);

    // Verify only one lead exists for this email
    const dbLeads = await getUserLeads(testUserId);
    const leadsWithEmail = dbLeads.filter(
      l => l.email?.toLowerCase() === testEmail.toLowerCase()
    );
    expect(leadsWithEmail.length).toBe(1);
  });

  it("should extract name from email when name not provided", async () => {
    const mockContext: TrpcContext = {
      user: testUser,
      req: {} as any,
      res: {} as any,
    };

    const caller = testRouter.createCaller(mockContext);

    // Email without name
    const testEmail = `john.doe-smith@example.com`;

    const result = await caller.inbox.email.createLeadFromEmail({
      email: testEmail,
      source: "email",
    });

    expect(result.created).toBe(true);
    expect(result.lead.email).toBe(testEmail);
    // Name should be extracted from email: "John Doe Smith"
    expect(result.lead.name).toBe("John Doe Smith");

    createdLeadIds.push(result.lead.id);
  });

  it("should create customer profile when lead is created from email", async () => {
    const mockContext: TrpcContext = {
      user: testUser,
      req: {} as any,
      res: {} as any,
    };

    const caller = testRouter.createCaller(mockContext);

    const testEmail = `customer-${nanoid()}@example.com`;
    const testName = "Alice Johnson";
    const testPhone = "+4598765432";

    const result = await caller.inbox.email.createLeadFromEmail({
      email: testEmail,
      name: testName,
      phone: testPhone,
      source: "email",
    });

    expect(result.created).toBe(true);
    createdLeadIds.push(result.lead.id);

    // Verify customer profile was created
    const database = await getDb();
    if (!database) throw new Error("Database not available");

    const { customerProfiles } = await import("../../drizzle/schema");
    const profiles = await database
      .select()
      .from(customerProfiles)
      .where(eq(customerProfiles.email, testEmail));

    expect(profiles.length).toBeGreaterThan(0);
    const profile = profiles[0];
    expect(profile.email).toBe(testEmail);
    expect(profile.name).toBe(testName);
    expect(profile.phone).toBe(testPhone);
    expect(profile.leadId).toBe(result.lead.id);
  });
});
