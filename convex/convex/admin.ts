import { mutation } from "./_generated/server";
import { v } from "convex/values";

const TABLES_TO_WIPE = [
  "runSteps",
  "runs",
  "workflows",
  "directMessages",
  "messages",
  "documents",
  "notifications",
  "activities",
  "tasks",
  "agents",
] as const;

// DANGEROUS: irreversible data wipe.
// Intended for early-stage schema overhauls where we explicitly don't need existing data.
export const resetAll = mutation({
  args: {
    confirm: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.confirm !== "WIPE_ALL_DATA") {
      throw new Error('Refusing to wipe: pass confirm="WIPE_ALL_DATA"');
    }

    const deleted: Record<string, number> = {};

    for (const table of TABLES_TO_WIPE) {
      let n = 0;
      // Delete in batches to avoid loading too much into memory.
      // Convex doesn't support truncate; this is the safe approach.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const batch = await ctx.db.query(table as any).take(256);
        if (batch.length === 0) break;
        for (const doc of batch) {
          await ctx.db.delete(doc._id);
          n++;
        }
      }
      deleted[table] = n;
    }

    return { ok: true, deleted };
  },
});
