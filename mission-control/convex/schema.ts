import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    sessionKey: v.optional(v.string()),
    focus: v.optional(v.string()),
    workload: v.optional(v.number()),
  }).index("by_status", ["status"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    channel: v.string(),
    priority: v.union(
      v.literal("P0"),
      v.literal("P1"),
      v.literal("P2"),
      v.literal("P3")
    ),
    ownerIds: v.array(v.id("agents")),
    dueDate: v.optional(v.string()),
    brand: v.optional(v.string()),
    kpiTarget: v.optional(v.string()),
    checklist: v.optional(v.array(v.string())),
    definitionOfDone: v.optional(v.string()),
    decisionLog: v.optional(v.array(v.string())),
  })
    .index("by_status", ["status"])
    .index("by_channel", ["channel"])
    .index("by_priority", ["priority"]),

  messages: defineTable({
    taskId: v.id("tasks"),
    fromAgentId: v.id("agents"),
    content: v.string(),
    attachments: v.optional(v.array(v.string())),
  }).index("by_task", ["taskId"]),

  activities: defineTable({
    type: v.string(),
    agentId: v.optional(v.id("agents")),
    message: v.string(),
  }),

  kpis: defineTable({
    channel: v.string(),
    metric: v.string(),
    value: v.string(),
    delta: v.optional(v.string()),
    period: v.optional(v.string()),
  }).index("by_channel", ["channel"]),

  approvals: defineTable({
    type: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    requesterId: v.id("agents"),
    rationale: v.string(),
    impact: v.optional(v.string()),
    link: v.optional(v.string()),
  }).index("by_status", ["status"]),

  supportQueue: defineTable({
    ticketId: v.string(),
    status: v.string(),
    priority: v.string(),
    sla: v.optional(v.string()),
    category: v.optional(v.string()),
  }).index("by_status", ["status"]),

  b2bPipeline: defineTable({
    accountName: v.string(),
    stage: v.string(),
    nextStep: v.optional(v.string()),
    ownerId: v.optional(v.id("agents")),
    health: v.optional(v.string()),
  }).index("by_stage", ["stage"]),

  templates: defineTable({
    title: v.string(),
    type: v.string(),
    content: v.string(),
  }).index("by_type", ["type"]),

  contentCalendar: defineTable({
    title: v.string(),
    platform: v.string(),
    status: v.string(),
    publishDate: v.optional(v.string()),
    ownerId: v.optional(v.id("agents")),
    campaign: v.optional(v.string()),
    hook: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_platform", ["platform"])
    .index("by_publishDate", ["publishDate"]),
});
