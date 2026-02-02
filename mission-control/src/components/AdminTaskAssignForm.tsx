"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const STATUS_ORDER = ["Inbox", "Assigned", "In Progress", "Review", "Done"];

export default function AdminTaskAssignForm() {
  const tasks = useQuery(api.tasks.listAll) ?? [];
  const agents = useQuery(api.agents.list) ?? [];
  const assignTask = useMutation(api.tasks.assign);

  const [assignmentTaskId, setAssignmentTaskId] = useState<Id<"tasks"> | "">("");
  const [assignmentAgentId, setAssignmentAgentId] = useState<Id<"agents"> | "">("");
  const [assignmentStatus, setAssignmentStatus] = useState("Assigned");
  const [updated, setUpdated] = useState<string | null>(null);

  const handleAssignTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUpdated(null);
    if (!assignmentTaskId || !assignmentAgentId) {
      return;
    }
    await assignTask({
      taskId: assignmentTaskId,
      ownerIds: [assignmentAgentId],
      status: assignmentStatus,
    });
    setAssignmentTaskId("");
    setAssignmentAgentId("");
    setAssignmentStatus("Assigned");
    setUpdated("Task assigned");
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-lg font-semibold">Assign Task</h1>
      <p className="mt-1 text-sm text-zinc-500">Pick a task, assign an agent, and set the status.</p>
      <form onSubmit={handleAssignTask} className="mt-4 space-y-3">
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={assignmentTaskId}
          onChange={(event) => setAssignmentTaskId(event.target.value as Id<"tasks"> | "")}
        >
          <option value="">Select task</option>
          {tasks.map((task) => (
            <option key={task._id} value={task._id}>
              {task.title}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={assignmentAgentId}
          onChange={(event) => setAssignmentAgentId(event.target.value as Id<"agents"> | "")}
        >
          <option value="">Select agent</option>
          {agents.map((agent) => (
            <option key={agent._id} value={agent._id}>
              {agent.name}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
          value={assignmentStatus}
          onChange={(event) => setAssignmentStatus(event.target.value)}
        >
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button type="submit" className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">
          Assign task
        </button>
        {updated && <p className="text-sm text-emerald-600">{updated}</p>}
      </form>
    </div>
  );
}
