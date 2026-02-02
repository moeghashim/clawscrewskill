"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function AdminAgentForm() {
  const createAgent = useMutation(api.agents.create);
  const agents = useQuery(api.agents.list) ?? [];
  const roleOptions = useMemo(() => {
    const roles = new Set(agents.map((agent) => agent.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [agents]);

  const [agentName, setAgentName] = useState("");
  const [agentFunction, setAgentFunction] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [operatingStyle, setOperatingStyle] = useState("");
  const [deliverablesInput, setDeliverablesInput] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "active" | "blocked">("active");
  const [created, setCreated] = useState<string | null>(null);

  const handleCreateAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreated(null);
    const resolvedRole = agentRole === "custom" ? customRole.trim() : agentRole.trim();
    const deliverables = deliverablesInput
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!agentName.trim() || !agentFunction.trim() || !resolvedRole || !operatingStyle.trim()) {
      return;
    }

    await createAgent({
      name: agentName.trim(),
      function: agentFunction.trim(),
      role: resolvedRole,
      operatingStyle: operatingStyle.trim(),
      deliverables,
      status: agentStatus,
    });
    setAgentName("");
    setAgentFunction("");
    setAgentRole("");
    setCustomRole("");
    setOperatingStyle("");
    setDeliverablesInput("");
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
          placeholder="Function (e.g., SEO, Support, B2B)"
          value={agentFunction}
          onChange={(event) => setAgentFunction(event.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={agentRole}
          onChange={(event) => setAgentRole(event.target.value)}
        >
          <option value="">Select role</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
          <option value="custom">Add new role…</option>
        </select>
        {agentRole === "custom" && (
          <input
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
            placeholder="New role name"
            value={customRole}
            onChange={(event) => setCustomRole(event.target.value)}
          />
        )}
        <textarea
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Operating style"
          value={operatingStyle}
          onChange={(event) => setOperatingStyle(event.target.value)}
        />
        <textarea
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Deliverables (one per line)"
          value={deliverablesInput}
          onChange={(event) => setDeliverablesInput(event.target.value)}
          rows={4}
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
