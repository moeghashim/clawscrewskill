import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
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

async function runWaveCore(ctx: any, args: { runnerAgentId?: string; limit?: number }) {
  const limit = args.limit ?? 5;

  const runs = await ctx.db.query("runs").collect();
  const runningRuns = runs.filter((r: any) => r.status === "running");

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

    // idempotent-ish: only move pending -> running
    const latest = await ctx.db.get(step._id);
    if (!latest || latest.status !== "pending") continue;

    await ctx.db.patch(step._id, { status: "running" });

    await ctx.db.insert("activities", {
      type: "workflow_wave_start",
      agentId: args.runnerAgentId as any,
      message: `Wave started step: ${step.stepKey} (run: ${run.title})`,
    });

    started++;
  }

  return { started };
}

export const runWave = mutation({
  args: {
    runnerAgentId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await runWaveCore(ctx, args as any);
  },
});

export const autoTick = internalMutation({
  args: {
    intervalMs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const intervalMs = Math.max(5000, args.intervalMs ?? 15000); // rate-limit floor
    const result = await runWaveCore(ctx, { limit: args.limit ?? 5 });

    await ctx.db.insert("activities", {
      type: "workflow_wave_tick",
      message: `Auto tick ran (started=${result.started})`,
    });

    await ctx.scheduler.runAfter(intervalMs, internal.workflowWaves.autoTick, {
      intervalMs,
      limit: args.limit ?? 5,
    });

    return { ok: true, ...result, intervalMs };
  },
});

export const startAuto = mutation({
  args: {
    intervalMs: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const intervalMs = Math.max(5000, args.intervalMs ?? 15000);

    // Lightweight idempotency guard: don't start multiple loops repeatedly in a short window.
    const recent = await ctx.db.query("activities").order("desc").take(25);
    const now = Date.now();
    const recentlyStarted = recent.find(
      (a: any) => a.type === "workflow_wave_auto_start" && now - a._creationTime < 60_000
    );
    if (recentlyStarted) {
      return { ok: true, alreadyRunning: true, intervalMs };
    }

    const jobId = await ctx.scheduler.runAfter(0, internal.workflowWaves.autoTick, {
      intervalMs,
      limit: args.limit ?? 5,
    });

    await ctx.db.insert("activities", {
      type: "workflow_wave_auto_start",
      message: `Started auto wave loop (intervalMs=${intervalMs})`,
    });

    return { ok: true, jobId, intervalMs };
  },
});
