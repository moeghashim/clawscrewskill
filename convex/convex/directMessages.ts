import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const send = mutation({
  args: {
    toAgentId: v.id("agents"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("directMessages", {
      toAgentId: args.toAgentId,
      fromAgentId: args.fromAgentId,
      content: args.content,
      taskId: args.taskId,
      read: false,
    });

    await ctx.db.insert("activities", {
      type: "dm_send",
      message: `DM sent to agent ${args.toAgentId}`,
    });

    return id;
  },
});

export const thread = query({
  args: {
    agentId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!args.agentId) return [];
    const limit = args.limit ?? 50;
    const all = await ctx.db.query("directMessages").order("desc").take(200);
    return all
      .filter((m) => m.toAgentId === args.agentId || m.fromAgentId === args.agentId)
      .slice(0, limit)
      .reverse();
  },
});

export const unreadCounts = query({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("directMessages")
      .filter((f) => f.eq(f.field("read"), false))
      .collect();

    const counts: Record<string, number> = {};
    for (const m of unread) {
      const k = m.toAgentId;
      counts[k] = (counts[k] ?? 0) + 1;
    }
    return counts;
  },
});

export const markReadForAgent = mutation({
  args: {
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const msgs = await ctx.db
      .query("directMessages")
      .withIndex("by_to", (q) => q.eq("toAgentId", args.agentId))
      .collect();

    const unread = msgs.filter((m) => !m.read);
    for (const m of unread) {
      await ctx.db.patch(m._id, { read: true });
    }

    return unread.length;
  },
});
