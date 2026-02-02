import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("meetingNotes").collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    meetingType: v.string(),
    summary: v.string(),
    date: v.string(),
    ownerId: v.optional(v.id("agents")),
    nextSteps: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("meetingNotes", args);
  },
});
