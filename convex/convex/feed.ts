import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    let q = ctx.db.query("activities");

    if (args.since) {
      q = q.filter((f) => f.gt(f.field("_creationTime"), args.since!));
    }

    return await q.order("desc").take(limit);
  },
});
