// Force TLS to accept self-signed chain in Supabase and load env from .env.prod
process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";
process.env.DOTENV_CONFIG_PATH = process.env.DOTENV_CONFIG_PATH || ".env.prod";
import "dotenv/config";

import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { nanoid } from "nanoid";

import { ENV } from "../_core/env";
import * as db from "../db";
import type { TrpcContext } from "../_core/context";
import { eq } from "drizzle-orm";
import {
  leads,
  customerProfiles,
  customerProperties,
} from "../../drizzle/schema";
import { router } from "../_core/trpc";
import { crmCustomerRouter } from "../routers/crm-customer-router";
import { crmLeadRouter } from "../routers/crm-lead-router";
import { crmBookingRouter } from "../routers/crm-booking-router";

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

describe("CRM smoke tests", () => {
  const testRouter = router({
    crm: router({
      customer: crmCustomerRouter,
      lead: crmLeadRouter,
      booking: crmBookingRouter,
    }),
  });
  let caller: ReturnType<typeof testRouter.createCaller>;
  let userId: number;
  let leadId: number;
  let customerProfileId: number;
  let bookingId: number;
  let leadIdNoEmail: number;
  let otherUserId: number;
  let otherUserLeadId: number;
  let propertyId: number;
  let otherProfileId: number;
  let secondCustomerProfileId: number;
  let mismatchPropertyId: number;
  const createdLeadIds: number[] = [];

  beforeAll(async () => {
    // Basic env checks
    expect(ENV.databaseUrl).toBeTruthy();
    expect(ENV.ownerOpenId).toBeTruthy();

    const dbConn = await db.getDb();
    if (!dbConn) throw new Error("Database not available (check DATABASE_URL)");

    // Ensure owner user exists
    await db.upsertUser({
      openId: ENV.ownerOpenId,
      name: "Owner",
      loginMethod: "dev",
      lastSignedIn: new Date().toISOString(),
    });
    const user = await db.getUserByOpenId(ENV.ownerOpenId);
    if (!user) throw new Error("Failed to create/find owner user");
    userId = user.id;

    // Prepare TRPC caller with authenticated context
    const ctx: TrpcContext = {
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user,
    };
    caller = testRouter.createCaller(ctx);

    // Create a unique lead for testing
    const unique = nanoid(8).toLowerCase();
    const testEmail = `crm.smoke.${unique}@example.com`;
    const createdLead = await db.createLead({
      userId,
      source: "crm_smoke_test",
      name: `Smoke Test Lead ${unique}`,
      email: testEmail,
      status: "new",
      score: 0,
      notes: "Created by CRM smoke tests",
      company: null,
      phone: null,
      metadata: null,
    } as any);
    leadId = (createdLead as any).id;
    expect(leadId).toBeGreaterThan(0);

    // Create a lead without email for negative test
    const createdNoEmail = await db.createLead({
      userId,
      source: "crm_smoke_test",
      name: `Smoke Test Lead NoEmail ${unique}`,
      email: null,
      status: "new",
      score: 0,
      notes: "Created by CRM smoke tests (no email)",
      company: null,
      phone: null,
      metadata: null,
    } as any);
    leadIdNoEmail = (createdNoEmail as any).id;
    expect(leadIdNoEmail).toBeGreaterThan(0);

    // Create another non-admin user
    const otherOpenId = `crm-smoke-${unique}-user`;
    await db.upsertUser({
      openId: otherOpenId,
      name: "Other User",
      loginMethod: "dev",
      lastSignedIn: new Date().toISOString(),
    });
    const otherUser = await db.getUserByOpenId(otherOpenId);
    if (!otherUser) throw new Error("Failed to create/find other user");
    otherUserId = otherUser.id;

    // Create a lead for the other user
    const otherLead = await db.createLead({
      userId: otherUserId,
      source: "crm_smoke_test",
      name: `Other User Lead ${unique}`,
      email: `crm.other.${unique}@example.com`,
      status: "new",
      score: 0,
      notes: "Created by CRM smoke tests (other user)",
      company: null,
      phone: null,
      metadata: null,
    } as any);
    otherUserLeadId = (otherLead as any).id;
    expect(otherUserLeadId).toBeGreaterThan(0);
  });

  it("lists leads for the authenticated user", async () => {
    const rows = await caller.crm.lead.listLeads({ limit: 10, offset: 0 });
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some(l => l.id === leadId)).toBe(true);
  });

  it("converts lead to customer profile and lists profiles", async () => {
    const convert = await caller.crm.lead.convertLeadToCustomer({ id: leadId });
    expect(convert.success).toBe(true);
    expect(convert.customerProfileId).toBeGreaterThan(0);
    customerProfileId = convert.customerProfileId;

    // Verify profile appears in list
    const profiles = await caller.crm.customer.listProfiles({
      limit: 10,
      offset: 0,
    });
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.some(p => p.id === customerProfileId)).toBe(true);
  });

  it("CRUD af customer property med ejerskabscheck", async () => {
    // Opret property
    const createdProp = await caller.crm.customer.createProperty({
      customerProfileId,
      address: "Testvej 1",
    });
    propertyId = createdProp.id;
    expect(propertyId).toBeGreaterThan(0);

    // List properties
    const props1 = await caller.crm.customer.listProperties({
      customerProfileId,
    });
    expect(Array.isArray(props1)).toBe(true);
    expect(props1.some(p => p.id === propertyId)).toBe(true);

    // Update property
    const updatedProp = await caller.crm.customer.updateProperty({
      id: propertyId,
      address: "Testvej 2",
      isPrimary: true,
    });
    expect(updatedProp.address).toBe("Testvej 2");
    expect(updatedProp.isPrimary).toBe(true);

    // Delete property
    const delProp = await caller.crm.customer.deleteProperty({
      id: propertyId,
    });
    expect(delProp.success).toBe(true);

    // Ensure deleted
    const props2 = await caller.crm.customer.listProperties({
      customerProfileId,
    });
    expect(props2.some(p => p.id === propertyId)).toBe(false);
  });

  it("profiles søgning og pagination på eget datasæt", async () => {
    // Opret to leads med samme søgetoken og konverter til profiler
    const token = `crm-smoke-${nanoid(6)}`;
    const leadA = await db.createLead({
      userId,
      source: "crm_smoke_test",
      name: `Search Alpha ${token}`,
      email: `alpha.${token}@example.com`,
      phone: `+45${Math.floor(Math.random() * 90000000) + 10000000}`,
      company: `AlphaCo ${token} AAA ${nanoid(8)}`,
      status: "new",
      score: 0,
      notes: "Search profile A",
      metadata: null,
    } as any);
    const leadB = await db.createLead({
      userId,
      source: "crm_smoke_test",
      name: `Search Beta ${token}`,
      email: `beta.${token}@example.com`,
      phone: `+46${Math.floor(Math.random() * 90000000) + 10000000}`,
      company: `BetaCorp ${token} BBB ${nanoid(8)}`,
      status: "new",
      score: 0,
      notes: "Search profile B",
      metadata: null,
    } as any);

    const convA = await caller.crm.lead.convertLeadToCustomer({
      id: (leadA as any).id,
    });
    const convB = await caller.crm.lead.convertLeadToCustomer({
      id: (leadB as any).id,
    });
    const ids = [convA.customerProfileId, convB.customerProfileId].sort();

    // Søgning: skal kun returnere vores to profiler
    const list = await caller.crm.customer.listProfiles({
      search: token,
      limit: 10,
      offset: 0,
    });
    const listIds = list.map(p => p.id).filter(id => ids.includes(id));
    expect(listIds.length).toBe(2);

    // Pagination: samme søgning med limit 1, offset 0/1 skal give to forskellige elementer
    const page1 = await caller.crm.customer.listProfiles({
      search: token,
      limit: 1,
      offset: 0,
    });
    const page2 = await caller.crm.customer.listProfiles({
      search: token,
      limit: 1,
      offset: 1,
    });
    expect(page1.length).toBe(1);
    expect(page2.length).toBe(1);
    expect(page1[0].id).not.toBe(page2[0].id);

    // Case-insensitive søgning: brug upper-case token
    const upper = token.toUpperCase();
    const listUpper = await caller.crm.customer.listProfiles({
      search: upper,
      limit: 10,
      offset: 0,
    });
    const upperIds = listUpper.map(p => p.id).filter(id => ids.includes(id));
    expect(upperIds.length).toBe(2);

    // Out-of-range pagination: offset større end antal resultater giver tomt
    const outRange = await caller.crm.customer.listProfiles({
      search: token,
      limit: 1,
      offset: 10,
    });
    expect(outRange.length).toBe(0);

    // Gem en af profilerne til efterfølgende mismatch-test
    secondCustomerProfileId = convB.customerProfileId;
  });

  it("leads status-filter og pagination", async () => {
    const token = `crm-smoke-${nanoid(6)}`;
    const newA = await db.createLead({
      userId,
      source: "crm_smoke_test",
      name: `New A ${token}`,
      email: `new.a.${token}@example.com`,
      phone: `+47${Math.floor(Math.random() * 90000000) + 10000000}`,
      company: `NewA LLC ${token} A ${nanoid(8)}`,
      status: "new",
      score: 1,
      notes: "Leads pagination A",
      metadata: null,
    } as any);
    const newB = await db.createLead({
      userId,
      source: "crm_smoke_test",
      name: `New B ${token}`,
      email: `new.b.${token}@example.com`,
      phone: `+48${Math.floor(Math.random() * 90000000) + 10000000}`,
      company: `NewB ApS ${token} B ${nanoid(8)}`,
      status: "new",
      score: 2,
      notes: "Leads pagination B",
      metadata: null,
    } as any);
    const contacted = await db.createLead({
      userId,
      source: "crm_smoke_test",
      name: `Contacted ${token}`,
      email: `contacted.${token}@example.com`,
      status: "contacted",
      score: 3,
      notes: "Leads pagination C",
      company: null,
      phone: null,
      metadata: null,
    } as any);
    createdLeadIds.push(
      (newA as any).id,
      (newB as any).id,
      (contacted as any).id
    );

    const listNew = await caller.crm.lead.listLeads({
      status: "new",
      limit: 50,
      offset: 0,
    });
    const tokenNew = listNew.filter(l => (l.name || "").includes(token));
    expect(tokenNew.length).toBeGreaterThanOrEqual(2);

    const page1 = await caller.crm.lead.listLeads({
      status: "new",
      limit: 1,
      offset: 0,
    });
    const page2 = await caller.crm.lead.listLeads({
      status: "new",
      limit: 1,
      offset: 1,
    });
    expect(page1.length).toBe(1);
    expect(page2.length).toBe(1);
    expect(page1[0].id).not.toBe(page2[0].id);

    const listContacted = await caller.crm.lead.listLeads({
      status: "contacted",
      limit: 10,
      offset: 0,
    });
    const tokenContacted = listContacted.filter(l =>
      (l.name || "").includes(token)
    );
    expect(tokenContacted.length).toBeGreaterThanOrEqual(1);
  });

  it("creates a booking, lists it, updates status, and deletes it", async () => {
    // Create booking (propertyId/serviceTemplateId optional)
    const start = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // +1h
    const end = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // +2h
    const created = await caller.crm.booking.createBooking({
      customerProfileId,
      title: "Smoke Test Booking",
      notes: "Created by CRM smoke tests",
      scheduledStart: start,
      scheduledEnd: end,
    });
    bookingId = created.id;
    expect(bookingId).toBeGreaterThan(0);
    expect(created.status).toBe("planned");

    // List bookings for the profile
    const listed = await caller.crm.booking.listBookings({
      customerProfileId,
      limit: 10,
      offset: 0,
    });
    expect(Array.isArray(listed)).toBe(true);
    expect(listed.some(b => b.id === bookingId)).toBe(true);

    // Update status
    const updated = await caller.crm.booking.updateBookingStatus({
      id: bookingId,
      status: "completed",
    });
    expect(updated.status).toBe("completed");

    // Delete booking
    const del = await caller.crm.booking.deleteBooking({ id: bookingId });
    expect(del.success).toBe(true);
  });

  it("blocks unauthorized access (no user in context)", async () => {
    const unauthCtx = { req: {} as any, res: {} as any } as TrpcContext; // no user
    const unauthCaller = testRouter.createCaller(unauthCtx);
    await expect(
      unauthCaller.crm.lead.listLeads({ limit: 1, offset: 0 })
    ).rejects.toThrow(/Please login/i);
    await expect(
      unauthCaller.crm.customer.listProfiles({ limit: 1, offset: 0 })
    ).rejects.toThrow(/Please login/i);
  });

  it("forbids cross-user lead status update", async () => {
    // Build caller for other user
    const otherCtx: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: { id: otherUserId, role: "user" } as any,
    };
    const otherCaller = testRouter.createCaller(otherCtx);
    // Try to modify lead owned by owner user
    await expect(
      otherCaller.crm.lead.updateLeadStatus({ id: leadId, status: "contacted" })
    ).rejects.toThrow(/Lead not accessible/i);
  });

  it("rejects invalid booking status and non-existent booking delete", async () => {
    // invalid status is caught by zod; expect a validation error thrown by tRPC
    // @ts-expect-error
    await expect(
      caller.crm.booking.updateBookingStatus({
        id: 123456789,
        status: "invalid",
      })
    ).rejects.toThrow();
    // delete non-existent booking returns success
    const res = await caller.crm.booking.deleteBooking({ id: 987654321 });
    expect(res.success).toBe(true);
  });

  it("booking create fejler når property ikke tilhører profile (samme bruger)", async () => {
    // Opret property på første profil
    const prop = await caller.crm.customer.createProperty({
      customerProfileId,
      address: "Mismatchvej 1",
    });
    mismatchPropertyId = prop.id;
    expect(mismatchPropertyId).toBeGreaterThan(0);

    // Forsøg booking på anden profil med property fra første profil
    await expect(
      caller.crm.booking.createBooking({
        customerProfileId: secondCustomerProfileId,
        propertyId: mismatchPropertyId,
        title: "Mismatch Booking",
        scheduledStart: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      })
    ).rejects.toThrow(/Property does not belong to profile/i);
  });

  it("updateProperty kaster NOT_FOUND for ikke-eksisterende id", async () => {
    await expect(
      caller.crm.customer.updateProperty({ id: 999999999, address: "Nope" })
    ).rejects.toThrow(/Property not found/i);
  });

  it("deleteProperty er idempotent ved ikke-eksisterende id", async () => {
    const res = await caller.crm.customer.deleteProperty({ id: 999999998 });
    expect((res as any).success).toBe(true);
  });

  it("forbids property create on other user's profile", async () => {
    // Konverter other user's lead til profil for at få profil-id
    const otherCtx: TrpcContext = {
      req: {} as any,
      res: {} as any,
      user: { id: otherUserId, role: "user" } as any,
    };
    const otherCaller = testRouter.createCaller(otherCtx);
    const converted = await otherCaller.crm.lead.convertLeadToCustomer({
      id: otherUserLeadId,
    });
    expect(converted.success).toBe(true);
    otherProfileId = converted.customerProfileId;

    // Forsøg at oprette property på other user's profil med owner-caller
    await expect(
      caller.crm.customer.createProperty({
        customerProfileId: otherProfileId,
        address: "Andenvej 1",
      })
    ).rejects.toThrow(/Profile not accessible/i);
  });

  it("fails to convert a lead without email", async () => {
    await expect(
      caller.crm.lead.convertLeadToCustomer({ id: leadIdNoEmail })
    ).rejects.toThrow(/Lead must have an email/i);
  });

  afterAll(async () => {
    const dbc = await db.getDb();
    if (!dbc) return;
    // Cleanup: delete created customer profile and leads
    if (customerProfileId) {
      await dbc
        .delete(customerProfiles)
        .where(eq(customerProfiles.id, customerProfileId));
    }
    if (secondCustomerProfileId) {
      await dbc
        .delete(customerProfiles)
        .where(eq(customerProfiles.id, secondCustomerProfileId));
    }
    if (leadId) {
      await dbc.delete(leads).where(eq(leads.id, leadId));
    }
    if (leadIdNoEmail) {
      await dbc.delete(leads).where(eq(leads.id, leadIdNoEmail));
    }
    if (otherUserLeadId) {
      await dbc.delete(leads).where(eq(leads.id, otherUserLeadId));
    }
    if (createdLeadIds.length) {
      for (const id of createdLeadIds) {
        await dbc.delete(leads).where(eq(leads.id, id));
      }
    }
    if (mismatchPropertyId) {
      // Delete property created for mismatch test
      await dbc
        .delete(customerProperties)
        .where(eq(customerProperties.id, mismatchPropertyId));
    }
  });
});
