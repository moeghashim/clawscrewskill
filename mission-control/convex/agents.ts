import { mutation, query } from "convex/server";
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
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    sessionKey: v.optional(v.string()),
    focus: v.optional(v.string()),
    workload: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", args);
  },
});
