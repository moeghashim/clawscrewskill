import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const syncTaskStatusesFromRunSteps = mutation({
  args: {
    runId: v.optional(v.id("runs")),
  },
  handler: async (ctx, args) => {
    const steps = args.runId
      ? await ctx.db.query("runSteps").withIndex("by_run", (q) => q.eq("runId", args.runId as any)).collect()
      : await ctx.db.query("runSteps").collect();

    let patched = 0;
    for (const s of steps) {
      if (!s.taskId) continue;
      let status: "in_progress" | "done" | "blocked" | null = null;
      if (s.status === "passed") status = "done";
      else if (s.status === "running") status = "in_progress";
      else if (s.status === "needs_human" || s.status === "failed") status = "blocked";

      if (!status) continue;

      const task = await ctx.db.get(s.taskId as any);
      if (!task) continue;
      if (task.status !== status) {
        await ctx.db.patch(task._id, { status });
        patched++;
      }
    }

    return { ok: true, patched };
  },
});
