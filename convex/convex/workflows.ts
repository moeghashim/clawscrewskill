import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    key: v.string(),
    name: v.string(),
    yaml: v.string(),
    enabled: v.boolean(),
    version: v.number(),
    seed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workflows")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        yaml: args.yaml,
        enabled: args.enabled,
        version: args.version,
        seed: args.seed ?? existing.seed,
      });
      return existing._id;
    }

    return await ctx.db.insert("workflows", {
      key: args.key,
      name: args.name,
      yaml: args.yaml,
      enabled: args.enabled,
      version: args.version,
      seed: args.seed,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workflows").order("desc").collect();
  },
});

export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
  },
});
