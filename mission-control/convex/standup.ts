import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listLatest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("standups")
      .order("desc")
      .take(limit ?? 5);
  },
});

export const generate = mutation({
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
    const pipeline = await ctx.db.query("b2bPipeline").collect();

    const byStatus = tasks.reduce<Record<string, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1;
      return acc;
    }, {});

    const blockedTasks = tasks.filter((task) => task.status === "Blocked");

    const summaryLines = [
      `Tasks: ${tasks.length} total`,
      `Blocked: ${blockedTasks.length}`,
      `Approvals pending: ${approvals.length}`,
      `Support open: ${supportOpen.length}`,
      `Pipeline accounts: ${pipeline.length}`,
    ];

    const statusBreakdown = Object.entries(byStatus)
      .map(([status, count]) => `${status}: ${count}`)
      .join(" · ");

    const standup = {
      date: new Date().toISOString().slice(0, 10),
      summary: summaryLines.join(" | "),
      statusBreakdown,
      blockers: blockedTasks.map((task) => task.title),
    };

    await ctx.db.insert("standups", standup);
    await ctx.db.insert("activities", {
      type: "standup_generated",
      message: `Daily standup generated: ${standup.summary}`,
    });

    return standup;
  },
});
