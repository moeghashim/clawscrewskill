import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    function: v.string(),
    role: v.string(),
    operatingStyle: v.string(),
    deliverables: v.array(v.string()),
    status: v.union(
      v.literal("idle"),
      v.literal("active"),
      v.literal("blocked"),
      v.literal("inactive")
    ),
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

  knowledgeBase: defineTable({
    title: v.string(),
    category: v.string(),
    summary: v.string(),
    ownerId: v.optional(v.id("agents")),
    link: v.optional(v.string()),
  }).index("by_category", ["category"]),

  meetingNotes: defineTable({
    title: v.string(),
    meetingType: v.string(),
    summary: v.string(),
    date: v.string(),
    ownerId: v.optional(v.id("agents")),
    nextSteps: v.optional(v.array(v.string())),
  })
    .index("by_meetingType", ["meetingType"])
    .index("by_date", ["date"]),

  standups: defineTable({
    date: v.string(),
    summary: v.string(),
    statusBreakdown: v.string(),
    blockers: v.array(v.string()),
  }).index("by_date", ["date"]),

  alerts: defineTable({
    type: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    message: v.string(),
    createdAt: v.string(),
  })
    .index("by_type", ["type"])
    .index("by_severity", ["severity"]),

  policies: defineTable({
    key: v.string(),
    description: v.string(),
    requiresApproval: v.boolean(),
  }).index("by_key", ["key"]),

  auditLogs: defineTable({
    action: v.string(),
    entityType: v.string(),
    entityId: v.optional(v.string()),
    actorId: v.optional(v.id("agents")),
    rationale: v.string(),
    expectedImpact: v.optional(v.string()),
    measurementPlan: v.optional(v.string()),
    learning: v.optional(v.string()),
    timestamp: v.string(),
  })
    .index("by_entityType", ["entityType"])
    .index("by_timestamp", ["timestamp"]),
});
