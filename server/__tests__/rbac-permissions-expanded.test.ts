/**
 * RBAC Permissions - Expanded Test Suite
 *
 * Comprehensive permission denial scenarios and edge cases
 * Tests: All action permissions, guest denials, role hierarchy, edge cases
 * Security: Unknown actions, permission escalation prevention
 */

import { TRPCError } from "@trpc/server";
import { describe, expect, it } from "vitest";

import type { ActionPermission, UserRole } from "../rbac";

describe("RBAC - Permission Denial Scenarios", () => {
  describe("Guest Role Permissions (All Denied)", () => {
    const guestDeniedActions: ActionPermission[] = [
      "create_lead",
      "create_task",
      "book_meeting",
      "create_invoice",
      "search_gmail",
      "search_email",
      "check_calendar",
      "list_leads",
      "list_tasks",
      "request_flytter_photos",
      "job_completion",
      "send_email",
      "delete_email",
      "archive_email",
      "snooze_email",
      "mark_email_done",
    ];

    it.each(guestDeniedActions)(
      "should deny guest access to %s",
      async (action) => {
        const { hasPermission } = await import("../rbac");
        expect(hasPermission("guest", action)).toBe(false);
      }
    );

    it("should deny guest all permissions via requirePermission", async () => {
      const { requirePermission } = await import("../rbac");

      for (const action of guestDeniedActions) {
        expect(() => {
          requirePermission("guest", action);
        }).toThrow(TRPCError);
      }
    });
  });

  describe("User Role Permission Denials", () => {
    it("should deny user access to admin-only actions", async () => {
      const { hasPermission } = await import("../rbac");
      expect(hasPermission("user", "book_meeting")).toBe(false);
      expect(hasPermission("user", "delete_email")).toBe(false);
    });

    it("should deny user access to owner-only actions", async () => {
      const { hasPermission } = await import("../rbac");
      expect(hasPermission("user", "create_invoice")).toBe(false);
    });

    it("should throw FORBIDDEN for book_meeting", async () => {
      const { requirePermission } = await import("../rbac");

      expect(() => {
        requirePermission("user", "book_meeting");
      }).toThrow(TRPCError);

      try {
        requirePermission("user", "book_meeting");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Administrator");
        expect(error.message).toContain("book_meeting");
      }
    });

    it("should throw FORBIDDEN for delete_email", async () => {
      const { requirePermission } = await import("../rbac");

      expect(() => {
        requirePermission("user", "delete_email");
      }).toThrow(TRPCError);

      try {
        requirePermission("user", "delete_email");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Administrator");
      }
    });

    it("should throw FORBIDDEN for create_invoice", async () => {
      const { requirePermission } = await import("../rbac");

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

  describe("Admin Role Permission Denials", () => {
    it("should deny admin access to owner-only actions", async () => {
      const { hasPermission } = await import("../rbac");
      expect(hasPermission("admin", "create_invoice")).toBe(false);
    });

    it("should throw FORBIDDEN for create_invoice", async () => {
      const { requirePermission } = await import("../rbac");

      expect(() => {
        requirePermission("admin", "create_invoice");
      }).toThrow(TRPCError);

      try {
        requirePermission("admin", "create_invoice");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("Owner");
      }
    });
  });

  describe("Unknown Actions (Security: Deny by Default)", () => {
    it("should deny access to unknown action types", async () => {
      const { hasPermission } = await import("../rbac");
      // @ts-expect-error Testing invalid action
      expect(hasPermission("owner", "unknown_action")).toBe(false);
      // @ts-expect-error Testing invalid action
      expect(hasPermission("admin", "delete_all_data")).toBe(false);
      // @ts-expect-error Testing invalid action
      expect(hasPermission("user", "admin_panel")).toBe(false);
    });

    it("should deny guest access to unknown actions", async () => {
      const { hasPermission } = await import("../rbac");
      // @ts-expect-error Testing invalid action
      expect(hasPermission("guest", "unknown_action")).toBe(false);
    });
  });
});

describe("RBAC - Permission Grant Scenarios", () => {
  describe("User Role Allowed Actions", () => {
    const userAllowedActions: ActionPermission[] = [
      "create_task",
      "snooze_email",
      "mark_email_done",
      "archive_email",
      "search_gmail",
      "search_email",
      "create_lead",
      "send_email",
      "request_flytter_photos",
      "job_completion",
      "check_calendar",
      "list_leads",
      "list_tasks",
    ];

    it.each(userAllowedActions)(
      "should allow user access to %s",
      async (action) => {
        const { hasPermission } = await import("../rbac");
        expect(hasPermission("user", action)).toBe(true);
      }
    );
  });

  describe("Admin Role Allowed Actions (Includes User + Admin)", () => {
    const adminAllowedActions: ActionPermission[] = [
      // User actions
      "create_task",
      "snooze_email",
      "mark_email_done",
      "archive_email",
      "search_gmail",
      "search_email",
      "create_lead",
      "send_email",
      "request_flytter_photos",
      "job_completion",
      "check_calendar",
      "list_leads",
      "list_tasks",
      // Admin-only actions
      "book_meeting",
      "delete_email",
    ];

    it.each(adminAllowedActions)(
      "should allow admin access to %s",
      async (action) => {
        const { hasPermission } = await import("../rbac");
        expect(hasPermission("admin", action)).toBe(true);
      }
    );
  });

  describe("Owner Role Allowed Actions (All)", () => {
    const allActions: ActionPermission[] = [
      "create_lead",
      "create_task",
      "book_meeting",
      "create_invoice",
      "search_gmail",
      "search_email",
      "check_calendar",
      "list_leads",
      "list_tasks",
      "request_flytter_photos",
      "job_completion",
      "send_email",
      "delete_email",
      "archive_email",
      "snooze_email",
      "mark_email_done",
    ];

    it.each(allActions)("should allow owner access to %s", async (action) => {
      const { hasPermission } = await import("../rbac");
      expect(hasPermission("owner", action)).toBe(true);
    });
  });
});

describe("RBAC - getAllowedActions", () => {
  it("should return empty list for guest", async () => {
    const { getAllowedActions } = await import("../rbac");
    const actions = getAllowedActions("guest");
    expect(actions).toEqual([]);
  });

  it("should return user-level actions for user role", async () => {
    const { getAllowedActions } = await import("../rbac");
    const actions = getAllowedActions("user");

    expect(actions).toContain("create_task");
    expect(actions).toContain("create_lead");
    expect(actions).toContain("send_email");
    expect(actions).not.toContain("book_meeting");
    expect(actions).not.toContain("delete_email");
    expect(actions).not.toContain("create_invoice");
  });

  it("should return user + admin actions for admin role", async () => {
    const { getAllowedActions } = await import("../rbac");
    const actions = getAllowedActions("admin");

    expect(actions).toContain("create_task");
    expect(actions).toContain("create_lead");
    expect(actions).toContain("book_meeting");
    expect(actions).toContain("delete_email");
    expect(actions).not.toContain("create_invoice");
  });

  it("should return all actions for owner role", async () => {
    const { getAllowedActions } = await import("../rbac");
    const actions = getAllowedActions("owner");

    expect(actions).toContain("create_task");
    expect(actions).toContain("create_lead");
    expect(actions).toContain("book_meeting");
    expect(actions).toContain("delete_email");
    expect(actions).toContain("create_invoice");
    expect(actions.length).toBeGreaterThan(10);
  });

  it("should respect role hierarchy in allowed actions", async () => {
    const { getAllowedActions } = await import("../rbac");

    const guestActions = getAllowedActions("guest");
    const userActions = getAllowedActions("user");
    const adminActions = getAllowedActions("admin");
    const ownerActions = getAllowedActions("owner");

    expect(guestActions.length).toBeLessThan(userActions.length);
    expect(userActions.length).toBeLessThan(adminActions.length);
    expect(adminActions.length).toBeLessThan(ownerActions.length);
  });
});

describe("RBAC - getRoleName", () => {
  it("should return human-readable names for all roles", async () => {
    const { getRoleName } = await import("../rbac");

    expect(getRoleName("owner")).toBe("Owner");
    expect(getRoleName("admin")).toBe("Administrator");
    expect(getRoleName("user")).toBe("User");
    expect(getRoleName("guest")).toBe("Guest");
  });
});

describe("RBAC - Resource Ownership Edge Cases", () => {
  describe("requireOwnership - Additional Scenarios", () => {
    it("should handle undefined resourceUserId", async () => {
      const { requireOwnership } = await import("../rbac");

      expect(() => {
        requireOwnership(1, undefined, "profile");
      }).toThrow(TRPCError);

      try {
        requireOwnership(1, undefined, "profile");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("has no owner");
      }
    });

    it("should include resource ID in error message when provided", async () => {
      const { requireOwnership } = await import("../rbac");

      try {
        requireOwnership(1, 2, "customer", 999);
      } catch (error: any) {
        expect(error.message).toContain("ID: 999");
        expect(error.message).toContain("customer");
      }
    });

    it("should not include resource ID in error when not provided", async () => {
      const { requireOwnership } = await import("../rbac");

      try {
        requireOwnership(1, 2, "customer");
      } catch (error: any) {
        expect(error.message).not.toContain("ID:");
        expect(error.message).toContain("customer");
      }
    });

    it("should handle different resource types correctly", async () => {
      const { requireOwnership } = await import("../rbac");

      const resourceTypes = ["lead", "task", "invoice", "customer profile"];

      for (const resourceType of resourceTypes) {
        try {
          requireOwnership(1, 2, resourceType, 123);
        } catch (error: any) {
          expect(error.message).toContain(resourceType);
        }
      }
    });
  });

  describe("requireOwnershipBatch - Additional Scenarios", () => {
    it("should handle empty resource array", async () => {
      const { requireOwnershipBatch } = await import("../rbac");

      // Should not throw for empty array
      expect(() => {
        requireOwnershipBatch(1, [], "resource");
      }).not.toThrow();
    });

    it("should identify first non-owned resource", async () => {
      const { requireOwnershipBatch } = await import("../rbac");

      const resources = [
        { userId: 1, id: 1 },
        { userId: 1, id: 2 },
        { userId: 2, id: 3 }, // Different owner
        { userId: 1, id: 4 },
      ];

      expect(() => {
        requireOwnershipBatch(1, resources, "task");
      }).toThrow(TRPCError);
    });

    it("should handle null userId in batch", async () => {
      const { requireOwnershipBatch } = await import("../rbac");

      const resources = [
        { userId: 1, id: 1 },
        { userId: null, id: 2 }, // Null owner
      ];

      expect(() => {
        requireOwnershipBatch(1, resources, "lead");
      }).toThrow(TRPCError);

      try {
        requireOwnershipBatch(1, resources, "lead");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
        expect(error.message).toContain("has no owner");
      }
    });

    it("should handle undefined userId in batch", async () => {
      const { requireOwnershipBatch } = await import("../rbac");

      const resources = [
        { userId: 1, id: 1 },
        { userId: undefined, id: 2 }, // Undefined owner
      ];

      expect(() => {
        requireOwnershipBatch(1, resources, "invoice");
      }).toThrow(TRPCError);
    });
  });
});

describe("RBAC - Role Hierarchy Edge Cases", () => {
  describe("requireRoleOrHigher - Edge Cases", () => {
    it("should handle action description in error message", async () => {
      const { requireRoleOrHigher } = await import("../rbac");

      try {
        requireRoleOrHigher("user", "admin", "delete all users");
      } catch (error: any) {
        expect(error.message).toContain("delete all users");
        expect(error.message).toContain("Administrator");
      }
    });

    it("should work without action description", async () => {
      const { requireRoleOrHigher } = await import("../rbac");

      try {
        requireRoleOrHigher("user", "owner");
      } catch (error: any) {
        expect(error.message).toContain("Owner");
        expect(error.message).not.toContain("to to"); // No double "to"
      }
    });

    it("should allow exact role match", async () => {
      const { requireRoleOrHigher } = await import("../rbac");

      expect(() => {
        requireRoleOrHigher("user", "user");
      }).not.toThrow();

      expect(() => {
        requireRoleOrHigher("admin", "admin");
      }).not.toThrow();

      expect(() => {
        requireRoleOrHigher("owner", "owner");
      }).not.toThrow();
    });

    it("should test all role combinations", async () => {
      const { requireRoleOrHigher } = await import("../rbac");
      const roles: UserRole[] = ["guest", "user", "admin", "owner"];

      for (const userRole of roles) {
        for (const requiredRole of roles) {
          const userLevel = { guest: 0, user: 1, admin: 2, owner: 3 }[userRole];
          const requiredLevel = {
            guest: 0,
            user: 1,
            admin: 2,
            owner: 3,
          }[requiredRole];

          if (userLevel >= requiredLevel) {
            expect(() => {
              requireRoleOrHigher(userRole, requiredRole);
            }).not.toThrow();
          } else {
            expect(() => {
              requireRoleOrHigher(userRole, requiredRole);
            }).toThrow(TRPCError);
          }
        }
      }
    });
  });
});

describe("RBAC - Permission Escalation Prevention", () => {
  it("should prevent user from accessing admin actions", async () => {
    const { hasPermission } = await import("../rbac");
    const adminActions = ["book_meeting", "delete_email"];

    for (const action of adminActions) {
      expect(hasPermission("user", action as ActionPermission)).toBe(false);
    }
  });

  it("should prevent admin from accessing owner actions", async () => {
    const { hasPermission } = await import("../rbac");
    const ownerActions = ["create_invoice"];

    for (const action of ownerActions) {
      expect(hasPermission("admin", action as ActionPermission)).toBe(false);
    }
  });

  it("should prevent guest from accessing any actions", async () => {
    const { getAllowedActions } = await import("../rbac");
    const actions = getAllowedActions("guest");

    expect(actions).toEqual([]);
  });

  it("should throw FORBIDDEN when attempting escalation via requirePermission", async () => {
    const { requirePermission } = await import("../rbac");

    // User trying admin action
    expect(() => {
      requirePermission("user", "delete_email");
    }).toThrow(TRPCError);

    // Admin trying owner action
    expect(() => {
      requirePermission("admin", "create_invoice");
    }).toThrow(TRPCError);

    // Guest trying anything
    expect(() => {
      requirePermission("guest", "create_task");
    }).toThrow(TRPCError);
  });
});

describe("RBAC - Role Checking Utilities", () => {
  describe("isOwner", () => {
    it("should only return true for owner role", async () => {
      const { isOwner } = await import("../rbac");
      const roles: UserRole[] = ["guest", "user", "admin", "owner"];

      for (const role of roles) {
        expect(isOwner(role)).toBe(role === "owner");
      }
    });
  });

  describe("isAdminOrOwner", () => {
    it("should return true for admin and owner only", async () => {
      const { isAdminOrOwner } = await import("../rbac");
      const roles: UserRole[] = ["guest", "user", "admin", "owner"];

      for (const role of roles) {
        expect(isAdminOrOwner(role)).toBe(role === "admin" || role === "owner");
      }
    });
  });

  describe("hasExactRole", () => {
    it("should only match exact roles", async () => {
      const { hasExactRole } = await import("../rbac");

      expect(hasExactRole("guest", "guest")).toBe(true);
      expect(hasExactRole("user", "user")).toBe(true);
      expect(hasExactRole("admin", "admin")).toBe(true);
      expect(hasExactRole("owner", "owner")).toBe(true);

      // Should not match different roles
      expect(hasExactRole("admin", "owner")).toBe(false);
      expect(hasExactRole("owner", "admin")).toBe(false);
      expect(hasExactRole("user", "admin")).toBe(false);
    });
  });

  describe("hasRoleOrHigher", () => {
    it("should handle same role", async () => {
      const { hasRoleOrHigher } = await import("../rbac");

      expect(hasRoleOrHigher("guest", "guest")).toBe(true);
      expect(hasRoleOrHigher("user", "user")).toBe(true);
      expect(hasRoleOrHigher("admin", "admin")).toBe(true);
      expect(hasRoleOrHigher("owner", "owner")).toBe(true);
    });

    it("should handle higher roles", async () => {
      const { hasRoleOrHigher } = await import("../rbac");

      expect(hasRoleOrHigher("owner", "guest")).toBe(true);
      expect(hasRoleOrHigher("owner", "user")).toBe(true);
      expect(hasRoleOrHigher("owner", "admin")).toBe(true);

      expect(hasRoleOrHigher("admin", "guest")).toBe(true);
      expect(hasRoleOrHigher("admin", "user")).toBe(true);

      expect(hasRoleOrHigher("user", "guest")).toBe(true);
    });

    it("should reject lower roles", async () => {
      const { hasRoleOrHigher } = await import("../rbac");

      expect(hasRoleOrHigher("guest", "user")).toBe(false);
      expect(hasRoleOrHigher("guest", "admin")).toBe(false);
      expect(hasRoleOrHigher("guest", "owner")).toBe(false);

      expect(hasRoleOrHigher("user", "admin")).toBe(false);
      expect(hasRoleOrHigher("user", "owner")).toBe(false);

      expect(hasRoleOrHigher("admin", "owner")).toBe(false);
    });
  });
});

describe("RBAC - Comprehensive Action Coverage", () => {
  it("should have permissions defined for all action types", async () => {
    const { hasPermission } = await import("../rbac");

    const allActions: ActionPermission[] = [
      "create_lead",
      "create_task",
      "book_meeting",
      "create_invoice",
      "search_gmail",
      "search_email",
      "check_calendar",
      "list_leads",
      "list_tasks",
      "request_flytter_photos",
      "job_completion",
      "send_email",
      "delete_email",
      "archive_email",
      "snooze_email",
      "mark_email_done",
    ];

    // Owner should have access to all actions
    for (const action of allActions) {
      expect(hasPermission("owner", action)).toBe(true);
    }

    // Each action should be accessible by at least one role
    for (const action of allActions) {
      const roles: UserRole[] = ["guest", "user", "admin", "owner"];
      const hasAtLeastOne = roles.some((role) => hasPermission(role, action));
      expect(hasAtLeastOne).toBe(true);
    }
  });
});
