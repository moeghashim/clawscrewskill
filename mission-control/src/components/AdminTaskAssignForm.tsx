"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const CHANNELS = ["SEO", "Google Ads", "Amazon Ads", "Social", "Support", "B2B"];
const PRIORITIES = ["P0", "P1", "P2", "P3"];

export default function AdminTaskAssignForm() {
  const agents = useQuery(api.agents.list) ?? [];
  const createTask = useMutation(api.tasks.create);

  const [title, setTitle] = useState("");
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [priority, setPriority] = useState<"P0" | "P1" | "P2" | "P3">("P1");
  const [agentId, setAgentId] = useState<Id<"agents"> | "">("");
  const [dueDate, setDueDate] = useState("");
  const [brand, setBrand] = useState("");
  const [kpiTarget, setKpiTarget] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreated(null);
    setFormError(null);

    if (!title.trim() || !agentId) {
      setFormError("Please add a title and assign an agent.");
      return;
    }

    await createTask({
      title: title.trim(),
      status: "Assigned",
      channel,
      priority,
      ownerIds: [agentId],
      dueDate: dueDate || undefined,
      brand: brand || undefined,
      kpiTarget: kpiTarget || undefined,
      description: undefined,
      checklist: undefined,
      definitionOfDone: undefined,
      decisionLog: undefined,
    });

    setTitle("");
    setChannel(CHANNELS[0]);
    setPriority("P1");
    setAgentId("");
    setDueDate("");
    setBrand("");
    setKpiTarget("");
    setCreated("Task created and assigned");
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Create & Assign Task</h1>
      <p className="mt-1 text-sm text-zinc-500">Create a new task and assign it immediately.</p>
      <form onSubmit={handleCreateTask} className="mt-4 space-y-3">
        <input
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
        >
          {CHANNELS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={priority}
          onChange={(event) => setPriority(event.target.value as "P0" | "P1" | "P2" | "P3")}
        >
          {PRIORITIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={agentId}
          onChange={(event) => setAgentId(event.target.value as Id<"agents"> | "")}
        >
          <option value="">Assign to agent</option>
          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Due date (YYYY-MM-DD)"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="Brand / account"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          placeholder="KPI target"
          value={kpiTarget}
          onChange={(event) => setKpiTarget(event.target.value)}
        />
        <button type="submit" className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
          Create & assign task
        </button>
        {formError && <p className="text-sm text-rose-600">{formError}</p>}
        {created && <p className="text-sm text-emerald-600">{created}</p>}
      </form>
    </div>
  );
}
