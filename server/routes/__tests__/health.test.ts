/**
 * Health Check Routes Tests
 */

import express from "express";
import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

import healthRouter from "../health";

const app = express();
app.use(express.json());
app.use("/api", healthRouter);

describe("Health Check Routes", () => {
  describe("GET /api/health", () => {
    it("should return 200 with health status", async () => {
      const response = await request(app).get("/api/health");
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: "healthy",
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        version: expect.any(String),
        environment: expect.any(String),
        responseTime: expect.stringMatching(/^\d+ms$/),
      });
    });

    it("should include valid ISO timestamp", async () => {
      const response = await request(app).get("/api/health");
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe("GET /api/ready", () => {
    it("should return readiness status", async () => {
      const response = await request(app).get("/api/ready");
      
      expect([200, 503]).toContain(response.status);
      expect(response.body).toMatchObject({
        status: expect.stringMatching(/^(ready|not_ready)$/),
        timestamp: expect.any(String),
        checks: {
          database: {
            status: expect.stringMatching(/^(ok|error)$/),
          },
          redis: {
            status: expect.stringMatching(/^(ok|error|not_configured)$/),
          },
        },
      });
    });

    it("should include response times when checks pass", async () => {
      const response = await request(app).get("/api/ready");
      
      if (response.body.checks.database.status === "ok") {
        expect(response.body.checks.database.responseTime).toBeGreaterThanOrEqual(0);
      }
      
      if (response.body.checks.redis.status === "ok") {
        expect(response.body.checks.redis.responseTime).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

