import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import {
  emailPipelineState,
  emailThreads,
  emails,
} from "../../../drizzle/schema";
import { protectedProcedure, router } from "../../_core/trpc";
import { getDb, trackEvent, updatePipelineStage } from "../../db";

export const pipelineRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const pipelineStates = await db
      .select({
        pipelineState: emailPipelineState,
        emailThread: emailThreads,
        email: emails,
      })
      .from(emailPipelineState)
      .leftJoin(
        emailThreads,
        and(
          eq(emailThreads.gmailThreadId, emailPipelineState.threadId),
          eq(emailThreads.userId, ctx.user.id)
        )
      )
      .leftJoin(
        emails,
        and(
          eq(emails.threadId, emailPipelineState.threadId),
          eq(emails.userId, ctx.user.id)
        )
      )
      .where(eq(emailPipelineState.userId, ctx.user.id))
      .execute();

    const stages = [
      "needs_action",
      "venter_pa_svar",
      "i_kalender",
      "finance",
      "afsluttet",
    ] as const;

    const result: Record<
      string,
      Array<{
        id: string;
        threadId: string;
        subject: string;
        from: string;
        snippet: string;
        date: string;
      }>
    > = {};

    stages.forEach(stage => {
      result[stage] = [];
    });

    pipelineStates.forEach(({ pipelineState, emailThread, email }) => {
      if (pipelineState && emailThread) {
        result[pipelineState.stage]?.push({
          id: pipelineState.threadId,
          threadId: pipelineState.threadId,
          subject: emailThread.subject || "(No subject)",
          from: email?.fromEmail || "(Unknown)",
          snippet: emailThread.snippet || "",
          date: emailThread.lastMessageAt || new Date().toISOString(),
        });
      }
    });

    return result;
  }),
  updateStage: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        newStage: z.enum([
          "needs_action",
          "venter_pa_svar",
          "i_kalender",
          "finance",
          "afsluttet",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const state = await updatePipelineStage(
        ctx.user.id,
        input.threadId,
        input.newStage
      );

      await trackEvent({
        userId: ctx.user.id,
        eventType: "pipeline_stage_changed",
        eventData: {
          threadId: input.threadId,
          newStage: input.newStage,
        },
      });

      return state;
    }),
});
