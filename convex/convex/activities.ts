import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    type: v.string(),
    agentId: v.optional(v.id("agents")),
    message: v.string(),
    seed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      type: args.type,
      agentId: args.agentId,
      message: args.message,
      seed: args.seed,
    });
  },
});
