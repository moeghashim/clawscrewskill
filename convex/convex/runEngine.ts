import { mutation } from "./_generated/server";
import { v } from "convex/values";

function extractJsonObject(text: string): any {
  // naive but effective: grab last {...} block
  const start = text.lastIndexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in message");
  }
  const slice = text.slice(start, end + 1);
  return JSON.parse(slice);
}

function validateGate(result: any, gateJsonSchema?: string) {
  if (!result || typeof result !== "object") throw new Error("Gate result must be an object");
  const status = result.status;
  if (status !== "PASS" && status !== "FAIL") {
    throw new Error('Gate result.status must be "PASS" or "FAIL"');
  }
  if (gateJsonSchema) {
    try {
      const schema = JSON.parse(gateJsonSchema);
      const requires: string[] = schema?.requires || [];
      for (const k of requires) {
        if (!(k in result)) throw new Error(`Gate result missing required field: ${k}`);
      }
    } catch (e) {
      // ignore invalid schema
    }
  }
}

async function ensureHumanAgent(ctx: any) {
  const sessionKey = "human";
  const existing = await ctx.db
    .query("agents")
    .withIndex("by_sessionKey", (q: any) => q.eq("sessionKey", sessionKey))
    .first();
  if (existing) return existing._id;
  return await ctx.db.insert("agents", {
    name: "Human",
    role: "human",
    status: "active",
    sessionKey,
    currentTaskId: undefined,
  });
}

export const submitStepResult = mutation({
  args: {
    runStepId: v.id("runSteps"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const step = await ctx.db.get(args.runStepId);
    if (!step) throw new Error("runStep not found");

    const run = await ctx.db.get(step.runId);
    if (!run) throw new Error("run not found");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("message not found");

    const result = extractJsonObject(message.content);
    validateGate(result, step.gateJsonSchema);

    await ctx.db.patch(step._id, {
      lastMessageId: args.messageId,
      lastGateResultJson: JSON.stringify(result),
    });

    if (result.status === "PASS") {
      await ctx.db.patch(step._id, { status: "passed" });
      if (step.taskId) {
        await ctx.db.patch(step.taskId as any, { status: "done" });
      }

      const nextIndex = step.index + 1;
      const steps = await ctx.db
        .query("runSteps")
        .withIndex("by_run", (q) => q.eq("runId", run._id))
        .collect();
      const next = steps.find((s) => s.index === nextIndex) || null;

      if (!next) {
        // last step
        await ctx.db.patch(run._id, {
          status: "done",
          currentStepIndex: nextIndex,
          finishedAt: Date.now(),
        });

        await ctx.db.insert("activities", {
          type: "run_done",
          message: `Run done: ${run.title} (${run.workflowKey})`,
        });

        return { ok: true, status: "passed", runStatus: "done" };
      }

      // Move next step to running and create a task if it doesn't exist yet.
      let nextTaskId = next.taskId;
      if (!nextTaskId) {
        nextTaskId = await ctx.db.insert("tasks", {
          missionId: run.missionId,
          title: `${run.title} / ${next.stepKey}`, 
          description: `Workflow: ${run.workflowKey}`,
          status: "in_progress",
          assigneeIds: next.assignedAgentId ? [next.assignedAgentId] : [],
          enabled: true,
          schedule: undefined,
          waitingForTaskId: undefined,
          dependsOnTaskIds: [],
          claimedByAgentId: undefined,
          claimedAt: undefined,
        });
        await ctx.db.patch(next._id, { taskId: nextTaskId });
      }

      await ctx.db.patch(next._id, { status: "running" });
      if (nextTaskId) {
        await ctx.db.patch(nextTaskId as any, { status: "in_progress" });
      }
      await ctx.db.patch(run._id, {
        currentStepIndex: Math.max(run.currentStepIndex, nextIndex),
      });

      await ctx.db.insert("activities", {
        type: "step_pass",
        message: `Step passed: ${step.stepKey} (run: ${run.title})`,
      });

      return { ok: true, status: "passed", nextTaskId };
    }

    // FAIL
    const retriesUsed = step.retriesUsed + 1;
    if (retriesUsed <= step.retryLimit) {
      await ctx.db.patch(step._id, {
        status: "running",
        retriesUsed,
      });
      if (step.taskId) {
        await ctx.db.patch(step.taskId as any, { status: "in_progress" });
      }

      await ctx.db.insert("activities", {
        type: "step_retry",
        message: `Retry ${retriesUsed}/${step.retryLimit}: ${step.stepKey} (run: ${run.title})`,
      });

      return { ok: true, status: "retry", retriesUsed };
    }

    // Escalate
    await ctx.db.patch(step._id, { status: "needs_human", retriesUsed });
    await ctx.db.patch(run._id, { status: "needs_human" });
    if (step.taskId) {
      await ctx.db.patch(step.taskId as any, { status: "blocked" });
    }

    const humanId = await ensureHumanAgent(ctx);
    await ctx.db.insert("directMessages", {
      toAgentId: humanId,
      fromAgentId: step.assignedAgentId ?? humanId,
      content: `Run needs human: ${run.title}\nStep: ${step.stepKey}\nReason: ${result.reason ?? "(no reason provided)"}`,
      taskId: step.taskId,
      read: false,
    });

    await ctx.db.insert("activities", {
      type: "step_escalate",
      message: `Escalated to Human: ${step.stepKey} (run: ${run.title})`,
    });

    return { ok: true, status: "needs_human" };
  },
});
