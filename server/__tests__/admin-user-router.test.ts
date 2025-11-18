/**
 * Admin User Router Tests
 * 
 * Comprehensive test suite for admin user management endpoints
 * Tests: list, get, create, update, delete operations
 * Security: Role-based access control, owner protection, self-protection
 */

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { describe, it, expect, vi, beforeAll, afterEach, beforeEach } from "vitest";

import { users } from "../../drizzle/schema";
import type { TrpcContext } from "../_core/context";
import { ENV } from "../_core/env";
import * as db from "../db";
import { appRouter } from "../routers";


// Ensure DATABASE_URL is unset for unit tests (fallback mode)
beforeAll(() => {
  // For integration tests, we may want DB, but for unit tests we use fallback
  // This allows tests to work without DB connection
});

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Mock context creator
function createMockContext(user: { 
  id: number; 
  role?: string; 
  openId?: string;
  email?: string;
  name?: string;
}): TrpcContext {
  return {
    req: {} as any,
    res: {} as any,
    user: {
      id: user.id,
      openId: user.openId || `openid-${user.id}`,
      name: user.name || `Test User ${user.id}`,
      email: user.email || `test${user.id}@example.com`,
      role: (user.role as "user" | "admin") || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  };
}

describe("Admin User Router - Role-Based Access Control", () => {
  describe("list endpoint", () => {
    it("should allow admin to list users", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database with proper query builder chain
      const dbModule = await import("../db");

      // Mock count query result
      const mockCountResult = [{ count: 2 }];
      const mockCountResolve = vi.fn().mockResolvedValue(mockCountResult);
      const mockCountWhere = vi.fn().mockReturnValue({ then: mockCountResolve });
      const mockCountFrom = vi.fn().mockReturnValue({
        where: mockCountWhere,
        then: mockCountResolve,
      });

      // Mock main query result - chain: select().from(users).orderBy().limit().offset()
      // When no where clause: select().from(users).orderBy().limit().offset()
      const mockUsers = [
        { id: 1, name: "User 1", email: "user1@example.com", role: "user" },
        { id: 2, name: "User 2", email: "user2@example.com", role: "admin" },
      ];
      const mockOffset = vi.fn().mockResolvedValue(mockUsers);
      const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      // from() must return object that has orderBy() method directly accessible
      // Drizzle allows: from().orderBy() OR from().where().orderBy()
      const mockFromResult = {
        where: mockWhere,
        orderBy: mockOrderBy, // Direct method on the object
      };
      const mockFrom = vi.fn().mockReturnValue(mockFromResult);

      // Single db instance – select() decides between count vs main query based on args
      // Need to handle multiple calls: count query first, then main query
      let callCount = 0;
      const dbInstance = {
        select: vi.fn((arg?: any) => {
          callCount++;
          // Count query uses select({ count: ... })
          if (arg && Object.prototype.hasOwnProperty.call(arg, "count")) {
            return { from: mockCountFrom };
          }
          // Main list query uses select() with no args
          return { from: mockFrom };
        }),
      };

      vi.spyOn(dbModule, "getDb").mockResolvedValue(dbInstance as any);

      const result = await caller.admin.users.list({ limit: 50 });

      expect(result).toBeDefined();
      expect(result.users).toBeDefined();
      expect(Array.isArray(result.users)).toBe(true);
    });

    it("should deny regular user from listing users", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("user");

      const ctx = createMockContext({ id: 3, role: "user" });
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.admin.users.list({ limit: 50 })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.list({ limit: 50 });
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Administrator");
      }
    });

    it("should allow owner to list users", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("owner");

      const ctx = createMockContext({ id: 1, openId: ENV.ownerOpenId || "owner-openid" });
      const caller = appRouter.createCaller(ctx);

      // Mock database with proper query builder chain
      const dbModule = await import("../db");
      
      // Mock count query result
      const mockCountResult = [{ count: 0 }];
      const mockCountResolve = vi.fn().mockResolvedValue(mockCountResult);
      const mockCountWhere = vi.fn().mockReturnValue({ then: mockCountResolve });
      const mockCountFrom = vi.fn().mockReturnValue({
        where: mockCountWhere,
        then: mockCountResolve,
      });

      // Mock main query result - owner listing may return empty set
      const mockUsers: any[] = [];
      const mockOffset = vi.fn().mockResolvedValue(mockUsers);
      const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      // from() returns object with orderBy() method
      const mockFromResult = {
        where: mockWhere,
        orderBy: mockOrderBy, // Direct method on the object
      };
      const mockFrom = vi.fn().mockReturnValue(mockFromResult);

      const dbInstance = {
        select: vi.fn((arg?: any) => {
          if (arg && Object.prototype.hasOwnProperty.call(arg, "count")) {
            return { from: mockCountFrom };
          }
          return { from: mockFrom };
        }),
      };

      vi.spyOn(dbModule, "getDb").mockResolvedValue(dbInstance as any);

      const result = await caller.admin.users.list({ limit: 50 });

      expect(result).toBeDefined();
    });
  });

  describe("get endpoint", () => {
    it("should allow admin to get user by ID", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: 1, name: "User 1", email: "user1@example.com", role: "user" },
        ]),
      } as any);

      const result = await caller.admin.users.get({ userId: 1 });

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it("should throw NOT_FOUND for non-existent user", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - return empty array
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      await expect(
        caller.admin.users.get({ userId: 999 })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.get({ userId: 999 });
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
        expect(error.message).toContain("User not found");
      }
    });
  });

  describe("create endpoint", () => {
    it("should allow admin to create user", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - need to handle TWO queries:
      // 1. Check if user exists (should return empty)
      // 2. Get created user after upsert (should return created user for email)
      const dbModule = await import("../db");
      let queryCallCount = 0;
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          queryCallCount++;
          // First call: check existing user (return empty)
          // Second call: get created user (return empty for this test - no email)
          return Promise.resolve([]);
        }),
      };
      vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);
      vi.spyOn(dbModule, "upsertUser").mockResolvedValue();

      const result = await caller.admin.users.create({
        email: "newuser@example.com",
        name: "New User",
        role: "user",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(dbModule.upsertUser).toHaveBeenCalled();
    });

    it("should prevent non-owner from creating admin user", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin"); // Admin, not owner

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      await expect(
        caller.admin.users.create({
          email: "newadmin@example.com",
          name: "New Admin",
          role: "admin",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.create({
          email: "newadmin@example.com",
          name: "New Admin",
          role: "admin",
        });
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Only owner can create admin users");
      }
    });

    it("should allow owner to create admin user", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("owner");

      const ctx = createMockContext({ id: 1, openId: ENV.ownerOpenId || "owner-openid" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - need to handle TWO queries for email sending
      const dbModule = await import("../db");
      let queryCallCount = 0;
      const mockCreatedUser = {
        id: 3,
        openId: "pending:newadmin@example.com",
        name: "New Admin",
        email: "newadmin@example.com",
        role: "admin" as const,
      };
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          queryCallCount++;
          // First call: check existing user (return empty)
          // Second call: get created user (return created user)
          if (queryCallCount === 1) {
            return Promise.resolve([]);
          } else {
            return Promise.resolve([mockCreatedUser]);
          }
        }),
      };
      vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);
      vi.spyOn(dbModule, "upsertUser").mockResolvedValue();

      // Mock notification service (email will be sent)
      const notificationModule = await import("../notification-service");
      vi.spyOn(notificationModule, "sendNotification").mockResolvedValue({
        success: true,
        channel: "email",
        messageId: "test-message-id",
      });

      const result = await caller.admin.users.create({
        email: "newadmin@example.com",
        name: "New Admin",
        role: "admin",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should send invitation email when creating user with email", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - no existing user, successful create
      const dbModule = await import("../db");
      const mockCreatedUser = {
        id: 3,
        openId: "pending:newuser@example.com",
        name: "New User",
        email: "newuser@example.com",
        role: "user" as const,
      };

      // Mock database - need to handle TWO queries:
      // 1. Check if user exists (should return empty)
      // 2. Get created user after upsert (should return created user)
      let queryCallCount = 0;
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          queryCallCount++;
          // First call: check existing user (return empty)
          // Second call: get created user (return created user)
          if (queryCallCount === 1) {
            return Promise.resolve([]);
          } else {
            return Promise.resolve([mockCreatedUser]);
          }
        }),
      };

      vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);
      vi.spyOn(dbModule, "upsertUser").mockResolvedValue();

      // Mock notification service
      const notificationModule = await import("../notification-service");
      const sendNotificationSpy = vi
        .spyOn(notificationModule, "sendNotification")
        .mockResolvedValue({
          success: true,
          channel: "email",
          messageId: "test-message-id",
        });

      const result = await caller.admin.users.create({
        name: "New User",
        email: "newuser@example.com",
        role: "user",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Invitation email sent");
      expect(sendNotificationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "email",
          priority: "normal",
          title: "Velkommen til Friday AI - Rendetalje.dk",
          recipients: ["newuser@example.com"],
          metadata: expect.objectContaining({
            role: "user",
            invitationType: "user_created",
          }),
        })
      );
    });

    it("should not fail user creation if email sending fails", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - need to handle TWO queries:
      // 1. Check if user exists (should return empty)
      // 2. Get created user after upsert (should return created user)
      const dbModule = await import("../db");
      const mockCreatedUser = {
        id: 3,
        openId: "pending:newuser@example.com",
        name: "New User",
        email: "newuser@example.com",
        role: "user" as const,
      };

      let queryCallCount = 0;
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          queryCallCount++;
          // First call: check existing user (return empty)
          // Second call: get created user (return created user)
          if (queryCallCount === 1) {
            return Promise.resolve([]);
          } else {
            return Promise.resolve([mockCreatedUser]);
          }
        }),
      };

      vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);
      vi.spyOn(dbModule, "upsertUser").mockResolvedValue();

      // Mock notification service to fail
      const notificationModule = await import("../notification-service");
      vi.spyOn(notificationModule, "sendNotification").mockRejectedValue(
        new Error("Email service unavailable")
      );

      // Mock logger to verify warning is logged
      const loggerModule = await import("../_core/logger");
      const loggerWarnSpy = vi.spyOn(loggerModule.logger, "warn");

      const result = await caller.admin.users.create({
        name: "New User",
        email: "newuser@example.com",
        role: "user",
      });

      // User creation should still succeed
      expect(result.success).toBe(true);
      expect(result.message).toContain("Invitation email sent"); // Message still says sent (non-blocking)
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          err: expect.any(Error),
          email: "newuser@example.com",
        }),
        "[Admin User] Failed to send invitation email, but user was created"
      );
    });

    it("should throw CONFLICT for duplicate email", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - existing user found
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: 1, email: "existing@example.com" },
        ]),
      } as any);

      await expect(
        caller.admin.users.create({
          email: "existing@example.com",
          name: "Existing User",
          role: "user",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.create({
          email: "existing@example.com",
          name: "Existing User",
          role: "user",
        });
      } catch (error: any) {
        expect(error.code).toBe("CONFLICT");
        expect(error.message).toContain("already exists");
      }
    });
  });

  describe("update endpoint", () => {
    it("should allow admin to update user", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database
      const dbModule = await import("../db");
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: 3, openId: "openid-3", name: "User 3", email: "user3@example.com", role: "user" },
        ]),
      };
      vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);
      vi.spyOn(dbModule, "upsertUser").mockResolvedValue();

      const result = await caller.admin.users.update({
        userId: 3,
        name: "Updated Name",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should prevent modifying owner account", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - owner user
      const dbModule = await import("../db");
      // Use actual ENV.ownerOpenId value, or a test value that matches what the code checks
      const ownerOpenId = ENV.ownerOpenId || "test-owner-openid";
      
      // Mock ENV.ownerOpenId to ensure the check works
      const envModule = await import("../_core/env");
      const originalOwnerOpenId = envModule.ENV.ownerOpenId;
      Object.defineProperty(envModule.ENV, "ownerOpenId", {
        get: () => ownerOpenId,
        configurable: true,
      });

      try {
        // Mock the user lookup query - should return owner user
        vi.spyOn(dbModule, "getDb").mockResolvedValue({
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([
            { id: 1, openId: ownerOpenId, role: "admin", name: "Owner", email: "owner@example.com" },
          ]),
        } as any);
        // Don't mock upsertUser - update should fail before reaching it due to owner check

        await expect(
          caller.admin.users.update({
            userId: 1,
            name: "Updated Name",
          })
        ).rejects.toThrow(TRPCError);

        try {
          await caller.admin.users.update({
            userId: 1,
            name: "Updated Name",
          });
        } catch (error: any) {
          expect(error.code).toBe("FORBIDDEN");
          expect(error.message).toContain("Cannot modify owner account");
        }
      } finally {
        // Restore original value
        Object.defineProperty(envModule.ENV, "ownerOpenId", {
          get: () => originalOwnerOpenId,
          configurable: true,
        });
      }
    });

    it("should prevent self-demotion", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - current user is admin
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: 2, openId: "openid-2", role: "admin" },
        ]),
      } as any);

      await expect(
        caller.admin.users.update({
          userId: 2, // Self
          role: "user", // Demotion
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.update({
          userId: 2,
          role: "user",
        });
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Cannot remove your own admin role");
      }
    });

    it("should prevent non-owner from promoting to admin", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin"); // Admin, not owner

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: 3, openId: "openid-3", role: "user" },
        ]),
      } as any);

      await expect(
        caller.admin.users.update({
          userId: 3,
          role: "admin",
        })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.update({
          userId: 3,
          role: "admin",
        });
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Only owner can promote users to admin");
      }
    });
  });

  describe("delete endpoint", () => {
    it("should allow admin to delete user", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database
      const dbModule = await import("../db");
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: 3, openId: "openid-3", role: "user" },
        ]),
        delete: vi.fn().mockReturnThis(),
      };
      vi.spyOn(dbModule, "getDb").mockResolvedValue(mockDb as any);

      const result = await caller.admin.users.delete({ userId: 3 });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should prevent deleting owner account", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - owner user
      const dbModule = await import("../db");
      // Use actual ENV.ownerOpenId value, or a test value that matches what the code checks
      const ownerOpenId = ENV.ownerOpenId || "test-owner-openid";
      
      // Mock ENV.ownerOpenId to ensure the check works
      const envModule = await import("../_core/env");
      const originalOwnerOpenId = envModule.ENV.ownerOpenId;
      Object.defineProperty(envModule.ENV, "ownerOpenId", {
        get: () => ownerOpenId,
        configurable: true,
      });

      try {
        // Mock the user lookup query - should return owner user
        vi.spyOn(dbModule, "getDb").mockResolvedValue({
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([
            { id: 1, openId: ownerOpenId, role: "admin", name: "Owner", email: "owner@example.com" },
          ]),
          delete: vi.fn().mockReturnThis(),
        } as any);
        // Don't mock delete execution - delete should fail before reaching it due to owner check

        await expect(
          caller.admin.users.delete({ userId: 1 })
        ).rejects.toThrow(TRPCError);

        try {
          await caller.admin.users.delete({ userId: 1 });
        } catch (error: any) {
          expect(error.code).toBe("FORBIDDEN");
          expect(error.message).toContain("Cannot delete owner account");
        }
      } finally {
        // Restore original value
        Object.defineProperty(envModule.ENV, "ownerOpenId", {
          get: () => originalOwnerOpenId,
          configurable: true,
        });
      }
    });

    it("should prevent self-deletion", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          { id: 2, openId: "openid-2", role: "admin" },
        ]),
      } as any);

      await expect(
        caller.admin.users.delete({ userId: 2 })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.delete({ userId: 2 });
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Cannot delete your own account");
      }
    });

    it("should throw NOT_FOUND for non-existent user", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database - empty result
      const dbModule = await import("../db");
      vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      } as any);

      await expect(
        caller.admin.users.delete({ userId: 999 })
      ).rejects.toThrow(TRPCError);

      try {
        await caller.admin.users.delete({ userId: 999 });
      } catch (error: any) {
        expect(error.code).toBe("NOT_FOUND");
        expect(error.message).toContain("User not found");
      }
    });
  });
});

