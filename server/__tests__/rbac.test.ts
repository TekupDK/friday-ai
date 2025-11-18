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

describe("hasRoleOrHigher", () => {
  it("returns true when user has higher role", async () => {
    const { hasRoleOrHigher } = await import("../rbac");
    expect(hasRoleOrHigher("owner", "admin")).toBe(true);
    expect(hasRoleOrHigher("admin", "user")).toBe(true);
    expect(hasRoleOrHigher("user", "guest")).toBe(true);
  });

  it("returns true when user has exact role", async () => {
    const { hasRoleOrHigher } = await import("../rbac");
    expect(hasRoleOrHigher("admin", "admin")).toBe(true);
    expect(hasRoleOrHigher("user", "user")).toBe(true);
  });

  it("returns false when user has lower role", async () => {
    const { hasRoleOrHigher } = await import("../rbac");
    expect(hasRoleOrHigher("user", "admin")).toBe(false);
    expect(hasRoleOrHigher("admin", "owner")).toBe(false);
    expect(hasRoleOrHigher("guest", "user")).toBe(false);
  });
});

describe("hasExactRole", () => {
  it("returns true for exact role match", async () => {
    const { hasExactRole } = await import("../rbac");
    expect(hasExactRole("admin", "admin")).toBe(true);
    expect(hasExactRole("user", "user")).toBe(true);
  });

  it("returns false for different roles", async () => {
    const { hasExactRole } = await import("../rbac");
    expect(hasExactRole("owner", "admin")).toBe(false);
    expect(hasExactRole("user", "admin")).toBe(false);
  });
});

describe("requireRoleOrHigher", () => {
  it("allows access when user has required role", async () => {
    const { requireRoleOrHigher } = await import("../rbac");
    expect(() => {
      requireRoleOrHigher("admin", "admin");
    }).not.toThrow();
  });

  it("allows access when user has higher role", async () => {
    const { requireRoleOrHigher } = await import("../rbac");
    expect(() => {
      requireRoleOrHigher("owner", "admin");
    }).not.toThrow();
  });

  it("throws FORBIDDEN when user has lower role", async () => {
    const { requireRoleOrHigher } = await import("../rbac");
    const { TRPCError } = await import("@trpc/server");

    expect(() => {
      requireRoleOrHigher("user", "admin");
    }).toThrow(TRPCError);

    try {
      requireRoleOrHigher("user", "admin", "delete user");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("Administrator");
      expect(error.message).toContain("delete user");
    }
  });
});

describe("requirePermission", () => {
  it("allows access when user has permission", async () => {
    const { requirePermission } = await import("../rbac");
    expect(() => {
      requirePermission("user", "create_task");
    }).not.toThrow();
  });

  it("throws FORBIDDEN when user lacks permission", async () => {
    const { requirePermission } = await import("../rbac");
    const { TRPCError } = await import("@trpc/server");

    expect(() => {
      requirePermission("user", "create_invoice");
    }).toThrow(TRPCError);

    try {
      requirePermission("user", "create_invoice");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
      expect(error.message).toContain("Owner");
      expect(error.message).toContain("create_invoice");
    }
  });
});

describe("isOwner", () => {
  it("returns true for owner role", async () => {
    const { isOwner } = await import("../rbac");
    expect(isOwner("owner")).toBe(true);
  });

  it("returns false for non-owner roles", async () => {
    const { isOwner } = await import("../rbac");
    expect(isOwner("admin")).toBe(false);
    expect(isOwner("user")).toBe(false);
    expect(isOwner("guest")).toBe(false);
  });
});

describe("isAdminOrOwner", () => {
  it("returns true for admin and owner", async () => {
    const { isAdminOrOwner } = await import("../rbac");
    expect(isAdminOrOwner("admin")).toBe(true);
    expect(isAdminOrOwner("owner")).toBe(true);
  });

  it("returns false for user and guest", async () => {
    const { isAdminOrOwner } = await import("../rbac");
    expect(isAdminOrOwner("user")).toBe(false);
    expect(isAdminOrOwner("guest")).toBe(false);
  });
});
