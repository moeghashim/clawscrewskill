import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import cronParser from "cron-parser";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    assigneeIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "inbox",
      assigneeIds: args.assigneeIds ?? [],
      enabled: true,
      schedule: undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done"),
        v.literal("blocked")
      )
    ),
    assigneeIds: v.optional(v.array(v.id("agents"))),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;
    await ctx.db.patch(id, patch);
    return true;
  },
});

export const toggleEnabled = mutation({
  args: {
    id: v.id("tasks"),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    if (!args.enabled && task.schedule?.jobId) {
      await ctx.scheduler.cancel(task.schedule.jobId);
    }

    const schedule = args.enabled ? task.schedule : undefined;

    // If enabling an older task that lacks `enabled`, treat it as enabled from now on.
    // (No-op for existing.)

    await ctx.db.patch(args.id, {
      enabled: args.enabled,
      schedule,
    });

    await ctx.db.insert("activities", {
      type: "task_toggle",
      message: `${args.enabled ? "Enabled" : "Disabled"} task: ${task.title}`,
    });

    return true;
  },
});

export const setSchedule = mutation({
  args: {
    id: v.id("tasks"),
    schedule: v.object({
      type: v.union(v.literal("once"), v.literal("cron")),
      runAt: v.optional(v.number()),
      cron: v.optional(v.string()),
      jobId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;
    if (task.status !== "inbox") {
      throw new Error("Scheduling is only allowed for inbox tasks");
    }
    if (task.enabled === false) {
      throw new Error("Task must be enabled to schedule");
    }

    if (task.schedule?.jobId) {
      await ctx.scheduler.cancel(task.schedule.jobId);
    }

    let jobId: string | undefined;

    if (args.schedule.type === "once") {
      if (!args.schedule.runAt) {
        throw new Error("runAt is required for one-time schedules");
      }
      jobId = await ctx.scheduler.runAt(
        new Date(args.schedule.runAt),
        internal.schedules.runTaskSchedule,
        { taskId: task._id }
      );
    } else {
      if (!args.schedule.cron) {
        throw new Error("cron is required for cron schedules");
      }
      const interval = cronParser.parseExpression(args.schedule.cron, {
        currentDate: new Date(),
      });
      const next = interval.next().toDate();
      jobId = await ctx.scheduler.runAt(next, internal.schedules.runTaskSchedule, {
        taskId: task._id,
      });
    }

    await ctx.db.patch(args.id, {
      schedule: {
        ...args.schedule,
        jobId,
      },
    });

    const scheduleText =
      args.schedule.type === "once"
        ? `one-time @ ${args.schedule.runAt ? new Date(args.schedule.runAt).toLocaleString() : ""}`
        : `cron: ${args.schedule.cron ?? ""}`;

    await ctx.db.insert("activities", {
      type: "task_schedule",
      message: `Scheduled task: ${task.title} (${scheduleText})`,
    });

    return true;
  },
});

export const clearSchedule = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    if (task.schedule?.jobId) {
      await ctx.scheduler.cancel(task.schedule.jobId);
    }

    await ctx.db.patch(args.id, { schedule: undefined });

    await ctx.db.insert("activities", {
      type: "task_schedule_clear",
      message: `Cleared schedule for task: ${task.title}`,
    });

    return true;
  },
});

export const pause = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    if (task.schedule?.jobId) {
      await ctx.scheduler.cancel(task.schedule.jobId);
    }

    await ctx.db.patch(args.id, { enabled: false, schedule: undefined });

    await ctx.db.insert("activities", {
      type: "task_pause",
      message: `Paused task: ${task.title}`,
    });

    return true;
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) return false;

    if (task.schedule?.jobId) {
      await ctx.scheduler.cancel(task.schedule.jobId);
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_task", (q) => q.eq("taskId", args.id))
      .collect();
    for (const m of messages) {
      await ctx.db.delete(m._id);
    }

    const docs = await ctx.db.query("documents").collect();
    for (const d of docs) {
      if (d.taskId === args.id) {
        await ctx.db.delete(d._id);
      }
    }

    await ctx.db.delete(args.id);

    await ctx.db.insert("activities", {
      type: "task_delete",
      message: `Deleted task: ${task.title}`,
    });

    return true;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const byAssignee = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.filter((t) => t.assigneeIds.includes(args.agentId));
  },
});
