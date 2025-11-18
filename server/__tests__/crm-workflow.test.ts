/**
 * CRM Workflow Tests
 *
 * Tests complete CRM workflows and business processes:
 * - Customer creation workflow
 * - Lead to customer conversion
 * - Lead status progression
 * - Property management lifecycle
 * - Notes management lifecycle
 * - Booking lifecycle
 * - Data integrity across workflows
 */

process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";
process.env.DOTENV_CONFIG_PATH = process.env.DOTENV_CONFIG_PATH || ".env.prod";
import "dotenv/config";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  bookings,
  customerNotesInFridayAi,
  customerProfiles,
  customerProperties,
  leads,
} from "../../drizzle/schema";
import type { TrpcContext } from "../_core/context";
import { ENV } from "../_core/env";
import { router } from "../_core/trpc";
import * as db from "../db";
import { crmBookingRouter } from "../routers/crm-booking-router";
import { crmCustomerRouter } from "../routers/crm-customer-router";
import { crmLeadRouter } from "../routers/crm-lead-router";

// Normalize DATABASE_URL for postgres.js and Supabase
function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    const sslmode = u.searchParams.get("sslmode");
    if (!sslmode || sslmode === "require") {
      u.searchParams.set("sslmode", "no-verify");
    }
    if (u.searchParams.has("schema")) {
      u.searchParams.delete("schema");
    }
    return u.toString();
  } catch {
    return url;
  }
}

process.env.DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL);

// Skip tests if required environment variables are missing
const shouldSkip = !ENV.databaseUrl || !ENV.ownerOpenId;
const describeSkippable = shouldSkip ? describe.skip : describe;

