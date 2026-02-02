import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    function: v.string(),
    role: v.string(),
    operatingStyle: v.string(),
    deliverables: v.array(v.string()),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
      v.literal("inactive")
    ),
    sessionKey: v.optional(v.string()),
    focus: v.optional(v.string()),
    workload: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", args);
    await ctx.db.insert("activities", {
      type: "agent_added",
      agentId,
      message: `Agent ${args.name} added`,
    });
    return agentId;
  },
});

export const deactivate = mutation({
  args: {
    agentId: v.id("agents"),
    workSummary: v.string(),
    learning: v.optional(v.string()),
  },
  handler: async (ctx, { agentId, workSummary, learning }) => {
    const agent = await ctx.db.get(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    await ctx.db.patch(agentId, {
      status: "inactive",
    });

    await ctx.db.insert("auditLogs", {
      action: "deactivate",
      entityType: "agent",
      entityId: agentId,
      actorId: agentId,
      rationale: workSummary,
      learning,
      timestamp: new Date().toISOString(),
    });

    await ctx.db.insert("activities", {
      type: "agent_deactivated",
      agentId,
      message: `Agent ${agent.name} deactivated`,
    });

    return { ok: true };
  },
});
