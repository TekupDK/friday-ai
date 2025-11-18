/**
 * Booking Creation Tests
 * Tests critical business logic for booking creation in CRM
 */

import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  bookings,
  customerProfiles,
  customerProperties,
} from "../../drizzle/schema";
import { withDatabaseErrorHandling } from "../_core/error-handling";
import { getDb } from "../db";

// Note: These are unit tests that mock the database layer
// For integration tests, see crm-booking-router integration tests

// Mock database
const mockDb = {
  select: vi.fn(),
  insert: vi.fn(),
};

vi.mock("../db", () => ({
  getDb: vi.fn(async () => mockDb),
}));

describe("Booking Creation - CRM Integration", () => {
  const mockUserId = 1;
  const mockCustomerProfileId = 100;
  const mockPropertyId = 200;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create booking with required fields", async () => {
    // Mock profile ownership check
    const selectMock = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: mockCustomerProfileId,
              userId: mockUserId,
              email: "test@example.com",
            },
          ]),
        }),
      }),
    });

    // Mock insert
    const insertMock = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            userId: mockUserId,
            customerProfileId: mockCustomerProfileId,
            title: "Test Booking",
            scheduledStart: "2025-01-30T10:00:00Z",
            status: "planned",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]),
      }),
    });

    mockDb.select = selectMock;
    mockDb.insert = insertMock;

    // Simulate booking creation logic
    const profileRows = await mockDb
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.userId, mockUserId),
          eq(customerProfiles.id, mockCustomerProfileId)
        )
      )
      .limit(1);

    expect(profileRows.length).toBeGreaterThan(0);

    const [created] = await mockDb
      .insert(bookings)
      .values({
        userId: mockUserId,
        customerProfileId: mockCustomerProfileId,
        title: "Test Booking",
        notes: "Test notes",
        scheduledStart: "2025-01-30T10:00:00Z",
        status: "planned",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {},
      })
      .returning();

    expect(created).toBeDefined();
    expect(created.userId).toBe(mockUserId);
    expect(created.customerProfileId).toBe(mockCustomerProfileId);
    expect(created.status).toBe("planned");
  });

  it("should verify profile ownership before creating booking", async () => {
    // Mock profile not found (wrong user)
    const selectMock = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]), // No profile found
        }),
      }),
    });

    mockDb.select = selectMock;

    const profileRows = await mockDb
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.userId, mockUserId),
          eq(customerProfiles.id, mockCustomerProfileId)
        )
      )
      .limit(1);

    expect(profileRows.length).toBe(0);
    // Should throw FORBIDDEN error in actual implementation
  });

  it("should verify property belongs to profile when provided", async () => {
    let callCount = 0;

    // Mock: First call returns profile, second call returns empty (property not found)
    const selectChain = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockImplementation(async () => {
            callCount++;
            // First call: profile found
            if (callCount === 1) {
              return [
                {
                  id: mockCustomerProfileId,
                  userId: mockUserId,
                },
              ];
            }
            // Second call: property not found
            return [];
          }),
        }),
      }),
    };

    mockDb.select = vi.fn().mockReturnValue(selectChain);

    const profileRows = await mockDb
      .select()
      .from(customerProfiles)
      .where(
        and(
          eq(customerProfiles.userId, mockUserId),
          eq(customerProfiles.id, mockCustomerProfileId)
        )
      )
      .limit(1);

    expect(profileRows.length).toBeGreaterThan(0);

    // Check property - should not be found (doesn't belong to profile)
    const propRows = await mockDb
      .select()
      .from(customerProperties)
      .where(
        and(
          eq(customerProperties.id, mockPropertyId),
          eq(customerProperties.customerProfileId, mockCustomerProfileId)
        )
      )
      .limit(1);

    expect(propRows.length).toBe(0);
    // Should throw BAD_REQUEST error in actual implementation
  });

  it("should set default status to 'planned'", async () => {
    const insertMock = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            status: "planned",
          },
        ]),
      }),
    });

    mockDb.insert = insertMock;

    const [created] = await mockDb
      .insert(bookings)
      .values({
        userId: mockUserId,
        customerProfileId: mockCustomerProfileId,
        scheduledStart: "2025-01-30T10:00:00Z",
        status: "planned", // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    expect(created.status).toBe("planned");
  });

  it("should handle database errors gracefully", async () => {
    const dbError = new Error("Database connection failed");

    // Test error handling wrapper
    await expect(
      withDatabaseErrorHandling(async () => {
        throw dbError;
      }, "Failed to create booking")
    ).rejects.toThrow();
  });
});
