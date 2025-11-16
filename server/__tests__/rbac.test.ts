import { beforeAll, describe, expect, it } from "vitest";

// Ensure DATABASE_URL is unset so getDb() returns null in tests
beforeAll(() => {
  delete (process.env as any).DATABASE_URL;
});

describe("RBAC getUserRole (fallback without DB)", () => {
  it("returns 'owner' for userId 1 in fallback mode", async () => {
    const { getUserRole } = await import("../rbac");
    const role = await getUserRole(1);
    expect(role).toBe("owner");
  });

  it("returns 'user' for non-owner ids in fallback mode", async () => {
    const { getUserRole } = await import("../rbac");
    const role = await getUserRole(2);
    expect(role).toBe("user");
  });
});

describe("RBAC permissions", () => {
  it("requires owner for create_invoice", async () => {
    const { hasPermission } = await import("../rbac");
    expect(hasPermission("user", "create_invoice")).toBe(false);
    expect(hasPermission("admin", "create_invoice")).toBe(false);
    expect(hasPermission("owner", "create_invoice")).toBe(true);
  });

  it("allows user for create_task (low-risk)", async () => {
    const { hasPermission } = await import("../rbac");
    expect(hasPermission("user", "create_task")).toBe(true);
    expect(hasPermission("guest", "create_task")).toBe(false);
  });
});

describe("requireOwnership", () => {
  it("allows access when user owns the resource", async () => {
    const { requireOwnership } = await import("../rbac");
    const userId = 1;
    const resourceUserId = 1;
    
    // Should not throw
    expect(() => {
      requireOwnership(userId, resourceUserId, "test resource", 123);
    }).not.toThrow();
  });

  it("throws FORBIDDEN when user doesn't own the resource", async () => {
    const { requireOwnership } = await import("../rbac");
    const { TRPCError } = await import("@trpc/server");
    
    const userId = 1;
    const resourceUserId = 2; // Different user
    
    expect(() => {
      requireOwnership(userId, resourceUserId, "test resource", 123);
    }).toThrow(TRPCError);
    
    try {
      requireOwnership(userId, resourceUserId, "test resource", 123);
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("don't have permission");
      expect(error.message).toContain("test resource");
      expect(error.message).toContain("ID: 123");
    }
  });

  it("throws FORBIDDEN when resource has no userId", async () => {
    const { requireOwnership } = await import("../rbac");
    const { TRPCError } = await import("@trpc/server");
    
    const userId = 1;
    
    expect(() => {
      requireOwnership(userId, null, "test resource");
    }).toThrow(TRPCError);
    
    try {
      requireOwnership(userId, null, "test resource");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("has no owner");
    }
  });
});

describe("requireOwnershipBatch", () => {
  it("allows access when user owns all resources", async () => {
    const { requireOwnershipBatch } = await import("../rbac");
    const userId = 1;
    const resources = [
      { userId: 1, id: 1 },
      { userId: 1, id: 2 },
      { userId: 1, id: 3 },
    ];
    
    // Should not throw
    expect(() => {
      requireOwnershipBatch(userId, resources, "test resource");
    }).not.toThrow();
  });

  it("throws FORBIDDEN when user doesn't own any resource", async () => {
    const { requireOwnershipBatch } = await import("../rbac");
    const { TRPCError } = await import("@trpc/server");
    
    const userId = 1;
    const resources = [
      { userId: 1, id: 1 },
      { userId: 2, id: 2 }, // Different user
      { userId: 1, id: 3 },
    ];
    
    expect(() => {
      requireOwnershipBatch(userId, resources, "test resource");
    }).toThrow(TRPCError);
  });
});
