/**
 * E2E Test Setup - Shared utilities
 */

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import {
  emailFollowups,
  emailResponseFeedback,
  userWritingStyles,
} from "../../../drizzle/schema";
import type { TrpcContext } from "../../_core/context";
import { router } from "../../_core/trpc";
import { getDb } from "../../db";
import { inboxRouter } from "../../routers/inbox-router";

// Normalize DATABASE_URL for postgres.js and Supabase
export function normalizeDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  try {
    const u = new URL(url);
    const sslmode = u.searchParams.get("sslmode");
    if (!sslmode || sslmode === "require") {
      u.searchParams.set("sslmode", "no-verify");
    }
    if (u.searchParams.has("schema")) {
      u.searchParams.delete("schema");
    }
    return u.toString();
  } catch {
    return url;
  }
}

export interface E2ETestContext {
  testRouter: ReturnType<typeof router>;
  testUserId: number;
  testUser: any;
  createdFollowupIds: number[];
  createdFeedbackIds: number[];
  testThreadId: string;
  getMockContext: () => TrpcContext;
  getCaller: () => ReturnType<ReturnType<typeof router>["createCaller"]>;
  cleanup: () => Promise<void>;
}

export async function createE2ETestContext(): Promise<E2ETestContext> {
  const testRouter = router({
    inbox: inboxRouter,
  });

  const { ENV } = await import("../../_core/env");
  const { upsertUser, getUserByOpenId } = await import("../../db");

  await upsertUser({
    openId: ENV.ownerOpenId,
    name: "E2E Test User",
    loginMethod: "dev",
    lastSignedIn: new Date().toISOString(),
  });

  const user = await getUserByOpenId(ENV.ownerOpenId);
  if (!user) throw new Error("Failed to create/find test user");

  const createdFollowupIds: number[] = [];
  const createdFeedbackIds: number[] = [];
  const testThreadId = `test-thread-${nanoid()}`;

  const cleanup = async () => {
    const db = await getDb();
    if (db) {
      if (createdFollowupIds.length > 0) {
        for (const id of createdFollowupIds) {
          await db.delete(emailFollowups).where(eq(emailFollowups.id, id));
        }
      }

      if (createdFeedbackIds.length > 0) {
        for (const id of createdFeedbackIds) {
          await db
            .delete(emailResponseFeedback)
            .where(eq(emailResponseFeedback.id, id));
        }
      }

      await db
        .delete(userWritingStyles)
        .where(eq(userWritingStyles.userId, user.id));
    }
  };

  return {
    testRouter,
    testUserId: user.id,
    testUser: user,
    createdFollowupIds,
    createdFeedbackIds,
    testThreadId,
    getMockContext: () => ({
      user,
      req: {} as any,
      res: {} as any,
    }),
    getCaller: () => {
      const mockContext: TrpcContext = {
        user,
        req: {} as any,
        res: {} as any,
      };
      return testRouter.createCaller(mockContext);
    },
    cleanup,
  };
}
