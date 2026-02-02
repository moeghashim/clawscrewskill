"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function AdminAgentDeactivate() {
  const agents = useQuery(api.agents.list) ?? [];
  const deactivate = useMutation(api.agents.deactivate);

  const [agentId, setAgentId] = useState<Id<"agents"> | "">("");
  const [workSummary, setWorkSummary] = useState("");
  const [learning, setLearning] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const activeAgents = agents.filter((agent) => agent.status !== "inactive");

  const handleDeactivate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDone(null);
    if (!agentId || !workSummary.trim()) {
      return;
    }
    await deactivate({
      agentId,
      workSummary: workSummary.trim(),
      learning: learning.trim() || undefined,
    });
    setAgentId("");
    setWorkSummary("");
    setLearning("");
    setDone("Agent deactivated and logged");
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
      <h2 className="text-lg font-semibold">Deactivate Agent</h2>
      <p className="mt-1 text-sm text-zinc-500">Capture work summary and learning before deactivation.</p>
      <form onSubmit={handleDeactivate} className="mt-4 space-y-3">
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={agentId}
          onChange={(event) => setAgentId(event.target.value as Id<"agents"> | "")}
        >
          <option value="">Select agent</option>
          {activeAgents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name}
            </option>
          ))}
        </select>
        <textarea
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Work summary (required)"
          value={workSummary}
          onChange={(event) => setWorkSummary(event.target.value)}
          rows={3}
        />
        <textarea
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Learning (optional)"
          value={learning}
          onChange={(event) => setLearning(event.target.value)}
          rows={3}
        />
        <button type="submit" className="w-full rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white">
          Deactivate agent
        </button>
        {done && <p className="text-sm text-emerald-600">{done}</p>}
      </form>
    </div>
  );
}
