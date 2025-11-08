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
