import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const DEPRECATION_MESSAGE =
  "Legacy waves API is deprecated. Use workflowWaves.ready/workflowWaves.runWave/startAuto for mission+runstep orchestration.";

export const ready = query({
  args: {},
  handler: async () => {
    // Keep function available for backwards compatibility, but return no work.
    return [] as any[];
  },
});

export const claim = mutation({
  args: {
    taskId: v.id("tasks"),
    agentId: v.id("agents"),
  },
  handler: async () => {
    throw new Error(DEPRECATION_MESSAGE);
  },
});

export const unclaim = mutation({
  args: { taskId: v.id("tasks") },
  handler: async () => {
    throw new Error(DEPRECATION_MESSAGE);
  },
});

export const runWave = mutation({
  args: {
    runnerAgentId: v.optional(v.id("agents")),
    limit: v.optional(v.number()),
  },
  handler: async () => {
    throw new Error(DEPRECATION_MESSAGE);
  },
});