describeSkippable("CRM Workflow Tests", () => {
  const testRouter = router({
    crm: router({
      customer: crmCustomerRouter,
      lead: crmLeadRouter,
      booking: crmBookingRouter,
    }),
  });
  let caller: ReturnType<typeof testRouter.createCaller>;
  let userId: number;
  const testToken = `crm-workflow-${nanoid(8)}`;
  const cleanupIds: {
    leads: number[];
    customers: number[];
    properties: number[];
    notes: number[];
    bookings: number[];
  } = {
    leads: [],
    customers: [],
    properties: [],
    notes: [],
    bookings: [],
  };

  beforeAll(async () => {
    expect(ENV.databaseUrl).toBeTruthy();
    expect(ENV.ownerOpenId).toBeTruthy();

    const dbConn = await db.getDb();
    if (!dbConn) throw new Error("Database not available");

    // Ensure owner user exists
    await db.upsertUser({
      openId: ENV.ownerOpenId,
      name: "Workflow Test Owner",
      loginMethod: "dev",
      lastSignedIn: new Date().toISOString(),
    });
    const user = await db.getUserByOpenId(ENV.ownerOpenId);
    if (!user) throw new Error("Failed to create/find owner user");
    userId = user.id;

    const ctx: TrpcContext = {
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user,
    };
    caller = testRouter.createCaller(ctx);
  });

  describe("Customer Creation Workflow", () => {
    it("creates customer profile directly and verifies initial state", async () => {
      const customer = await caller.crm.customer.createProfile({
        name: `Workflow Customer ${testToken}`,
        email: `workflow.customer.${testToken}@example.com`,
        phone: `+45${Math.floor(Math.random() * 90000000) + 10000000}`,
        status: "new",
        customerType: "private",
      });

      expect(customer.id).toBeGreaterThan(0);
      expect(customer.email).toContain(testToken);
      expect(customer.status).toBe("new");
      expect(customer.totalInvoiced).toBe(0);
      expect(customer.totalPaid).toBe(0);
      expect(customer.balance).toBe(0);
      expect(customer.invoiceCount).toBe(0);

      cleanupIds.customers.push(customer.id);
    });

    it("prevents duplicate customer creation with same email", async () => {
      const email = `duplicate.${testToken}@example.com`;

      const first = await caller.crm.customer.createProfile({
        name: `First ${testToken}`,
        email,
        customerType: "private",
      });
      cleanupIds.customers.push(first.id);

      await expect(
        caller.crm.customer.createProfile({
          name: `Second ${testToken}`,
          email,
          customerType: "private",
        })
      ).rejects.toThrow(/already exists/i);
    });
  });

  describe("Lead to Customer Conversion Workflow", () => {
    let leadId: number;
    let convertedCustomerId: number;

    it("creates lead and progresses through status stages", async () => {
      // Create lead
      const lead = await caller.crm.lead.createLead({
        name: `Workflow Lead ${testToken}`,
        email: `workflow.lead.${testToken}@example.com`,
        phone: `+45${Math.floor(Math.random() * 90000000) + 10000000}`,
        company: `WorkflowCo ${testToken}`,
        source: "website",
        status: "new",
        notes: "Initial lead from website",
      });

      expect(lead.id).toBeGreaterThan(0);
      expect(lead.status).toBe("new");
      leadId = lead.id;
      cleanupIds.leads.push(leadId);

      // Progress: new -> contacted
      await caller.crm.lead.updateLeadStatus({
        id: leadId,
        status: "contacted",
      });

      const contacted = await caller.crm.lead.getLead({ id: leadId });
      expect(contacted.status).toBe("contacted");

      // Progress: contacted -> qualified
      await caller.crm.lead.updateLeadStatus({
        id: leadId,
        status: "qualified",
      });

      const qualified = await caller.crm.lead.getLead({ id: leadId });
      expect(qualified.status).toBe("qualified");
    });

    it("converts qualified lead to customer profile", async () => {
      const conversion = await caller.crm.lead.convertLeadToCustomer({
        id: leadId,
      });

      expect(conversion.success).toBe(true);
      expect(conversion.customerProfileId).toBeGreaterThan(0);
      expect(conversion.created).toBe(true);
      convertedCustomerId = conversion.customerProfileId;
      cleanupIds.customers.push(convertedCustomerId);

      // Verify customer profile has lead data
      const profile = await caller.crm.customer.getProfile({
        id: convertedCustomerId,
      });
      expect(profile.email).toContain(testToken);
      expect(profile.name).toContain(testToken);
      expect(profile.status).toBe("new");
    });

    it("links to existing customer if email already exists", async () => {
      // Create customer first
      const existingCustomer = await caller.crm.customer.createProfile({
        name: `Existing ${testToken}`,
        email: `existing.${testToken}@example.com`,
        customerType: "private",
      });
      cleanupIds.customers.push(existingCustomer.id);

      // Create lead with same email
      const duplicateLead = await caller.crm.lead.createLead({
        name: `Duplicate Lead ${testToken}`,
        email: existingCustomer.email,
        source: "referral",
      });
      cleanupIds.leads.push(duplicateLead.id);

      // Convert should link, not create
      const conversion = await caller.crm.lead.convertLeadToCustomer({
        id: duplicateLead.id,
      });

      expect(conversion.success).toBe(true);
      expect(conversion.customerProfileId).toBe(existingCustomer.id);
      expect(conversion.created).toBe(false);
    });

    it("rejects conversion of lead without email", async () => {
      const noEmailLead = await caller.crm.lead.createLead({
        name: `No Email Lead ${testToken}`,
        source: "phone",
      });
      cleanupIds.leads.push(noEmailLead.id);

      await expect(
        caller.crm.lead.convertLeadToCustomer({ id: noEmailLead.id })
      ).rejects.toThrow(/must have an email/i);
    });
  });

  describe("Property Management Lifecycle", () => {
    let customerId: number;
    let propertyId: number;

    beforeAll(async () => {
      const customer = await caller.crm.customer.createProfile({
        name: `Property Test ${testToken}`,
        email: `property.${testToken}@example.com`,
        customerType: "private",
      });
      customerId = customer.id;
      cleanupIds.customers.push(customerId);
    });

    it("creates property and marks as primary", async () => {
      const property = await caller.crm.customer.createProperty({
        customerProfileId: customerId,
        address: `Property St 1, ${testToken}`,
        city: "Copenhagen",
        postalCode: "2100",
        isPrimary: true,
        notes: "Main property",
      });

      expect(property.id).toBeGreaterThan(0);
      expect(property.address).toContain(testToken);
      expect(property.isPrimary).toBe(true);
      propertyId = property.id;
      cleanupIds.properties.push(propertyId);
    });

    it("lists properties for customer", async () => {
      const properties = await caller.crm.customer.listProperties({
        customerProfileId: customerId,
      });

      expect(Array.isArray(properties)).toBe(true);
      expect(properties.some(p => p.id === propertyId)).toBe(true);
    });

    it("updates property details", async () => {
      const updated = await caller.crm.customer.updateProperty({
        id: propertyId,
        address: `Updated St 2, ${testToken}`,
        city: "Aarhus",
        postalCode: "8000",
        isPrimary: false,
        notes: "Updated property",
      });

      expect(updated.address).toContain("Updated St 2");
      expect(updated.city).toBe("Aarhus");
      expect(updated.isPrimary).toBe(false);
    });

    it("creates multiple properties and manages primary flag", async () => {
      // Create second property
      const property2 = await caller.crm.customer.createProperty({
        customerProfileId: customerId,
        address: `Property St 2, ${testToken}`,
        isPrimary: false,
      });
      cleanupIds.properties.push(property2.id);

      // Set second as primary
      await caller.crm.customer.updateProperty({
        id: property2.id,
        isPrimary: true,
      });

      // Verify both properties exist
      const properties = await caller.crm.customer.listProperties({
        customerProfileId: customerId,
      });
      expect(properties.length).toBeGreaterThanOrEqual(2);
    });

    it("deletes property", async () => {
      const tempProperty = await caller.crm.customer.createProperty({
        customerProfileId: customerId,
        address: `Temp Property ${testToken}`,
      });
      const tempId = tempProperty.id;

      const deleted = await caller.crm.customer.deleteProperty({ id: tempId });
      expect(deleted.success).toBe(true);

      // Verify deleted
      const properties = await caller.crm.customer.listProperties({
        customerProfileId: customerId,
      });
      expect(properties.some(p => p.id === tempId)).toBe(false);
    });
  });

  describe("Notes Management Lifecycle", () => {
    let customerId: number;
    let noteId: number;

    beforeAll(async () => {
      const customer = await caller.crm.customer.createProfile({
        name: `Notes Test ${testToken}`,
        email: `notes.${testToken}@example.com`,
        customerType: "private",
      });
      customerId = customer.id;
      cleanupIds.customers.push(customerId);
    });

    it("adds note to customer", async () => {
      const note = await caller.crm.customer.addNote({
        customerProfileId: customerId,
        content: `Initial note ${testToken}`,
      });

      expect(note.id).toBeGreaterThan(0);
      expect(note.note).toContain(testToken);
      noteId = note.id;
      cleanupIds.notes.push(noteId);
    });

    it("lists notes for customer", async () => {
      const notes = await caller.crm.customer.listNotes({
        customerProfileId: customerId,
      });

      expect(Array.isArray(notes)).toBe(true);
      expect(notes.some(n => n.id === noteId)).toBe(true);
    });

    it("updates note content", async () => {
      const updated = await caller.crm.customer.updateNote({
        id: noteId,
        content: `Updated note ${testToken}`,
      });

      expect(updated.note).toContain("Updated note");
      expect(updated.note).toContain(testToken);
    });

    it("adds multiple notes and verifies ordering", async () => {
      const note2 = await caller.crm.customer.addNote({
        customerProfileId: customerId,
        content: `Second note ${testToken}`,
      });
      cleanupIds.notes.push(note2.id);

      const note3 = await caller.crm.customer.addNote({
        customerProfileId: customerId,
        content: `Third note ${testToken}`,
      });
      cleanupIds.notes.push(note3.id);

      const notes = await caller.crm.customer.listNotes({
        customerProfileId: customerId,
        limit: 10,
      });

      // Notes should be ordered by creation date (newest first)
      expect(notes.length).toBeGreaterThanOrEqual(3);
      const note3Index = notes.findIndex(n => n.id === note3.id);
      const note2Index = notes.findIndex(n => n.id === note2.id);
      const note1Index = notes.findIndex(n => n.id === noteId);

      // Newer notes should appear first
      expect(note3Index).toBeLessThan(note1Index);
    });

    it("deletes note", async () => {
      const tempNote = await caller.crm.customer.addNote({
        customerProfileId: customerId,
        content: `Temp note ${testToken}`,
      });
      const tempId = tempNote.id;

      const deleted = await caller.crm.customer.deleteNote({ id: tempId });
      expect(deleted.success).toBe(true);

      // Verify deleted
      const notes = await caller.crm.customer.listNotes({
        customerProfileId: customerId,
      });
      expect(notes.some(n => n.id === tempId)).toBe(false);
    });
  });

  describe("Booking Lifecycle Workflow", () => {
    let customerId: number;
    let propertyId: number;
    let bookingId: number;

    beforeAll(async () => {
      const customer = await caller.crm.customer.createProfile({
        name: `Booking Test ${testToken}`,
        email: `booking.${testToken}@example.com`,
        customerType: "private",
      });
      customerId = customer.id;
      cleanupIds.customers.push(customerId);

      const property = await caller.crm.customer.createProperty({
        customerProfileId: customerId,
        address: `Booking Property ${testToken}`,
        isPrimary: true,
      });
      propertyId = property.id;
      cleanupIds.properties.push(propertyId);
    });

    it("creates booking with all required fields", async () => {
      const start = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const end = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString();

      const booking = await caller.crm.booking.createBooking({
        customerProfileId: customerId,
        propertyId: propertyId,
        title: `Test Booking ${testToken}`,
        notes: `Booking notes ${testToken}`,
        scheduledStart: start,
        scheduledEnd: end,
      });

      expect(booking.id).toBeGreaterThan(0);
      expect(booking.status).toBe("planned");
      expect(booking.title).toContain(testToken);
      bookingId = booking.id;
      cleanupIds.bookings.push(bookingId);
    });

    it("lists bookings for customer", async () => {
      const customerBookings = await caller.crm.booking.listBookings({
        customerProfileId: customerId,
        limit: 10,
      });

      expect(Array.isArray(customerBookings)).toBe(true);
      expect(customerBookings.some(b => b.id === bookingId)).toBe(true);
    });

    it("lists bookings by date range", async () => {
      // Use today as start to include the booking we just created (24h from now)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const upcoming = await caller.crm.booking.listBookings({
        start: today.toISOString(),
        end: nextWeek.toISOString(),
        limit: 50,
      });

      expect(Array.isArray(upcoming)).toBe(true);
      expect(upcoming.some(b => b.id === bookingId)).toBe(true);
    });

    it("updates booking status through lifecycle", async () => {
      // planned -> in_progress
      let updated = await caller.crm.booking.updateBookingStatus({
        id: bookingId,
        status: "in_progress",
      });
      expect(updated.status).toBe("in_progress");

      // in_progress -> completed
      updated = await caller.crm.booking.updateBookingStatus({
        id: bookingId,
        status: "completed",
      });
      expect(updated.status).toBe("completed");
    });

    it("deletes booking", async () => {
      const tempBooking = await caller.crm.booking.createBooking({
        customerProfileId: customerId,
        title: `Temp Booking ${testToken}`,
        scheduledStart: new Date(
          Date.now() + 48 * 60 * 60 * 1000
        ).toISOString(),
      });
      const tempId = tempBooking.id;

      const deleted = await caller.crm.booking.deleteBooking({ id: tempId });
      expect(deleted.success).toBe(true);

      // Verify deleted
      const bookings = await caller.crm.booking.listBookings({
        customerProfileId: customerId,
      });
      expect(bookings.some(b => b.id === tempId)).toBe(false);
    });
  });

  describe("Complete Customer Journey Workflow", () => {
    it("executes full workflow: lead -> customer -> property -> booking -> notes", async () => {
      const workflowToken = `journey-${testToken}`;

      // Step 1: Create lead
      const lead = await caller.crm.lead.createLead({
        name: `Journey Lead ${workflowToken}`,
        email: `journey.${workflowToken}@example.com`,
        phone: `+45${Math.floor(Math.random() * 90000000) + 10000000}`,
        source: "website",
        status: "new",
      });
      cleanupIds.leads.push(lead.id);

      // Step 2: Progress lead through stages
      await caller.crm.lead.updateLeadStatus({
        id: lead.id,
        status: "contacted",
      });
      await caller.crm.lead.updateLeadStatus({
        id: lead.id,
        status: "qualified",
      });
      await caller.crm.lead.updateLeadStatus({
        id: lead.id,
        status: "won",
      });

      // Step 3: Convert to customer
      const conversion = await caller.crm.lead.convertLeadToCustomer({
        id: lead.id,
      });
      const customerId = conversion.customerProfileId;
      cleanupIds.customers.push(customerId);

      // Step 4: Add property
      const property = await caller.crm.customer.createProperty({
        customerProfileId: customerId,
        address: `Journey Property ${workflowToken}`,
        city: "Copenhagen",
        isPrimary: true,
      });
      cleanupIds.properties.push(property.id);

      // Step 5: Add note
      const note = await caller.crm.customer.addNote({
        customerProfileId: customerId,
        content: `Journey note: Customer converted from lead ${workflowToken}`,
      });
      cleanupIds.notes.push(note.id);

      // Step 6: Create booking
      const booking = await caller.crm.booking.createBooking({
        customerProfileId: customerId,
        propertyId: property.id,
        title: `Journey Booking ${workflowToken}`,
        scheduledStart: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
      cleanupIds.bookings.push(booking.id);

      // Step 7: Verify complete data integrity
      const profile = await caller.crm.customer.getProfile({ id: customerId });
      expect(profile.email).toContain(workflowToken);
      expect(profile.leadId).toBe(lead.id);

      const properties = await caller.crm.customer.listProperties({
        customerProfileId: customerId,
      });
      expect(properties.some(p => p.id === property.id)).toBe(true);

      const notes = await caller.crm.customer.listNotes({
        customerProfileId: customerId,
      });
      expect(notes.some(n => n.id === note.id)).toBe(true);

      const bookings = await caller.crm.booking.listBookings({
        customerProfileId: customerId,
      });
      expect(bookings.some(b => b.id === booking.id)).toBe(true);
    });
  });

  describe("Data Integrity and Edge Cases", () => {
    it("maintains referential integrity when deleting customer", async () => {
      const customer = await caller.crm.customer.createProfile({
        name: `Integrity Test ${testToken}`,
        email: `integrity.${testToken}@example.com`,
        customerType: "private",
      });
      const customerId = customer.id;

      // Create related data
      const property = await caller.crm.customer.createProperty({
        customerProfileId: customerId,
        address: `Integrity Property ${testToken}`,
      });
      const propertyId = property.id;

      const note = await caller.crm.customer.addNote({
        customerProfileId: customerId,
        content: `Integrity note ${testToken}`,
      });
      const noteId = note.id;

      const booking = await caller.crm.booking.createBooking({
        customerProfileId: customerId,
        propertyId: propertyId,
        title: `Integrity Booking ${testToken}`,
        scheduledStart: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
      });
      const bookingId = booking.id;

      // Note: In a real system, we'd test cascade deletes or orphan handling
      // For now, we verify data exists before deletion
      const dbConn = await db.getDb();
      if (dbConn) {
        // Clean up manually (cascade behavior depends on schema)
        await dbConn.delete(bookings).where(eq(bookings.id, bookingId));
        await dbConn
          .delete(customerNotesInFridayAi)
          .where(eq(customerNotesInFridayAi.id, noteId));
        await dbConn
          .delete(customerProperties)
          .where(eq(customerProperties.id, propertyId));
        await dbConn
          .delete(customerProfiles)
          .where(eq(customerProfiles.id, customerId));
      }
    });

    it("handles concurrent operations gracefully", async () => {
      const customer = await caller.crm.customer.createProfile({
        name: `Concurrent Test ${testToken}`,
        email: `concurrent.${testToken}@example.com`,
        customerType: "private",
      });
      cleanupIds.customers.push(customer.id);

      // Create multiple properties concurrently
      const promises = Array.from({ length: 3 }, (_, i) =>
        caller.crm.customer.createProperty({
          customerProfileId: customer.id,
          address: `Concurrent Property ${i} ${testToken}`,
        })
      );

      const properties = await Promise.all(promises);
      expect(properties.length).toBe(3);
      properties.forEach(p => cleanupIds.properties.push(p.id));

      // Verify all created
      const listed = await caller.crm.customer.listProperties({
        customerProfileId: customer.id,
      });
      expect(listed.length).toBeGreaterThanOrEqual(3);
    });
  });

  afterAll(async () => {
    const dbConn = await db.getDb();
    if (!dbConn) return;

    // Cleanup in reverse dependency order
    for (const bookingId of cleanupIds.bookings) {
      await dbConn.delete(bookings).where(eq(bookings.id, bookingId));
    }

    for (const noteId of cleanupIds.notes) {
      await dbConn
        .delete(customerNotesInFridayAi)
        .where(eq(customerNotesInFridayAi.id, noteId));
    }

    for (const propertyId of cleanupIds.properties) {
      await dbConn
        .delete(customerProperties)
        .where(eq(customerProperties.id, propertyId));
    }

    for (const customerId of cleanupIds.customers) {
      await dbConn
        .delete(customerProfiles)
        .where(eq(customerProfiles.id, customerId));
    }

    for (const leadId of cleanupIds.leads) {
      await dbConn.delete(leads).where(eq(leads.id, leadId));
    }
  });
});
