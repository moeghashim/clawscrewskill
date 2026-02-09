import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function isDone(task: any) {
  return task.status === "done";
}

function depsSatisfied(task: any, byId: Map<string, any>) {
  const deps: string[] = (task.dependsOnTaskIds ?? []) as any;
  if (!deps.length) return true;
  return deps.every((id) => {
    const dep = byId.get(id);
    return dep && isDone(dep);
  });
}

export const ready = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const byId = new Map(tasks.map((t) => [t._id, t]));

    return tasks.filter((t) => {
      if (t.enabled === false) return false;
      if (t.claimedByAgentId) return false;
      if (t.status === "done") return false;
      return depsSatisfied(t, byId);
    });
  },
});

export const claim = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async (ctx, args) => {
    const t = await ctx.db.get(args.taskId);
    if (!t) return false;
    if (t.claimedByAgentId) {
      throw new Error("Task already claimed");
    }
    await ctx.db.patch(args.taskId, {
      claimedByAgentId: args.agentId,
      claimedAt: Date.now(),
      status: t.status === "inbox" ? "assigned" : t.status,
    });

    await ctx.db.insert("activities", {
      type: "task_claim",
      message: `Task claimed: ${t.title}`,
      agentId: args.agentId,
    });

    return true;
  },
});

export const unclaim = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const t = await ctx.db.get(args.taskId);
    if (!t) return false;
    await ctx.db.patch(args.taskId, { claimedByAgentId: undefined, claimedAt: undefined });
    await ctx.db.insert("activities", {
      type: "task_unclaim",
      message: `Task unclaimed: ${t.title}`,
    });
    return true;
  },
});

export const runWave = mutation({
  args: {
    runnerAgentId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const tasks = await ctx.db.query("tasks").collect();
    const byId = new Map(tasks.map((t) => [t._id, t]));

    const ready = tasks
      .filter((t) => {
        if (t.enabled === false) return false;
        if (t.claimedByAgentId) return false;
        if (t.status === "done") return false;
        return depsSatisfied(t, byId);
      })
      .slice(0, limit);

    for (const t of ready) {
      await ctx.db.patch(t._id, {
        claimedByAgentId: args.runnerAgentId,
        claimedAt: Date.now(),
        status: "in_progress",
      });

      await ctx.db.insert("activities", {
        type: "wave_start",
        agentId: args.runnerAgentId,
        message: `Wave started task: ${t.title}`,
      });
    }

    return { started: ready.length };
  },
});
