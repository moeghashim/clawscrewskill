import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  examples: defineTable({
    name: "string",
    createdAt: "number",
  }),
});
