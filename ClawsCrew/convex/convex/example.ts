import { query } from "convex/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("examples").collect();
  },
});

export const byName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("examples")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
  },
});
