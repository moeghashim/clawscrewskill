import { query } from "./_generated/server";

export const smoke = query({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").take(5);
    const agents = await ctx.db.query("agents").take(5);
    return {
      ok: true,
      sample: {
        tasks: tasks.length,
        agents: agents.length,
      },
    };
  },
});
