"use client";

import { api } from "@/lib/convex";
import { useMutation, useQuery } from "convex/react";

export function useSystemAgent() {
  const agents = (useQuery(api.agents.list) || []) as any[];
  const upsert = useMutation(api.agents.upsert);

  const system = agents.find((a) => a.name === "System") || null;

  const ensureSystem = async () => {
    if (system) return system._id;
    return await upsert({ name: "System", role: "system", sessionKey: "system", status: "active" });
  };

  return { system, ensureSystem };
}
