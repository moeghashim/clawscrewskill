import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listLatest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("alerts")
      .order("desc")
      .take(limit ?? 10);
  },
});

export const evaluate = mutation({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    const approvals = await ctx.db
      .query("approvals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const supportOpen = await ctx.db
      .query("supportQueue")
      .withIndex("by_status", (q) => q.eq("status", "Open"))
      .collect();
    const kpis = await ctx.db.query("kpis").collect();
    const pipeline = await ctx.db.query("b2bPipeline").collect();

    const alerts: Array<{
      type: string;
      severity: "low" | "medium" | "high";
      message: string;
    }> = [];

    const blocked = tasks.filter((task) => task.status === "Blocked");
    if (blocked.length > 0) {
      alerts.push({
        type: "blocked_tasks",
        severity: "high",
        message: `${blocked.length} tasks blocked: ${blocked.map((t) => t.title).join(", ")}`,
      });
    }

    if (approvals.length > 0) {
      alerts.push({
        type: "pending_approvals",
        severity: "medium",
        message: `${approvals.length} approvals pending review`,
      });
    }

    if (supportOpen.length >= 5) {
      alerts.push({
        type: "support_backlog",
        severity: "medium",
        message: `Support backlog is ${supportOpen.length} tickets`,
      });
    }

    const negativeKpis = kpis.filter((kpi) => (kpi.delta ?? "").startsWith("-"));
    if (negativeKpis.length > 0) {
      alerts.push({
        type: "kpi_regression",
        severity: "high",
        message: `KPI regression: ${negativeKpis.map((k) => k.metric).join(", ")}`,
      });
    }

    if (pipeline.length === 0) {
      alerts.push({
        type: "pipeline_empty",
        severity: "low",
        message: "B2B pipeline is empty",
      });
    }

    for (const alert of alerts) {
      await ctx.db.insert("alerts", {
        ...alert,
        createdAt: new Date().toISOString(),
      });
    }

    if (alerts.length > 0) {
      await ctx.db.insert("activities", {
        type: "alerts_generated",
        message: `Alerts generated: ${alerts.length}`,
      });
    }

    return alerts;
  },
});
