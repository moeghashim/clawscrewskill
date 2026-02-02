import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("knowledgeBase").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    summary: v.string(),
    ownerId: v.optional(v.id("agents")),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledgeBase", args);
  },
});
