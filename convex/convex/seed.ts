import { mutation } from "./_generated/server";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const agentId = await ctx.db.insert("agents", {
      name: "System",
      role: "system",
      status: "active",
      sessionKey: "system",
      seed: true,
    });

    const taskId = await ctx.db.insert("tasks", {
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
    const tables = ["messages", "documents", "tasks", "activities", "notifications", "agents"] as const;

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
