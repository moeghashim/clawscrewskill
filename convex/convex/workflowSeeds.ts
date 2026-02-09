import { mutation } from "./_generated/server";

const FEATURE_DEV_YAML = `id: feature-dev
name: Feature Dev
version: 1
linear: true
roles:
  planner:
    name: Planner
  dev:
    name: Developer
  verifier:
    name: Verifier
  tester:
    name: Tester
  reviewer:
    name: Reviewer
steps:
  - id: plan
    role: planner
    retryLimit: 1
    gate:
      type: json
      requires: [status, summary]
  - id: implement
    role: dev
    retryLimit: 1
    gate:
      type: json
      requires: [status, summary]
  - id: verify
    role: verifier
    retryLimit: 2
    gate:
      type: json
      requires: [status, summary]
  - id: test
    role: tester
    retryLimit: 2
    gate:
      type: json
      requires: [status, summary]
  - id: review
    role: reviewer
    retryLimit: 1
    gate:
      type: json
      requires: [status, summary]
`;

export const seedWorkflows = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("workflows")
      .withIndex("by_key", (q) => q.eq("key", "feature-dev"))
      .first();

    if (existing) return { ok: true, skipped: true };

    await ctx.db.insert("workflows", {
      key: "feature-dev",
      name: "Feature Dev",
      yaml: FEATURE_DEV_YAML,
      enabled: true,
      version: 1,
      seed: true,
    });

    return { ok: true, skipped: false };
  },
});
