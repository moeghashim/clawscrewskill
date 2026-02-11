import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("missions").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    objective: v.optional(v.string()),
    constraints: v.optional(v.string()),
    toolsAllowed: v.optional(v.array(v.string())),
    soul: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const missionId = await ctx.db.insert("missions", {
      name: args.name,
      objective: args.objective,
      constraints: args.constraints,
      toolsAllowed: args.toolsAllowed,
      soul: args.soul,
      intakeStatus: "needs_intake",
    });

    await ctx.db.insert("activities", {
      type: "mission_create",
      message: `Created mission: ${args.name}`,
    });

    // Kick off orchestrator intake loop (required gate).
    await ctx.runMutation(api.orchestrator.startMissionIntake, { missionId });

    return missionId;
  },
});

export const update = mutation({
  args: {
    id: v.id("missions"),
    name: v.optional(v.string()),
    objective: v.optional(v.string()),
    constraints: v.optional(v.string()),
    toolsAllowed: v.optional(v.array(v.string())),
    soul: v.optional(v.string()),
    intakeStatus: v.optional(v.union(v.literal("needs_intake"), v.literal("complete"))),
    primaryAgentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    const { id, ...patch } = args;

    const changedIntakeFields =
      args.name !== undefined ||
      args.objective !== undefined ||
      args.constraints !== undefined ||
      args.toolsAllowed !== undefined ||
      args.soul !== undefined;

    // If the user changes mission definition fields, require re-intake unless explicitly overridden.
    if (changedIntakeFields && patch.intakeStatus === undefined) {
      (patch as any).intakeStatus = "needs_intake";
    }

    await ctx.db.patch(id, patch);

    await ctx.db.insert("activities", {
      type: "mission_update",
      message: `Updated mission: ${id}`,
    });

    if (changedIntakeFields) {
      await ctx.runMutation(api.orchestrator.startMissionIntake, { missionId: id });
    }

    return true;
  },
});
