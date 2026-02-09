"use client";

import { api } from "@/lib/convex";
import { useMutation, useQuery } from "convex/react";

export function useHumanAgent() {
  const agents = (useQuery(api.agents.list) || []) as any[];
  const upsert = useMutation(api.agents.upsert);

  const human = agents.find((a) => a.sessionKey === "human" || a.name === "Human") || null;

  const ensureHuman = async () => {
    if (human) return human._id;
    return await upsert({
      name: "Human",
      role: "human",
      sessionKey: "human",
      status: "active",
    } as any);
  };

  return { human, ensureHuman };
}
