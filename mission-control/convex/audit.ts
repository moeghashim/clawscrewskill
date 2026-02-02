import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listLatest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("auditLogs")
      .order("desc")
      .take(limit ?? 20);
  },
});

export const record = mutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    actorId: v.optional(v.id("agents")),
    rationale: v.string(),
    expectedImpact: v.optional(v.string()),
    measurementPlan: v.optional(v.string()),
    learning: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const entry = {
      ...args,
      timestamp: new Date().toISOString(),
    };

    await ctx.db.insert("auditLogs", entry);
    await ctx.db.insert("activities", {
      type: "audit_logged",
      agentId: args.actorId,
      message: `Audit log recorded for ${args.entityType}`,
    });

    return entry;
  },
});
