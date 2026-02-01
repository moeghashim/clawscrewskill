import { query } from "./_generated/server";

export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("supportQueue")
      .withIndex("by_status", (q) => q.eq("status", "Open"))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("supportQueue").collect();
  },
});
