import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assigneeIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "inbox",
      assigneeIds: args.assigneeIds ?? [],
      enabled: true,
      schedule: undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done"),
        v.literal("blocked")
      )
    ),
    assigneeIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
    return true;
  },
});

export const toggleEnabled = mutation({
  args: {
    id: v.id("tasks"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    const schedule = args.enabled ? task.schedule : undefined;

    await ctx.db.patch(args.id, {
      enabled: args.enabled,
      schedule,
    });

    return true;
  },
});

export const setSchedule = mutation({
  args: {
    id: v.id("tasks"),
    schedule: v.object({
      type: v.union(v.literal("once"), v.literal("cron")),
      runAt: v.optional(v.number()),
      cron: v.optional(v.string()),
      jobId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;
    if (task.status !== "inbox") {
      throw new Error("Scheduling is only allowed for inbox tasks");
    }
    if (!task.enabled) {
      throw new Error("Task must be enabled to schedule");
    }
    await ctx.db.patch(args.id, { schedule: args.schedule });
    return true;
  },
});

export const clearSchedule = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;
    await ctx.db.patch(args.id, { schedule: undefined });
    return true;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const byAssignee = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.filter((t) => t.assigneeIds.includes(args.agentId));
  },
});
