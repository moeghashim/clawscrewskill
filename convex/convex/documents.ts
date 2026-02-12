import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("system_memory"),
      v.literal("mission_memory"),
      v.literal("intake"),
      v.literal("other")
    ),
    taskId: v.optional(v.id("tasks")),
    missionId: v.optional(v.id("missions")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      type: args.type,
      taskId: args.taskId,
      missionId: args.missionId,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("documents").order("desc").collect();
  },
});

export const appendMissionMemory = mutation({
  args: {
    missionId: v.id("missions"),
    content: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("documents").collect();
    const existing = docs.find((d: any) => d.type === "mission_memory" && d.missionId === args.missionId);

    const entry = args.content.trim();
    if (!entry) return { ok: true, skipped: true };

    if (existing) {
      const next = `${existing.content || ""}\n${existing.content ? "\n" : ""}${entry}`;
      await ctx.db.patch(existing._id, { content: next });
      return { ok: true, docId: existing._id, created: false };
    }

    const id = await ctx.db.insert("documents", {
      title: args.title || "Mission Memory",
      content: entry,
      type: "mission_memory",
      missionId: args.missionId,
      taskId: undefined,
    });
    return { ok: true, docId: id, created: true };
  },
});
