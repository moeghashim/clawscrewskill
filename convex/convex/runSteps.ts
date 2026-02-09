import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byRun = query({
  args: {
    runId: v.id("runs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("runSteps")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    runId: v.id("runs"),
    index: v.number(),
    stepKey: v.string(),
    role: v.union(
      v.literal("planner"),
      v.literal("dev"),
      v.literal("verifier"),
      v.literal("tester"),
      v.literal("reviewer")
    ),
    retryLimit: v.number(),
    gateJsonSchema: v.optional(v.string()),
    seed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runSteps", {
      runId: args.runId,
      index: args.index,
      stepKey: args.stepKey,
      role: args.role,
      status: "pending",
      retriesUsed: 0,
      retryLimit: args.retryLimit,
      gateJsonSchema: args.gateJsonSchema,
      taskId: undefined,
      assignedAgentId: undefined,
      lastMessageId: undefined,
      lastGateResultJson: undefined,
      seed: args.seed,
    });
  },
});
