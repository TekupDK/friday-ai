import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => {
  return {
    default: {
      post: vi.fn(async () => ({ status: 200 })),
    },
  };
});

const mockedAxios = await import("axios");

function setEnv(vars: Record<string, string | undefined>) {
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete (process.env as any)[k];
    else (process.env as any)[k] = v;
  }
}

describe("analytics exporter", () => {
  beforeEach(() => {
    vi.resetModules();
    (mockedAxios.default.post as any).mockClear();
  });

  it("does nothing when disabled", async () => {
    setEnv({ ANALYTICS_ENABLED: "false", ANALYTICS_PROVIDER: "" });
    const mod = await import("../analytics");
    await mod.trackAnalytics({ name: "test_event", userId: 123 });
    expect((mockedAxios.default.post as any).mock.calls.length).toBe(0);
  });

  it("posts to webhook when enabled and configured", async () => {
    setEnv({
      ANALYTICS_ENABLED: "true",
      ANALYTICS_PROVIDER: "webhook",
      ANALYTICS_WEBHOOK_URL: "https://example.test/analytics",
      ANALYTICS_WEBHOOK_SECRET: "secret",
      VITE_APP_ID: "friday-ai",
    });
    const mod = await import("../analytics");
    await mod.trackAnalytics({
      name: "action_executed",
      userId: 42,
      properties: { actionType: "create_task" },
    });
    const calls = (mockedAxios.default.post as any).mock.calls;
    expect(calls.length).toBe(1);
    expect(calls[0][0]).toContain("example.test/analytics");
    // Body should include event name and userId
    expect(calls[0][1].event).toBe("action_executed");
    expect(calls[0][1].userId).toBe(42);
  });
});
