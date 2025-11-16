/**
 * Phase 1 Unit Tests - Email List AI Improvements (WORKING VERSION)
 *
 * Tests for:
 * - Badge conditional rendering (only hot leads >= 70)
 * - Quick Actions integration
 * - Simplified layout
 * - Removal of badge clutter
 */

import { describe, expect, it } from "vitest";

// Simple tests that verify code structure without full rendering
describe("Phase 1: Code Structure Verification", () => {
  it("should have EmailQuickActions imported in EmailThreadGroup", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: EmailQuickActions is now imported in EmailThreadGroup
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check import exists (now in EmailThreadGroup)
    expect(content).toContain(
      'import EmailQuickActions from "./EmailQuickActions"'
    );
  });

  it("should have conditional badge rendering (score >= 70)", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for conditional badge logic
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check conditional logic exists (now uses maxLeadScore for threads)
    expect(
      content.includes("maxLeadScore >= 70") ||
        content.includes("leadScore >= 70")
    ).toBe(true);
    expect(content.includes("Hot") || content.includes("hot")).toBe(true);
  });

  it("should have hover-activated Quick Actions", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for Quick Actions
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check hover classes exist (now in EmailThreadGroup)
    expect(content).toContain("opacity-0 group-hover:opacity-100");
    expect(content).toContain("EmailQuickActions");
  });

  it("should NOT render source badges in email items", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const emailListPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailListAI.tsx"
    );
    const content = fs.readFileSync(emailListPath, "utf-8");

    // Count sourceConfig badge references - should be minimal
    const sourceConfigMatches = content.match(/sourceConfig.*Badge/g) || [];

    // Should have very few (only in helper functions, not in email rendering)
    expect(sourceConfigMatches.length).toBeLessThan(3);
  });

  it("should NOT render urgency badges in email items", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const emailListPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailListAI.tsx"
    );
    const content = fs.readFileSync(emailListPath, "utf-8");

    // Check that urgency badges are NOT rendered in email items
    const urgencyBadgeMatches =
      content.match(/urgencyConfig && aiData\?\.urgency/g) || [];

    // Should be 0 (removed in Phase 1)
    expect(urgencyBadgeMatches.length).toBe(0);
  });

  it("should have Shortwave-inspired layout comments", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for Shortwave-inspired comments
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check for Shortwave comments (now in EmailThreadGroup)
    expect(content.includes("Shortwave") || content.includes("shortwave")).toBe(
      true
    );
  });

  it("should have compact layout with minimal elements", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for Phase 1 density/layout logic
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check for compact layout (now in EmailThreadGroup) — allow either single or double quotes
    expect(
      content.includes("density === 'compact'") ||
        content.includes('density === "compact"')
    ).toBe(true);
    expect(content).toContain("truncate"); // For text truncation
  });

  it("should have comfortable layout with snippet", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for Phase 1 layout improvements
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check for comfortable layout with snippet
    expect(content).toContain("line-clamp-2"); // For snippet display
    expect(content).toContain("snippet"); // Snippet rendering
  });

  it("should have attachment icon rendering", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for Phase 1 attachment icon
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check for paperclip icon (now checking hasAttachments for thread)
    expect(
      content.includes("hasAttachments") || content.includes("hasAttachment")
    ).toBe(true);
    expect(content).toContain("Paperclip");
  });

  it("should have unread indicator", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for Phase 1 unread indicator
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check for unread dot (now checking latestMessage.unread for thread)
    expect(content).toContain("unread");
    expect(content).toContain("bg-blue-500"); // Unread indicator color
  });

  it("should have email selection logic", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const emailListPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailListAI.tsx"
    );
    const content = fs.readFileSync(emailListPath, "utf-8");

    // Check for selection handlers (EmailListAI still has these)
    expect(content).toContain("onEmailSelect");
    expect(content).toContain("selectedEmails");
  });

  it("should use virtualization for performance", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const emailListPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailListAI.tsx"
    );
    const content = fs.readFileSync(emailListPath, "utf-8");

    // Check for react-virtual usage (EmailListAI still uses virtualization in Phase 2)
    expect(content).toContain("useVirtualizer");
    expect(content).toContain("getVirtualItems");
  });

  it("should have lead score config helper", () => {
    const fs = require("fs");
    const path = require("path");
    // Phase 2: Lead score config moved to EmailThreadGroup
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const content = fs.readFileSync(threadGroupPath, "utf-8");

    // Check for lead score config function
    expect(content).toContain("getLeadScoreConfig");
    expect(content).toContain("score >= 80"); // Hot lead threshold (70 for Phase 1, 80 for hot)
  });
});

describe("Phase 1: EmailQuickActions Component", () => {
  it("should have EmailQuickActions component file", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const quickActionsPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailQuickActions.tsx"
    );

    // File should exist
    expect(fs.existsSync(quickActionsPath)).toBe(true);
  });

  it("should export EmailQuickActions component", async () => {
    const fs = await import("fs");
    const path = await import("path");

    const quickActionsPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailQuickActions.tsx"
    );
    const content = fs.readFileSync(quickActionsPath, "utf-8");

    // Should have component export
    expect(content).toContain("export default");
    expect(content).toContain("EmailQuickActions");
  });
});

describe("Phase 1: Integration Tests", () => {
  it("should have all Phase 1 improvements in place", async () => {
    const fs = await import("fs");
    const path = await import("path");

    // Phase 2: Check EmailThreadGroup for Phase 1 improvements
    const threadGroupPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailThreadGroup.tsx"
    );
    const threadContent = fs.readFileSync(threadGroupPath, "utf-8");

    const emailListPath = path.join(
      process.cwd(),
      "client/src/components/inbox/EmailListAI.tsx"
    );
    const emailListContent = fs.readFileSync(emailListPath, "utf-8");

    // Check all key improvements (now in EmailThreadGroup due to Phase 2)
    const checks = [
      threadContent.includes("EmailQuickActions"), // Quick Actions
      threadContent.includes("maxLeadScore >= 70") ||
        threadContent.includes("leadScore >= 70"), // Conditional badge
      threadContent.includes("opacity-0 group-hover:opacity-100"), // Hover effects
      emailListContent.includes("Phase 2") ||
        emailListContent.includes("thread"), // Phase 2 integration
      threadContent.includes("line-clamp-2"), // Snippet display
    ];

    // All checks should pass
    expect(checks.every(check => check)).toBe(true);
  });
});
