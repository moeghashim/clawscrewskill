import { mutation } from "./_generated/server";
import { v } from "convex/values";

const APPROVAL_REQUIRED_TYPES = [
  "budget_change",
  "policy_sensitive",
  "paid_media",
  "pricing_change",
];

export const requestApproval = mutation({
  args: {
    type: v.string(),
    requesterId: v.id("agents"),
    rationale: v.string(),
    impact: v.optional(v.string()),
    link: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const requiresApproval = APPROVAL_REQUIRED_TYPES.includes(args.type);
    if (!requiresApproval) {
      return { status: "auto_approved" as const };
    }

    const approvalId = await ctx.db.insert("approvals", {
      type: args.type,
      status: "pending",
      requesterId: args.requesterId,
      rationale: args.rationale,
      impact: args.impact,
      link: args.link,
    });

    await ctx.db.insert("activities", {
      type: "approval_requested",
      agentId: args.requesterId,
      message: `Approval requested for ${args.type}`,
    });

    return { status: "pending" as const, approvalId };
  },
});

export const enforceTaskUpdate = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.string(),
    requesterId: v.id("agents"),
    decisionNote: v.optional(v.string()),
    requiresApproval: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.requiresApproval) {
      const approvalId = await ctx.db.insert("approvals", {
        type: "task_status_change",
        status: "pending",
        requesterId: args.requesterId,
        rationale: args.decisionNote ?? "Status change requires approval",
      });

      await ctx.db.insert("activities", {
        type: "approval_requested",
        agentId: args.requesterId,
        message: `Approval required for task ${args.taskId}`,
      });

      return { status: "pending" as const, approvalId };
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const decisionLog = [...(task.decisionLog ?? [])];
    if (args.decisionNote) {
      decisionLog.push(args.decisionNote);
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      decisionLog,
    });

    await ctx.db.insert("activities", {
      type: "task_status_updated",
      agentId: args.requesterId,
      message: `Task ${task.title} moved to ${args.status}`,
    });

    return { status: "updated" as const };
  },
});
