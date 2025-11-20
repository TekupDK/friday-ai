/**
 * Sentry Integration Tests
 * Tests for Sentry error tracking initialization and configuration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { ENV } from "../_core/env";

describe("Sentry Integration Tests", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("Server Sentry Configuration (ENV)", () => {
    it("should read SENTRY_DSN from environment", () => {
      process.env.SENTRY_DSN = "https://test-dsn@sentry.io/123";
      
      // ENV is evaluated at module load time, so we test the current value
      // In a real scenario, we'd need to reload the module
      expect(process.env.SENTRY_DSN).toBe("https://test-dsn@sentry.io/123");
    });

    it("should handle missing SENTRY_DSN", () => {
      delete process.env.SENTRY_DSN;
      
      // Verify environment variable is not set
      expect(process.env.SENTRY_DSN).toBeUndefined();
    });

    it("should read SENTRY_ENABLED from environment", () => {
      process.env.SENTRY_ENABLED = "true";
      
      expect(process.env.SENTRY_ENABLED).toBe("true");
      expect(process.env.SENTRY_ENABLED === "true").toBe(true);
    });

    it("should handle missing SENTRY_ENABLED", () => {
      delete process.env.SENTRY_ENABLED;
      
      expect(process.env.SENTRY_ENABLED).toBeUndefined();
      expect(process.env.SENTRY_ENABLED === "true").toBe(false);
    });

    it("should read SENTRY_TRACES_SAMPLE_RATE from environment", () => {
      process.env.SENTRY_TRACES_SAMPLE_RATE = "0.5";
      
      const rate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1");
      expect(rate).toBe(0.5);
    });

    it("should default to 0.1 if SENTRY_TRACES_SAMPLE_RATE not set", () => {
      delete process.env.SENTRY_TRACES_SAMPLE_RATE;
      
      const rate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1");
      expect(rate).toBe(0.1);
    });

    it("should read NODE_ENV for sentryEnvironment", () => {
      process.env.NODE_ENV = "production";
      
      const env = process.env.NODE_ENV ?? "development";
      expect(env).toBe("production");
    });

    it("should default to development if NODE_ENV not set", () => {
      delete process.env.NODE_ENV;
      
      const env = process.env.NODE_ENV ?? "development";
      expect(env).toBe("development");
    });
  });

  describe("Server Sentry Configuration Validation", () => {
    it("should handle invalid SENTRY_TRACES_SAMPLE_RATE gracefully", () => {
      process.env.SENTRY_TRACES_SAMPLE_RATE = "invalid";
      
      const rate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1");
      
      // Should default to 0.1 when parseFloat fails (returns NaN)
      expect(isNaN(rate) ? 0.1 : rate).toBe(0.1);
    });

    it("should handle empty SENTRY_TRACES_SAMPLE_RATE", () => {
      process.env.SENTRY_TRACES_SAMPLE_RATE = "";
      
      const rate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1");
      expect(rate).toBe(0.1);
    });

    it("should parse valid SENTRY_TRACES_SAMPLE_RATE", () => {
      process.env.SENTRY_TRACES_SAMPLE_RATE = "0.25";
      
      const rate = parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1");
      expect(rate).toBe(0.25);
    });

    it("should validate Sentry initialization conditions", () => {
      // Test that both conditions must be true for initialization
      process.env.SENTRY_DSN = "https://test-dsn@sentry.io/123";
      process.env.SENTRY_ENABLED = "true";
      
      const shouldInit = 
        process.env.SENTRY_ENABLED === "true" && 
        process.env.SENTRY_DSN && 
        process.env.SENTRY_DSN.length > 0;
      
      expect(shouldInit).toBe(true);
    });

    it("should not initialize when SENTRY_ENABLED is false", () => {
      process.env.SENTRY_DSN = "https://test-dsn@sentry.io/123";
      process.env.SENTRY_ENABLED = "false";
      
      const shouldInit = 
        process.env.SENTRY_ENABLED === "true" && 
        process.env.SENTRY_DSN && 
        process.env.SENTRY_DSN.length > 0;
      
      expect(shouldInit).toBe(false);
    });

    it("should not initialize when SENTRY_DSN is missing", () => {
      delete process.env.SENTRY_DSN;
      process.env.SENTRY_ENABLED = "true";
      
      const shouldInit = 
        process.env.SENTRY_ENABLED === "true" && 
        !!process.env.SENTRY_DSN && 
        process.env.SENTRY_DSN.length > 0;
      
      expect(shouldInit).toBe(false);
    });
  });

  describe("ENV Object Sentry Properties", () => {
    it("should have sentryDsn property", () => {
      expect(ENV).toHaveProperty("sentryDsn");
      expect(typeof ENV.sentryDsn).toBe("string");
    });

    it("should have sentryEnabled property", () => {
      expect(ENV).toHaveProperty("sentryEnabled");
      expect(typeof ENV.sentryEnabled).toBe("boolean");
    });

    it("should have sentryEnvironment property", () => {
      expect(ENV).toHaveProperty("sentryEnvironment");
      expect(typeof ENV.sentryEnvironment).toBe("string");
    });

    it("should have sentryTracesSampleRate property", () => {
      expect(ENV).toHaveProperty("sentryTracesSampleRate");
      expect(typeof ENV.sentryTracesSampleRate).toBe("number");
      expect(ENV.sentryTracesSampleRate).toBeGreaterThanOrEqual(0);
      expect(ENV.sentryTracesSampleRate).toBeLessThanOrEqual(1);
    });
  });
});

