import { query } from "./_generated/server";

export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("approvals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});
