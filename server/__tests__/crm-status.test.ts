process.env.NODE_TLS_REJECT_UNAUTHORIZED =
  process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0";
process.env.DOTENV_CONFIG_PATH =
  process.env.DOTENV_CONFIG_PATH || ".env.staging";
import "dotenv/config";

import { describe, expect, it } from "vitest";
import type { TrpcContext } from "../_core/context";
import { ENV } from "../_core/env";
import { router } from "../_core/trpc";
import * as db from "../db";
import { crmStatsRouter } from "../routers/crm-stats-router";

describe("CRM system status", () => {
  it("returns integration and DB status", async () => {
    expect(ENV.databaseUrl).toBeTruthy();
    const dbConn = await db.getDb();
    expect(!!dbConn).toBeTruthy();

    const user = await db.upsertUser({
      openId: ENV.ownerOpenId,
      name: "Owner",
      loginMethod: "dev",
      lastSignedIn: new Date().toISOString(),
    });
    const ctx: TrpcContext = {
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: await db.getUserByOpenId(ENV.ownerOpenId),
    };

    const testRouter = router({ crm: router({ stats: crmStatsRouter }) });
    const caller = testRouter.createCaller(ctx);
    const stats = await caller.crm.stats.getDashboardStats();

    // Basic shape checks for dashboard metrics
    expect(typeof stats.customers.total).toBe("number");
    expect(typeof stats.revenue.total).toBe("number");
    expect(typeof stats.bookings.planned).toBe("number");
  });
});
