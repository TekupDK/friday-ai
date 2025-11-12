/**
 * Tool Execution Router - tRPC subscriptions for real-time tool tracking
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { observable } from "@trpc/server/observable";
import {
  getUserExecutions,
  getToolExecution,
  subscribeToExecutions,
  cancelToolExecution,
  type ToolExecution,
} from "../tool-execution-tracker";

export const toolExecutionRouter = router({
  /**
   * Get all active tool executions for current user
   */
  getActive: protectedProcedure.query(async ({ ctx }) => {
    return getUserExecutions(ctx.user.id);
  }),

  /**
   * Get specific tool execution by ID
   */
  getById: protectedProcedure
    .input(
      z.object({
        executionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return getToolExecution(input.executionId);
    }),

  /**
   * Subscribe to real-time tool execution updates
   * Frontend kan bruge dette til at vise live progress
   */
  subscribe: protectedProcedure.subscription(({ ctx }) => {
    return observable<ToolExecution>(emit => {
      // Subscribe to execution updates
      const unsubscribe = subscribeToExecutions(ctx.user.id, execution => {
        emit.next(execution);
      });

      // Return cleanup function
      return () => {
        unsubscribe();
      };
    });
  }),

  /**
   * Cancel a running tool execution
   */
  cancel: protectedProcedure
    .input(
      z.object({
        executionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const execution = getToolExecution(input.executionId);

      if (!execution) {
        throw new Error("Execution not found");
      }

      if (execution.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      if (execution.status !== "running" && execution.status !== "pending") {
        throw new Error("Cannot cancel completed execution");
      }

      cancelToolExecution(input.executionId);

      return {
        success: true,
        message: "Tool execution cancelled",
      };
    }),
});
