import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import YAML from "yaml";

type Role = "planner" | "dev" | "verifier" | "tester" | "reviewer";

function ensureString(x: any, msg: string): string {
  if (typeof x !== "string" || !x.trim()) throw new Error(msg);
  return x;
}

function ensureNumber(x: any, msg: string): number {
  if (typeof x !== "number" || Number.isNaN(x)) throw new Error(msg);
  return x;
}

function parseWorkflowYaml(yamlText: string): {
  key: string;
  name: string;
  version: number;
  steps: Array<{ id: string; role: Role; retryLimit: number; gateJsonSchema?: string }>;
} {
  const doc = YAML.parse(yamlText);
  const key = ensureString(doc?.id, "workflow YAML missing id");
  const name = ensureString(doc?.name, "workflow YAML missing name");
  const version = ensureNumber(doc?.version, "workflow YAML missing version");

  const stepsRaw = doc?.steps;
  if (!Array.isArray(stepsRaw) || stepsRaw.length === 0) throw new Error("workflow YAML missing steps");

  const allowed: Role[] = ["planner", "dev", "verifier", "tester", "reviewer"];

  const steps = stepsRaw.map((s: any, idx: number) => {
    const id = ensureString(s?.id, `step[${idx}] missing id`);
    const role = ensureString(s?.role, `step[${idx}] missing role`) as Role;
    if (!allowed.includes(role)) throw new Error(`step[${idx}] role not allowed: ${role}`);
    const retryLimit = typeof s?.retryLimit === "number" ? s.retryLimit : 1;

    // MVP: store "requires" list as a JSON string (schema placeholder)
    const requires = s?.gate?.requires;
    const gateJsonSchema = Array.isArray(requires) ? JSON.stringify({ requires }) : undefined;

    return { id, role, retryLimit, gateJsonSchema };
  });

  return { key, name, version, steps };
}

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db.query("runs").order("desc").take(limit);
  },
});

export const get = query({
  args: { id: v.id("runs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const start = mutation({
  args: {
    missionId: v.id("missions"),
    workflowKey: v.string(),
    title: v.string(),
    createdByAgentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    if (!mission) throw new Error("Mission not found");
    if (mission.intakeStatus !== "complete") {
      throw new Error("Mission intake must be completed before starting runs");
    }

    const wf = await ctx.db
      .query("workflows")
      .withIndex("by_key", (q) => q.eq("key", args.workflowKey))
      .first();
    if (!wf || !wf.enabled) throw new Error("Workflow not found or disabled");

    const parsed = parseWorkflowYaml(wf.yaml);

    // Ensure role agents exist (deterministic sessionKeys)
    const roleSessionKey = (role: Role) => `role:${role}`;
    const roleName = (role: Role) =>
      ({ planner: "Planner", dev: "Developer", verifier: "Verifier", tester: "Tester", reviewer: "Reviewer" })[role];

    const roleAgentIds: Record<Role, any> = {
      planner: null,
      dev: null,
      verifier: null,
      tester: null,
      reviewer: null,
    };

    for (const role of Object.keys(roleAgentIds) as Role[]) {
      const existing = await ctx.db
        .query("agents")
        .withIndex("by_sessionKey", (q) => q.eq("sessionKey", roleSessionKey(role)))
        .first();

      if (existing) {
        roleAgentIds[role] = existing._id;
      } else {
        roleAgentIds[role] = await ctx.db.insert("agents", {
          name: roleName(role),
          role,
          status: "idle",
          sessionKey: roleSessionKey(role),
          currentTaskId: undefined,
        });
      }
    }

    const runId = await ctx.db.insert("runs", {
      missionId: args.missionId,
      workflowKey: args.workflowKey,
      title: args.title,
      status: "running",
      currentStepIndex: 0,
      createdByAgentId: args.createdByAgentId,
      startedAt: Date.now(),
      finishedAt: undefined,
    });

    // Create runSteps
    const stepIds: string[] = [];
    for (let i = 0; i < parsed.steps.length; i++) {
      const s = parsed.steps[i];
      const id = await ctx.db.insert("runSteps", {
        runId,
        index: i,
        stepKey: s.id,
        role: s.role,
        status: i === 0 ? "running" : "pending",
        retriesUsed: 0,
        retryLimit: s.retryLimit,
        gateJsonSchema: s.gateJsonSchema,
        taskId: undefined,
        assignedAgentId: roleAgentIds[s.role],
        lastMessageId: undefined,
        lastGateResultJson: undefined,
      });
      stepIds.push(id);
    }

    // Create first task for step 0
    const first = parsed.steps[0];
    const taskId = await ctx.db.insert("tasks", {
      missionId: args.missionId,
      title: `${args.title} / ${first.id}`,
      description: `Workflow: ${parsed.key} (v${parsed.version})`,
      status: "in_progress",
      assigneeIds: [roleAgentIds[first.role]],
      enabled: true,
      schedule: undefined,
      waitingForTaskId: undefined,
      dependsOnTaskIds: [],
      claimedByAgentId: undefined,
      claimedAt: undefined,
    });

    // Patch first runStep with taskId
    await ctx.db.patch(stepIds[0] as any, {
      taskId,
    });

    await ctx.db.insert("activities", {
      type: "run_start",
      message: `Run started: ${args.title} (${args.workflowKey})`,
      agentId: args.createdByAgentId,
    });

    return { runId, taskId };
  },
});

// Backward-compatible minimal create
export const create = mutation({
  args: {
    missionId: v.id("missions"),
    workflowKey: v.string(),
    title: v.string(),
    createdByAgentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("runs", {
      missionId: args.missionId,
      workflowKey: args.workflowKey,
      title: args.title,
      status: "running",
      currentStepIndex: 0,
      createdByAgentId: args.createdByAgentId,
      startedAt: Date.now(),
      finishedAt: undefined,
    });
  },
});
