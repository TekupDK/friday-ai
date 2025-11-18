import { describe, expect, it } from "vitest";

import { logger } from "../logger";
import { metricsService } from "../metrics-service";

describe("Logger and Metrics Integration", () => {
  it("logger exposes basic methods", () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");

    expect(() => {
      logger.info("Test message", { component: "test" });
      logger.error("Test error", { component: "test", error: "test error" });
      logger.warn("Test warning", { component: "test" });
    }).not.toThrow();
  });

  it("should track events in metrics service", async () => {
    const initialMetrics = metricsService.getMetrics();
    const initialCount = initialMetrics.totalEvents;

    // Track a test event
    await metricsService.trackEvent("test_event", {
      testData: "value",
      timestamp: new Date().toISOString(),
    });

    const updatedMetrics = metricsService.getMetrics();
    expect(updatedMetrics.totalEvents).toBe(initialCount + 1);
    expect(updatedMetrics.eventsByType["test_event"]).toBeDefined();
    expect(updatedMetrics.eventsByType["test_event"].count).toBeGreaterThan(0);
  });

  it("should get top events correctly", async () => {
    // Track multiple events
    await metricsService.trackEvent("popular_event");
    await metricsService.trackEvent("popular_event");
    await metricsService.trackEvent("popular_event");
    await metricsService.trackEvent("rare_event");

    const topEvents = metricsService.getTopEvents(2);
    expect(topEvents).toHaveLength(2);
    expect(topEvents[0].eventType).toBe("popular_event");
    expect(topEvents[0].count).toBeGreaterThanOrEqual(3);
  });

  it("should reset metrics correctly", async () => {
    // Track some events
    await metricsService.trackEvent("reset_test");

    const beforeReset = metricsService.getMetrics();
    expect(beforeReset.totalEvents).toBeGreaterThan(0);

    // Reset specific event
    metricsService.resetEventMetrics("reset_test");

    const afterReset = metricsService.getMetrics();
    expect(afterReset.eventsByType["reset_test"]).toBeUndefined();
  });
});
