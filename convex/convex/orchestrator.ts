import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function ensureAgentBySessionKey(ctx: any, sessionKey: string, name: string, role: string) {
  const existing = await ctx.db
    .query("agents")
    .withIndex("by_sessionKey", (q: any) => q.eq("sessionKey", sessionKey))
    .first();
  if (existing) return existing._id;
  return await ctx.db.insert("agents", {
    name,
    role,
    sessionKey,
    status: "active",
    currentTaskId: undefined,
  });
}

async function ensureOrchestratorAgent(ctx: any) {
  return await ensureAgentBySessionKey(ctx, "orchestrator", "Orchestrator", "orchestrator");
}

async function ensureHumanAgent(ctx: any) {
  return await ensureAgentBySessionKey(ctx, "human", "Human", "human");
}

async function ensureSystemMemoryDoc(ctx: any) {
  const docs = await ctx.db.query("documents").collect();
  const existing = docs.find((d: any) => d.type === "system_memory");
  if (existing) return existing._id;
  return await ctx.db.insert("documents", {
    title: "System Memory",
    content: "",
    type: "system_memory",
    taskId: undefined,
    missionId: undefined,
  });
}

async function ensureMissionMemoryDoc(ctx: any, missionId: string, missionName: string) {
  const docs = await ctx.db.query("documents").collect();
  const existing = docs.find((d: any) => d.type === "mission_memory" && d.missionId === missionId);
  if (existing) return existing._id;
  return await ctx.db.insert("documents", {
    title: `Mission Memory: ${missionName}`,
    content: "",
    type: "mission_memory",
    taskId: undefined,
    missionId: missionId as any,
  });
}

async function upsertIntakeDoc(ctx: any, missionId: string, missionName: string, questions: string[]) {
  const docs = await ctx.db.query("documents").collect();
  const existing = docs.find((d: any) => d.type === "intake" && d.missionId === missionId);

  const header = `# Intake: ${missionName}\n\nAnswer the questions below. Once complete, mark intake as complete.\n\n`;
  const body = questions.map((q, i) => `${i + 1}. ${q}\n   - Answer: `).join("\n\n");
  const content = header + body + "\n";

  if (existing) {
    await ctx.db.patch(existing._id, { content });
    return existing._id;
  }

  return await ctx.db.insert("documents", {
    title: `Intake: ${missionName}`,
    content,
    type: "intake",
    taskId: undefined,
    missionId: missionId as any,
  });
}

function buildIntakeQuestions(mission: any) {
  return [
    `What is the primary objective for mission "${mission.name}"? (1–2 sentences)`,
    `What are the hard constraints / do-not-dos?`,
    `Which tools are allowed? (comma-separated)`,
    `What does success look like? (acceptance criteria)`,
    `Any special context OpenClaw needs (repo, URLs, credentials location)?`,
  ];
}

export const startMissionIntake = mutation({
  args: { missionId: v.id("missions") },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    if (!mission) throw new Error("Mission not found");

    const orchId = await ensureOrchestratorAgent(ctx);
    const humanId = await ensureHumanAgent(ctx);

    await ensureSystemMemoryDoc(ctx);
    await ensureMissionMemoryDoc(ctx, mission._id, mission.name);

    const questions = buildIntakeQuestions(mission);
    const intakeDocId = await upsertIntakeDoc(ctx, mission._id, mission.name, questions);

    // Mark mission as needs_intake
    await ctx.db.patch(mission._id, { intakeStatus: "needs_intake" });

    // DM human with intake prompt
    await ctx.db.insert("directMessages", {
      toAgentId: humanId,
      fromAgentId: orchId,
      content: `Mission intake required: ${mission.name}\n\nOpen the Intake doc and answer the questions.\nDoc: ${intakeDocId}`,
      taskId: undefined,
      read: false,
    });

    await ctx.db.insert("activities", {
      type: "mission_intake_start",
      agentId: orchId,
      message: `Started intake for mission: ${mission.name}`,
    });

    return { ok: true, intakeDocId };
  },
});

export const completeMissionIntake = mutation({
  args: {
    missionId: v.id("missions"),
    answersMarkdown: v.string(),
  },
  handler: async (ctx, args) => {
    const mission = await ctx.db.get(args.missionId);
    if (!mission) throw new Error("Mission not found");

    const orchId = await ensureOrchestratorAgent(ctx);

    // Append answers into the intake doc
    const docs = await ctx.db.query("documents").collect();
    const intake = docs.find((d: any) => d.type === "intake" && d.missionId === mission._id);
    if (!intake) throw new Error("Intake doc not found");

    const next = `${intake.content}\n\n---\n\n## Answers (${new Date().toISOString()})\n\n${args.answersMarkdown}\n`;
    await ctx.db.patch(intake._id, { content: next });

    await ctx.db.patch(mission._id, { intakeStatus: "complete" });

    await ctx.db.insert("activities", {
      type: "mission_intake_complete",
      agentId: orchId,
      message: `Completed intake for mission: ${mission.name}`,
    });

    return { ok: true };
  },
});

export const status = query({
  args: {},
  handler: async (ctx) => {
    const orchId = await ensureOrchestratorAgent(ctx);
    const missions = await ctx.db.query("missions").collect();
    return { ok: true, orchestratorAgentId: orchId, missions: missions.length };
  },
});