describe("Admin User Router - Edge Cases", () => {
  it("should handle database unavailable gracefully", async () => {
    const rbacModule = await import("../rbac");
    vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

    const ctx = createMockContext({ id: 2, role: "admin" });
    const caller = appRouter.createCaller(ctx);

    // Mock database - null (unavailable)
    const dbModule = await import("../db");
    vi.spyOn(dbModule, "getDb").mockResolvedValue(null);

    await expect(
      caller.admin.users.list({ limit: 50 })
    ).rejects.toThrow(TRPCError);

    try {
      await caller.admin.users.list({ limit: 50 });
    } catch (error: any) {
      expect(error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(error.message).toContain("Database unavailable");
    }
  });

    it("should handle search with empty string", async () => {
      const rbacModule = await import("../rbac");
      vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

      const ctx = createMockContext({ id: 2, role: "admin" });
      const caller = appRouter.createCaller(ctx);

      // Mock database with proper query builder chain
      const dbModule = await import("../db");
      
      // Mock count query result
      const mockCountResult = [{ count: 0 }];
      const mockCountResolve = vi.fn().mockResolvedValue(mockCountResult);
      const mockCountWhere = vi.fn().mockReturnValue({ then: mockCountResolve });
      const mockCountFrom = vi.fn().mockReturnValue({ where: mockCountWhere });
      const mockCountSelect = vi.fn().mockReturnValue({ from: mockCountFrom });
      
      // Mock main query result - empty search means no where clause
      const mockUsers: any[] = [];
      const mockOffset = vi.fn().mockResolvedValue(mockUsers);
      const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      // from() returns object with orderBy() method
      const mockFromResult = {
        where: mockWhere,
        orderBy: mockOrderBy, // Direct method on the object
      };
      const mockFrom = vi.fn().mockReturnValue(mockFromResult);
      const mockSelectResult = { from: mockFrom };
      const mockSelect = vi.fn().mockReturnValue(mockSelectResult);
      
      // Setup getDb to return different mocks for count and main query
      let callCount = 0;
      vi.spyOn(dbModule, "getDb").mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          // First call: count query
          return {
            select: mockCountSelect,
          } as any;
        } else {
          // Second call: main query - return db with select method
          return {
            select: mockSelect,
          } as any;
        }
      });

      const result = await caller.admin.users.list({ 
        search: "", // Empty string should be ignored
        limit: 50 
      });

      expect(result).toBeDefined();
    });

  it("should handle pagination correctly", async () => {
    const rbacModule = await import("../rbac");
    vi.spyOn(rbacModule, "getUserRole").mockResolvedValue("admin");

    const ctx = createMockContext({ id: 2, role: "admin" });
    const caller = appRouter.createCaller(ctx);

    // Mock database with proper query builder chain
    const dbModule = await import("../db");
    
    // Mock count query result
    const mockCountResult = [{ count: 0 }];
    const mockCountResolve = vi.fn().mockResolvedValue(mockCountResult);
    const mockCountWhere = vi.fn().mockReturnValue({ then: mockCountResolve });
    const mockCountFrom = vi.fn().mockReturnValue({ where: mockCountWhere });
    const mockCountSelect = vi.fn().mockReturnValue({ from: mockCountFrom });
    
    // Mock main query with pagination tracking
    const mockUsers: any[] = [];
    const mockOffset = vi.fn().mockResolvedValue(mockUsers);
    const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
    const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
    // from() returns object with orderBy() method
    const mockFromResult = {
      where: mockWhere,
      orderBy: mockOrderBy, // Direct method on the object
    };
    const mockFrom = vi.fn().mockReturnValue(mockFromResult);
    const mockSelectResult = { from: mockFrom };
    const mockSelect = vi.fn().mockReturnValue(mockSelectResult);
    
    // Setup getDb to return different mocks for count and main query
    let callCount = 0;
    vi.spyOn(dbModule, "getDb").mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        // First call: count query
        return {
          select: mockCountSelect,
        } as any;
        } else {
          // Second call: main query - return db with select method
          return {
            select: mockSelect,
          } as any;
        }
    });

    await caller.admin.users.list({ 
      limit: 10,
      offset: 20 
    });

    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockOffset).toHaveBeenCalledWith(20);
  });
});

