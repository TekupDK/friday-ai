/**
 * Route Registration Tests
 * 
 * Tests for CRM Standalone route registration in App.tsx.
 * Verifies that routes are properly registered in the route configuration.
 */

import { readFileSync } from "fs";
import { join } from "path";

import { describe, it, expect, vi } from "vitest";

describe("Route Registration", () => {
  const appTsxPath = join(process.cwd(), "client/src/App.tsx");
  let appTsxContent: string;

  beforeAll(() => {
    appTsxContent = readFileSync(appTsxPath, "utf-8");
  });

  describe("CRM Standalone Routes", () => {
    it("should register /crm-standalone route", () => {
      expect(appTsxContent).toContain('path={"/crm-standalone"}');
      expect(appTsxContent).toContain("CRMStandalone");
    });

    it("should register /crm-standalone/:path* catch-all route", () => {
      expect(appTsxContent).toContain('path={"/crm-standalone/:path*"}');
      expect(appTsxContent).toContain("CRMStandalone");
    });

    it("should register /crm/debug route", () => {
      expect(appTsxContent).toContain('path={"/crm/debug"}');
      expect(appTsxContent).toContain("CRMStandalone");
    });

    it("should use lazy loading for CRM Standalone", () => {
      expect(appTsxContent).toContain('lazy(() => import("./pages/crm/CRMStandalone"))');
    });

    it("should have comment explaining standalone mode", () => {
      expect(appTsxContent).toContain("CRM Standalone Debug Mode");
      expect(appTsxContent).toContain("Isolated CRM access for debugging");
    });
  });

  describe("Route Configuration", () => {
    it("should have all CRM routes registered", () => {
      const routes = [
        "/crm/dashboard",
        "/crm/customers",
        "/crm/leads",
        "/crm/bookings",
        "/crm/opportunities",
        "/crm/segments",
      ];

      routes.forEach(route => {
        expect(appTsxContent).toContain(`path={"${route}"}`);
      });
    });

    it("should have standalone routes after regular CRM routes", () => {
      const crmRoutesIndex = appTsxContent.indexOf("/crm/dashboard");
      const standaloneRoutesIndex = appTsxContent.indexOf("/crm-standalone");
      
      expect(crmRoutesIndex).toBeLessThan(standaloneRoutesIndex);
    });
  });
});

