import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  missions: defineTable({
    name: v.string(),
    // The mission represents a long-lived team/department with a single primary agent.
    primaryAgentId: v.optional(v.id("agents")),

    objective: v.optional(v.string()),
    constraints: v.optional(v.string()),
    toolsAllowed: v.optional(v.array(v.string())),
    soul: v.optional(v.string()),

    intakeStatus: v.union(v.literal("needs_intake"), v.literal("complete")),

    seed: v.optional(v.boolean()),
  }).index("by_intakeStatus", ["intakeStatus"]),

  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(),

    // Agents can optionally be attached to a mission (primary agent). Runner/system agents are global.
    missionId: v.optional(v.id("missions")),

    // Optional operational hints
    model: v.optional(v.string()),
    thinking: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),

    // Optional operational controls
    toolsAllowed: v.optional(v.array(v.string())),
    constraints: v.optional(v.string()),
    repoPath: v.optional(v.string()),

    seed: v.optional(v.boolean()),
  }).index("by_sessionKey", ["sessionKey"]),

  tasks: defineTable({
    missionId: v.id("missions"),

    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    assigneeIds: v.array(v.id("agents")),
    enabled: v.optional(v.boolean()),
    schedule: v.optional(
      v.object({
        type: v.union(v.literal("once"), v.literal("cron")),
        runAt: v.optional(v.number()),
        cron: v.optional(v.string()),
        jobId: v.optional(v.string()),
      })
    ),

    // Dependencies
    dependsOnTaskIds: v.optional(v.array(v.id("tasks"))),
    waitingForTaskId: v.optional(v.id("tasks")),

    // Claiming / wave execution
    claimedByAgentId: v.optional(v.id("agents")),
    claimedAt: v.optional(v.number()),

    seed: v.optional(v.boolean()),
  }).index("by_status", ["status"]),

  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.array(v.id("documents")),
    seed: v.optional(v.boolean()),
  }).index("by_task", ["taskId"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    type: v.union(
      v.literal("deliverable"),
      v.literal("research"),
      v.literal("protocol"),
      v.literal("system_memory"),
      v.literal("mission_memory"),
      v.literal("intake"),
      v.literal("other")
    ),
    taskId: v.optional(v.id("tasks")),
    missionId: v.optional(v.id("missions")),
    seed: v.optional(v.boolean()),
  }),

  activities: defineTable({
    type: v.string(),
    agentId: v.optional(v.id("agents")),
    message: v.string(),
    seed: v.optional(v.boolean()),
  }),

  notifications: defineTable({
    mentionedAgentId: v.id("agents"),
    content: v.string(),
    delivered: v.boolean(),
    seed: v.optional(v.boolean()),
  }).index("by_agent_delivered", ["mentionedAgentId", "delivered"]),

  directMessages: defineTable({
    toAgentId: v.id("agents"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    taskId: v.optional(v.id("tasks")),
    read: v.boolean(),
    seed: v.optional(v.boolean()),
  })
    .index("by_to_read", ["toAgentId", "read"])
    .index("by_to", ["toAgentId"]),

  workflows: defineTable({
    key: v.string(),
    name: v.string(),
    yaml: v.string(),
    enabled: v.boolean(),
    version: v.number(),
    seed: v.optional(v.boolean()),
  }).index("by_key", ["key"]),

  runs: defineTable({
    missionId: v.id("missions"),
    workflowKey: v.string(),
    title: v.string(),
    status: v.union(v.literal("running"), v.literal("needs_human"), v.literal("done"), v.literal("canceled")),
    currentStepIndex: v.number(),
    createdByAgentId: v.optional(v.id("agents")),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
    seed: v.optional(v.boolean()),
  }).index("by_status", ["status"]),

  runSteps: defineTable({
    runId: v.id("runs"),
    index: v.number(),
    stepKey: v.string(),
    role: v.union(
      v.literal("planner"),
      v.literal("dev"),
      v.literal("verifier"),
      v.literal("tester"),
      v.literal("reviewer")
    ),
    status: v.union(v.literal("pending"), v.literal("running"), v.literal("passed"), v.literal("failed"), v.literal("needs_human")),
    retriesUsed: v.number(),
    retryLimit: v.number(),
    gateJsonSchema: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    assignedAgentId: v.optional(v.id("agents")),
    lastMessageId: v.optional(v.id("messages")),
    lastGateResultJson: v.optional(v.string()),

    // Connector execution lock (for external worker idempotency)
    executionWorker: v.optional(v.string()),
    executionLockUntil: v.optional(v.number()),
    executionAttempts: v.optional(v.number()),

    seed: v.optional(v.boolean()),
  }).index("by_run", ["runId"]),
});
