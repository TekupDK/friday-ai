/**
 * tRPC Client Export Tests
 * 
 * Tests for the tRPC client export used in standalone mode.
 * Verifies client configuration and export.
 */

import { describe, it, expect, vi } from "vitest";

// Mock dependencies
vi.mock("@trpc/client", () => ({
  httpBatchLink: vi.fn((config: any) => config),
  httpLink: vi.fn((config: any) => config),
  splitLink: vi.fn((config: any) => config),
}));

vi.mock("superjson", () => ({
  default: {},
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    createClient: vi.fn((config: any) => ({
      links: config.links,
      transformer: config.transformer,
    })),
  },
}));

// Import after mocks
import { trpcClient } from "../trpc-client";

describe("tRPC Client Export", () => {
  it("should export trpcClient", () => {
    expect(trpcClient).toBeDefined();
    expect(trpcClient).not.toBeNull();
  });

  it("should have client configuration", () => {
    expect(trpcClient).toHaveProperty("links");
    expect(Array.isArray(trpcClient.links)).toBe(true);
  });

  it("should have links configured", () => {
    // Verify client has links array
    expect(trpcClient.links).toBeDefined();
    expect(trpcClient.links.length).toBeGreaterThan(0);
  });
});

