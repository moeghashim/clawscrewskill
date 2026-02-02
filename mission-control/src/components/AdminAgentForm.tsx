"use client";

import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminAgentForm() {
  const createAgent = useMutation(api.agents.create);
  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "active" | "blocked">("active");
  const [created, setCreated] = useState<string | null>(null);

  const handleCreateAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreated(null);
    if (!agentName.trim() || !agentRole.trim()) {
      return;
    }
    await createAgent({
      name: agentName.trim(),
      role: agentRole.trim(),
      status: agentStatus,
    });
    setAgentName("");
    setAgentRole("");
    setAgentStatus("active");
    setCreated("Agent created");
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Add Agent</h1>
      <p className="mt-1 text-sm text-zinc-500">Create a new operator record for Mission Control.</p>
      <form onSubmit={handleCreateAgent} className="mt-4 space-y-3">
        <input
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Name"
          value={agentName}
          onChange={(event) => setAgentName(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Role"
          value={agentRole}
          onChange={(event) => setAgentRole(event.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={agentStatus}
          onChange={(event) => setAgentStatus(event.target.value as "idle" | "active" | "blocked")}
        >
          <option value="active">active</option>
          <option value="idle">idle</option>
          <option value="blocked">blocked</option>
        </select>
        <button type="submit" className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white">
          Create agent
        </button>
        {created && <p className="text-sm text-emerald-600">{created}</p>}
      </form>
    </div>
  );
}
