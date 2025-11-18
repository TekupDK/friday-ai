import { z } from "zod";

import { protectedProcedure, router } from "../../_core/trpc";
import {
  bulkDeleteTasks,
  bulkUpdateTaskOrder,
  bulkUpdateTaskPriority,
  bulkUpdateTaskStatus,
  createTask,
  deleteTask,
  getUserTasks,
  updateTask,
  updateTaskOrder,
  updateTaskStatus,
} from "../../db";

export const tasksRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => getUserTasks(ctx.user.id)),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        relatedTo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createTask({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate ? input.dueDate : undefined,
        priority: input.priority,
      });
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["todo", "in_progress", "done", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateTaskStatus(input.taskId, input.status);
      return { success: true };
    }),
  update: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        relatedTo: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { taskId, ...updates } = input;
      const updateData: any = {};

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.dueDate !== undefined) {
        updateData.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
      }
      if (updates.priority !== undefined)
        updateData.priority = updates.priority;
      if (updates.relatedTo !== undefined)
        updateData.relatedTo = updates.relatedTo;

      const updated = await updateTask(taskId, updateData);
      return updated;
    }),
  delete: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteTask(input.taskId);
      return { success: true };
    }),
  bulkDelete: protectedProcedure
    .input(z.object({ taskIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const userTasks = await getUserTasks(ctx.user.id);
      const validIds = input.taskIds.filter(id =>
        userTasks.some(t => t.id === id)
      );
      if (validIds.length === 0) {
        throw new Error("Ingen gyldige tasks valgt");
      }
      const count = await bulkDeleteTasks(validIds);
      return { success: true, deletedCount: count };
    }),
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.number()),
        status: z.enum(["todo", "in_progress", "done", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userTasks = await getUserTasks(ctx.user.id);
      const validIds = input.taskIds.filter(id =>
        userTasks.some(t => t.id === id)
      );
      if (validIds.length === 0) {
        throw new Error("Ingen gyldige tasks valgt");
      }
      const count = await bulkUpdateTaskStatus(validIds, input.status);
      return { success: true, updatedCount: count };
    }),
  bulkUpdatePriority: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.number()),
        priority: z.enum(["low", "medium", "high", "urgent"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userTasks = await getUserTasks(ctx.user.id);
      const validIds = input.taskIds.filter(id =>
        userTasks.some(t => t.id === id)
      );
      if (validIds.length === 0) {
        throw new Error("Ingen gyldige tasks valgt");
      }
      const count = await bulkUpdateTaskPriority(validIds, input.priority);
      return { success: true, updatedCount: count };
    }),
  updateOrder: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        orderIndex: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userTasks = await getUserTasks(ctx.user.id);
      if (!userTasks.some(t => t.id === input.taskId)) {
        throw new Error("Task ikke fundet eller tilhører ikke brugeren");
      }
      await updateTaskOrder(input.taskId, input.orderIndex);
      return { success: true };
    }),
  bulkUpdateOrder: protectedProcedure
    .input(
      z.array(
        z.object({
          taskId: z.number(),
          orderIndex: z.number(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const userTasks = await getUserTasks(ctx.user.id);
      const validUpdates = input.filter(update =>
        userTasks.some(t => t.id === update.taskId)
      );
      if (validUpdates.length === 0) {
        throw new Error("Ingen gyldige tasks fundet");
      }
      await bulkUpdateTaskOrder(validUpdates);
      return { success: true, updatedCount: validUpdates.length };
    }),
});
