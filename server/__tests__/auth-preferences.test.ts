/**
 * Auth Preferences Tests
 * Tests for getPreferences and updatePreferences endpoints
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import type { Request, Response } from "express";

// STEP 1: Mock all problematic dependencies BEFORE any imports
// This prevents import resolution errors during test setup

// Mock database helpers
vi.mock("../db", () => ({
  getUserPreferences: vi.fn(),
  updateUserPreferences: vi.fn(),
  getDb: vi.fn(),
}));

// Mock google-api and related modules
vi.mock("../google-api", () => ({}));
vi.mock("../modules/email/gmail-labels", () => ({}));

// Mock all CRM routers that have problematic imports
vi.mock("../modules/crm/customer-router", () => ({
  customerRouter: {
    createCaller: vi.fn(),
  },
}));

vi.mock("../routers/crm-customer-router", () => ({
  crmCustomerRouter: {
    createCaller: vi.fn(),
  },
}));

vi.mock("../routers/crm-lead-router", () => ({
  crmLeadRouter: {
    createCaller: vi.fn(),
  },
}));

vi.mock("../routers/crm-booking-router", () => ({
  crmBookingRouter: {
    createCaller: vi.fn(),
  },
}));

vi.mock("../routers/crm-service-template-router", () => ({
  crmServiceTemplateRouter: {
    createCaller: vi.fn(),
  },
}));

vi.mock("../routers/crm-stats-router", () => ({
  crmStatsRouter: {
    createCaller: vi.fn(),
  },
}));

vi.mock("../routers/crm-activity-router", () => ({
  crmActivityRouter: {
    createCaller: vi.fn(),
  },
}));

vi.mock("../routers/crm-extensions-router", () => ({
  crmExtensionsRouter: {
    createCaller: vi.fn(),
  },
}));

// STEP 2: Now import after all mocks are set up
import { appRouter } from "../routers";
import { getUserPreferences, updateUserPreferences } from "../db";
import type { TrpcContext } from "../_core/context";

// Helper to create test context
function createTestContext(options: { user: TrpcContext["user"] }): TrpcContext {
  return {
    user: options.user,
    req: {
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    } as Request,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as Response,
  };
}

describe("Auth Preferences", () => {
  const mockUser = {
    id: 1,
    email: "test@example.com",
    name: "Test User",
    role: "user" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPreferences", () => {
    it("should return user preferences when authenticated", async () => {
      const mockPreferences = {
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: { language: "da" },
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      };

      vi.mocked(getUserPreferences).mockResolvedValue(mockPreferences);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.getPreferences();

      expect(result).toEqual({
        ...mockPreferences,
        pushNotifications: false, // Mapped from desktopNotifications
        language: "da", // Extracted from preferences JSONB
      });
      expect(getUserPreferences).toHaveBeenCalledWith(1);
    });

    it("should return null language when not in preferences", async () => {
      const mockPreferences = {
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: true,
        preferences: null,
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      };

      vi.mocked(getUserPreferences).mockResolvedValue(mockPreferences);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.getPreferences();

      expect(result.language).toBeNull();
      expect(result.pushNotifications).toBe(true);
    });

    it("should throw UNAUTHORIZED when not authenticated", async () => {
      const ctx = createTestContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.getPreferences()).rejects.toThrow(TRPCError);
      await expect(caller.auth.getPreferences()).rejects.toThrow("UNAUTHORIZED");
    });

    it("should throw INTERNAL_SERVER_ERROR when preferences cannot be loaded", async () => {
      vi.mocked(getUserPreferences).mockResolvedValue(null);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      await expect(caller.auth.getPreferences()).rejects.toThrow(TRPCError);
      await expect(caller.auth.getPreferences()).rejects.toThrow("INTERNAL_SERVER_ERROR");
    });
  });

  describe("updatePreferences", () => {
    it("should update theme preference", async () => {
      const mockUpdated = {
        id: 1,
        userId: 1,
        theme: "light" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: null,
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      };

      vi.mocked(getUserPreferences).mockResolvedValue({
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: null,
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      });
      vi.mocked(updateUserPreferences).mockResolvedValue(mockUpdated);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updatePreferences({ theme: "light" });

      expect(result.theme).toBe("light");
      expect(updateUserPreferences).toHaveBeenCalledWith(1, { theme: "light" });
    });

    it("should map pushNotifications to desktopNotifications", async () => {
      const mockUpdated = {
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: true,
        preferences: null,
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      };

      vi.mocked(getUserPreferences).mockResolvedValue({
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: null,
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      });
      vi.mocked(updateUserPreferences).mockResolvedValue(mockUpdated);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updatePreferences({ pushNotifications: true });

      expect(result.pushNotifications).toBe(true);
      expect(updateUserPreferences).toHaveBeenCalledWith(1, {
        desktopNotifications: true,
      });
    });

    it("should store language in preferences JSONB", async () => {
      const mockUpdated = {
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: { language: "en" },
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      };

      vi.mocked(getUserPreferences).mockResolvedValue({
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: { language: "da" },
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      });
      vi.mocked(updateUserPreferences).mockResolvedValue(mockUpdated);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updatePreferences({ language: "en" });

      expect(result.language).toBe("en");
      expect(updateUserPreferences).toHaveBeenCalledWith(1, {
        preferences: { language: "en" },
      });
    });

    it("should merge existing preferences when updating language", async () => {
      const mockUpdated = {
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: { language: "en", otherSetting: "value" },
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      };

      vi.mocked(getUserPreferences).mockResolvedValue({
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: { otherSetting: "value" },
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      });
      vi.mocked(updateUserPreferences).mockResolvedValue(mockUpdated);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updatePreferences({ language: "en" });

      expect(result.language).toBe("en");
      expect(updateUserPreferences).toHaveBeenCalledWith(1, {
        preferences: { otherSetting: "value", language: "en" },
      });
    });

    it("should throw UNAUTHORIZED when not authenticated", async () => {
      const ctx = createTestContext({ user: null });
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.updatePreferences({ theme: "light" })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.auth.updatePreferences({ theme: "light" })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should throw INTERNAL_SERVER_ERROR when update fails", async () => {
      vi.mocked(getUserPreferences).mockResolvedValue({
        id: 1,
        userId: 1,
        theme: "dark" as const,
        emailNotifications: true,
        desktopNotifications: false,
        preferences: null,
        createdAt: "2025-01-28T00:00:00Z",
        updatedAt: "2025-01-28T00:00:00Z",
      });
      vi.mocked(updateUserPreferences).mockResolvedValue(null);

      const ctx = createTestContext({ user: mockUser });
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.updatePreferences({ theme: "light" })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.auth.updatePreferences({ theme: "light" })
      ).rejects.toThrow("INTERNAL_SERVER_ERROR");
    });
  });
});

