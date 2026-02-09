import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(),

    // Mission-agent metadata (used by OpenClaw)
    mission: v.optional(v.string()),
    soul: v.optional(v.string()),
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
    enabled: v.boolean(),
    schedule: v.optional(
      v.object({
        type: v.union(v.literal("once"), v.literal("cron")),
        runAt: v.optional(v.number()),
        cron: v.optional(v.string()),
        jobId: v.optional(v.string()),
      })
    ),
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
      v.literal("other")
    ),
    taskId: v.optional(v.id("tasks")),
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
});
