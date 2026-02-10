import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Linear workflow readiness:
// A step is ready if:
// - run.status === "running"
// - step.status === "pending"
// - step.index === run.currentStepIndex
// - all previous steps are "passed"

export const ready = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const runs = await ctx.db.query("runs").collect();
    const runningRuns = runs.filter((r) => r.status === "running");

    const steps = await ctx.db.query("runSteps").collect();

    const byRun = new Map<string, any[]>();
    for (const s of steps) {
      const arr = byRun.get(s.runId) ?? [];
      arr.push(s);
      byRun.set(s.runId, arr);
    }
    for (const arr of byRun.values()) arr.sort((a, b) => a.index - b.index);

    const readySteps: any[] = [];
    for (const run of runningRuns) {
      const arr = byRun.get(run._id) ?? [];
      const step = arr.find((s) => s.index === run.currentStepIndex) ?? null;
      if (!step) continue;
      if (step.status !== "pending") continue;

      const prev = arr.filter((s) => s.index < step.index);
      if (prev.some((s) => s.status !== "passed")) continue;

      readySteps.push({ run, step });
      if (readySteps.length >= limit) break;
    }

    return readySteps;
  },
});

export const runWave = mutation({
  args: {
    runnerAgentId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;

    const runs = await ctx.db.query("runs").collect();
    const runningRuns = runs.filter((r) => r.status === "running");

    const steps = await ctx.db.query("runSteps").collect();
    const byRun = new Map<string, any[]>();
    for (const s of steps) {
      const arr = byRun.get(s.runId) ?? [];
      arr.push(s);
      byRun.set(s.runId, arr);
    }
    for (const arr of byRun.values()) arr.sort((a, b) => a.index - b.index);

    let started = 0;

    for (const run of runningRuns) {
      if (started >= limit) break;

      const mission = await ctx.db.get(run.missionId as any);
      if (!mission) continue;
      if (mission.intakeStatus !== "complete") continue;
      const arr = byRun.get(run._id) ?? [];
      const step = arr.find((s) => s.index === run.currentStepIndex) ?? null;
      if (!step) continue;
      if (step.status !== "pending") continue;

      const prev = arr.filter((s) => s.index < step.index);
      if (prev.some((s) => s.status !== "passed")) continue;

      // ensure task exists
      let taskId = step.taskId;
      if (!taskId) {
        taskId = await ctx.db.insert("tasks", {
          missionId: run.missionId,
          title: `${run.title} / ${step.stepKey}`, 
          description: `Workflow: ${run.workflowKey}`,
          status: "inbox",
          assigneeIds: step.assignedAgentId ? [step.assignedAgentId] : [],
          enabled: true,
          schedule: undefined,
          waitingForTaskId: undefined,
          dependsOnTaskIds: [],
          claimedByAgentId: undefined,
          claimedAt: undefined,
        });
        await ctx.db.patch(step._id, { taskId });
      }

      await ctx.db.patch(step._id, { status: "running" });

      await ctx.db.insert("activities", {
        type: "workflow_wave_start",
        agentId: args.runnerAgentId,
        message: `Wave started step: ${step.stepKey} (run: ${run.title})`,
      });

      started++;
    }

    return { started };
  },
});
