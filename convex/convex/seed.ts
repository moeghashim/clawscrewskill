import { mutation } from "./_generated/server";

export const seedIfEmpty = mutation({
  args: {},
  handler: async (ctx) => {
    const existingSeededMissions = await ctx.db.query("missions").collect();
    if (existingSeededMissions.some((m) => (m as any).seed)) {
      return { ok: true, skipped: true };
    }

    const missionId = await ctx.db.insert("missions", {
      name: "Demo Mission",
      objective: "Set up and validate ClawsCrew Mission Control.",
      constraints: "Keep it simple.",
      toolsAllowed: [],
      soul: "System seed mission",
      intakeStatus: "complete",
      seed: true,
    });

    const agentId = await ctx.db.insert("agents", {
      name: "System",
      role: "system",
      status: "active",
      sessionKey: "system",
      seed: true,
    });

    const taskId = await ctx.db.insert("tasks", {
      missionId,
      title: "Initialize Mission Control",
      description: "Set up core dashboards and integrations.",
      status: "in_progress",
      assigneeIds: [agentId],
      seed: true,
    });

    await ctx.db.insert("messages", {
      taskId,
      fromAgentId: agentId,
      content: "Seeded comment: Mission Control initialized.",
      attachments: [],
      seed: true,
    });

    await ctx.db.insert("documents", {
      title: "Mission Control Brief",
      content: "Seeded document for layout and data flow.",
      type: "protocol",
      taskId,
      seed: true,
    });

    await ctx.db.insert("activities", {
      type: "seed",
      agentId,
      message: "Seed data created.",
      seed: true,
    });

    return { ok: true, skipped: false };
  },
});

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const missionId = await ctx.db.insert("missions", {
      name: "Demo Mission",
      objective: "Set up and validate ClawsCrew Mission Control.",
      constraints: "Keep it simple.",
      toolsAllowed: [],
      soul: "System seed mission",
      intakeStatus: "complete",
      seed: true,
    });

    const agentId = await ctx.db.insert("agents", {
      name: "System",
      role: "system",
      status: "active",
      sessionKey: "system",
      seed: true,
    });

    const taskId = await ctx.db.insert("tasks", {
      missionId,
      title: "Initialize Mission Control",
      description: "Set up core dashboards and integrations.",
      status: "in_progress",
      assigneeIds: [agentId],
      seed: true,
    });

    await ctx.db.insert("messages", {
      taskId,
      fromAgentId: agentId,
      content: "Seeded comment: Mission Control initialized.",
      attachments: [],
      seed: true,
    });

    await ctx.db.insert("documents", {
      title: "Mission Control Brief",
      content: "Seeded document for layout and data flow.",
      type: "protocol",
      taskId,
      seed: true,
    });

    await ctx.db.insert("activities", {
      type: "seed",
      agentId,
      message: "Seed data created.",
      seed: true,
    });

    return { ok: true };
  },
});

export const clearSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["messages", "documents", "tasks", "activities", "notifications", "agents", "missions"] as const;

    for (const table of tables) {
      const records = await ctx.db.query(table).collect();
      for (const record of records) {
        // @ts-ignore
        if (record.seed) {
          // @ts-ignore
          await ctx.db.delete(record._id);
        }
      }
    }

    return { ok: true };
  },
});
