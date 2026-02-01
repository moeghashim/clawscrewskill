import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db.query("tasks").withIndex("by_status", (q) => q.eq("status", status)).collect();
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
