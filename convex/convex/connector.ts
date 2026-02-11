import { mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

function nowMs() {
  return Date.now();
}

export const claimNext = mutation({
  args: {
    workerId: v.string(),
    lockMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lockMs = Math.max(10_000, args.lockMs ?? 120_000);
    const now = nowMs();

    const steps = await ctx.db.query("runSteps").collect();
    const candidates = steps
      .filter((s) => s.status === "running" && !!s.taskId)
      .filter((s) => !s.executionLockUntil || s.executionLockUntil < now)
      .sort((a, b) => a._creationTime - b._creationTime);

    for (const step of candidates) {
      const run = await ctx.db.get(step.runId);
      if (!run || run.status !== "running") continue;

      const mission = await ctx.db.get(run.missionId as any);
      if (!mission || mission.intakeStatus !== "complete") continue;

      await ctx.db.patch(step._id, {
        executionWorker: args.workerId,
        executionLockUntil: now + lockMs,
        executionAttempts: (step.executionAttempts ?? 0) + 1,
      });

      const task = step.taskId ? await ctx.db.get(step.taskId as any) : null;
      const agent = step.assignedAgentId ? await ctx.db.get(step.assignedAgentId as any) : null;

      return {
        ok: true,
        claim: {
          runId: run._id,
          runTitle: run.title,
          missionId: run.missionId,
          runStepId: step._id,
          stepKey: step.stepKey,
          role: step.role,
          taskId: step.taskId,
          assignedAgentId: step.assignedAgentId,
          assignedAgentSessionKey: agent?.sessionKey,
          taskTitle: task?.title,
          gateJsonSchema: step.gateJsonSchema,
          lockUntil: now + lockMs,
        },
      };
    }

    return { ok: true, claim: null };
  },
});

export const submitResult = mutation({
  args: {
    workerId: v.string(),
    runStepId: v.id("runSteps"),
    content: v.string(),
    fromAgentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.runStepId);
    if (!step) throw new Error("Run step not found");
    if (!step.taskId) throw new Error("Run step has no task");

    if (step.executionWorker && step.executionWorker !== args.workerId) {
      throw new Error("Run step claimed by another worker");
    }

    let fromAgentId = args.fromAgentId;
    if (!fromAgentId) {
      // Fallback to assigned role agent, then system.
      fromAgentId = step.assignedAgentId as any;
      if (!fromAgentId) {
        const system = await ctx.db
          .query("agents")
          .withIndex("by_sessionKey", (q) => q.eq("sessionKey", "system"))
          .first();
        if (!system) throw new Error("No fallback agent available");
        fromAgentId = system._id as any;
      }
    }

    const messageId = await ctx.db.insert("messages", {
      taskId: step.taskId as any,
      fromAgentId: fromAgentId as any,
      content: args.content,
      attachments: [],
    });

    const result = await ctx.runMutation(api.runEngine.submitStepResult, {
      runStepId: step._id,
      messageId,
    } as any);

    await ctx.db.patch(step._id, {
      executionLockUntil: undefined,
      executionWorker: undefined,
    });

    return { ok: true, messageId, result };
  },
});

export const releaseClaim = mutation({
  args: {
    workerId: v.string(),
    runStepId: v.id("runSteps"),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.runStepId);
    if (!step) return { ok: true, skipped: true };

    if (step.executionWorker && step.executionWorker !== args.workerId) {
      return { ok: true, skipped: true };
    }

    await ctx.db.patch(step._id, {
      executionLockUntil: undefined,
      executionWorker: undefined,
    });
    return { ok: true, skipped: false };
  },
});
