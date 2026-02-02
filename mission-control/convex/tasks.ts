import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    channel: v.string(),
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    ownerIds: v.array(v.id("agents")),
    dueDate: v.optional(v.string()),
    brand: v.optional(v.string()),
    kpiTarget: v.optional(v.string()),
    checklist: v.optional(v.array(v.string())),
    definitionOfDone: v.optional(v.string()),
    decisionLog: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", args);
  },
});

export const assign = mutation({
  args: {
    taskId: v.id("tasks"),
    ownerIds: v.array(v.id("agents")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { taskId, ownerIds, status }) => {
    const task = await ctx.db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    await ctx.db.patch(taskId, {
      ownerIds,
      status: status ?? task.status,
    });

    await ctx.db.insert("activities", {
      type: "task_assigned",
      message: `Task ${task.title} assigned`,
    });

    return { ok: true };
  },
});
