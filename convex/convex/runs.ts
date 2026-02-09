import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db.query("runs").order("desc").take(limit);
  },
});

export const get = query({
  args: { id: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    workflowKey: v.string(),
    title: v.string(),
    createdByAgentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runs", {
      workflowKey: args.workflowKey,
      title: args.title,
      status: "running",
      currentStepIndex: 0,
      createdByAgentId: args.createdByAgentId,
      startedAt: Date.now(),
      finishedAt: undefined,
    });
  },
});
