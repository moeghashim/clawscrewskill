import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import cronParser from "cron-parser";

export const runTaskSchedule = internalMutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || !task.schedule || !task.enabled) return;

    await ctx.db.insert("activities", {
      type: "task_run",
      message: `Scheduled run for task: ${task.title}`,
    });

    if (task.schedule.type === "cron" && task.schedule.cron) {
      const interval = cronParser.parseExpression(task.schedule.cron, {
        currentDate: new Date(),
      });
      const next = interval.next().toDate();

      const jobId = await ctx.scheduler.runAt(
        next,
        internal.schedules.runTaskSchedule,
        { taskId: task._id }
      );

      await ctx.db.patch(task._id, {
        schedule: {
          ...task.schedule,
          jobId,
        },
      });
    } else {
      await ctx.db.patch(task._id, { schedule: undefined });
    }
  },
});
