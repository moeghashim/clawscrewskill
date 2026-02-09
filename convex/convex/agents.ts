import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsert = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    sessionKey: v.string(),
    status: v.optional(v.union(v.literal("idle"), v.literal("active"), v.literal("blocked"))),

    mission: v.optional(v.string()),
    soul: v.optional(v.string()),
    model: v.optional(v.string()),
    thinking: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    toolsAllowed: v.optional(v.array(v.string())),
    constraints: v.optional(v.string()),
    repoPath: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        role: args.role,
        status: args.status ?? existing.status,
        mission: args.mission ?? existing.mission,
        soul: args.soul ?? existing.soul,
        model: args.model ?? existing.model,
        thinking: args.thinking ?? existing.thinking,
        toolsAllowed: args.toolsAllowed ?? existing.toolsAllowed,
        constraints: args.constraints ?? existing.constraints,
        repoPath: args.repoPath ?? existing.repoPath,
      });
      return existing._id;
    }

    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      sessionKey: args.sessionKey,
      status: args.status ?? "idle",
      currentTaskId: undefined,
      mission: args.mission,
      soul: args.soul,
      model: args.model,
      thinking: args.thinking,
      toolsAllowed: args.toolsAllowed,
      constraints: args.constraints,
      repoPath: args.repoPath,
    });
  },
});

export const setStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      status: args.status,
      currentTaskId: args.currentTaskId,
    });
    return true;
  },
});

export const pause = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return false;

    // Pause agent
    await ctx.db.patch(args.agentId, { status: "blocked" });

    // Pause all related tasks (disable + cancel schedule)
    const tasks = await ctx.db.query("tasks").collect();
    const related = tasks.filter((t) => t.assigneeIds.includes(args.agentId));

    for (const t of related) {
      if (t.schedule?.jobId) {
        await ctx.scheduler.cancel(t.schedule.jobId);
      }
      await ctx.db.patch(t._id, { enabled: false, schedule: undefined });
    }

    await ctx.db.insert("activities", {
      type: "agent_pause",
      message: `Paused agent: ${agent.name} (paused ${related.length} tasks)`,
    });

    return true;
  },
});

export const remove = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return false;

    const tasks = await ctx.db.query("tasks").collect();
    const related = tasks.filter((t) => t.assigneeIds.includes(args.agentId));

    // Delete related tasks + their messages/documents
    for (const t of related) {
      if (t.schedule?.jobId) {
        await ctx.scheduler.cancel(t.schedule.jobId);
      }

      const messages = await ctx.db
        .query("messages")
        .withIndex("by_task", (q) => q.eq("taskId", t._id))
        .collect();
      for (const m of messages) {
        await ctx.db.delete(m._id);
      }

      const docs = await ctx.db.query("documents").collect();
      for (const d of docs) {
        if (d.taskId === t._id) {
          await ctx.db.delete(d._id);
        }
      }

      await ctx.db.delete(t._id);
    }

    await ctx.db.delete(args.agentId);

    await ctx.db.insert("activities", {
      type: "agent_delete",
      message: `Deleted agent: ${agent.name} (deleted ${related.length} tasks)`,
    });

    return true;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});
