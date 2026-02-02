import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contentCalendar").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    platform: v.string(),
    status: v.string(),
    publishDate: v.optional(v.string()),
    ownerId: v.optional(v.id("agents")),
    campaign: v.optional(v.string()),
    hook: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contentCalendar", args);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("contentCalendar"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});
