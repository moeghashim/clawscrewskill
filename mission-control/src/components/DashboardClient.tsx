"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const STATUS_ORDER = [
  "Inbox",
  "Assigned",
  "In Progress",
  "Review",
  "Done",
];

const PIPELINE_STAGES = [
  "Prospect",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const CALENDAR_STATUSES = ["Planned", "In Production", "Scheduled", "Published"];

export default function DashboardClient() {
  const agents = useQuery(api.agents.list) ?? [];
  const kpis = useQuery(api.kpis.list) ?? [];
  const tasks = useQuery(api.tasks.listAll) ?? [];
  const approvals = useQuery(api.approvals.listPending) ?? [];
  const support = useQuery(api.support.listAll) ?? [];
  const activities = useQuery(api.activities.listLatest) ?? [];
  const pipeline = useQuery(api.b2b.list) ?? [];
  const calendarItems = useQuery(api.contentCalendar.listAll) ?? [];
  const knowledgeItems = useQuery(api.knowledgeBase.listAll) ?? [];
  const meetingNotes = useQuery(api.meetingNotes.listAll) ?? [];
  const standups = useQuery(api.standup.listLatest, { limit: 3 }) ?? [];
  const alerts = useQuery(api.alerts.listLatest, { limit: 5 }) ?? [];
  const auditLogs = useQuery(api.audit.listLatest, { limit: 5 }) ?? [];

  const createAgent = useMutation(api.agents.create);
  const assignTask = useMutation(api.tasks.assign);

  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [agentStatus, setAgentStatus] = useState<"idle" | "active" | "blocked">("active");
  const [assignmentTaskId, setAssignmentTaskId] = useState<Id<"tasks"> | "">("");
  const [assignmentAgentId, setAssignmentAgentId] = useState<Id<"agents"> | "">("");
  const [assignmentStatus, setAssignmentStatus] = useState("Assigned");

  const tasksByStatus = useMemo(() => {
    return STATUS_ORDER.reduce<Record<string, typeof tasks>>((acc, status) => {
      acc[status] = tasks.filter((task) => task.status === status);
      return acc;
    }, {});
  }, [tasks]);

  const pipelineByStage = useMemo(() => {
    return PIPELINE_STAGES.reduce<Record<string, typeof pipeline>>((acc, stage) => {
      acc[stage] = pipeline.filter((item) => item.stage === stage);
      return acc;
    }, {});
  }, [pipeline]);

  const calendarByStatus = useMemo(() => {
    return CALENDAR_STATUSES.reduce<Record<string, typeof calendarItems>>((acc, status) => {
      acc[status] = calendarItems.filter((item) => item.status === status);
      return acc;
    }, {});
  }, [calendarItems]);

  const handleCreateAgent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
  };

  const handleAssignTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Mission Control — Babanuj Ops</h1>
          <p className="text-sm text-zinc-500">Live dashboard · America/Chicago</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Online
          </span>
          <span className="text-sm text-zinc-500">21:15</span>
        </div>
      </header>

      <div className="grid grid-cols-[260px_1fr_320px] gap-6 px-6 py-6">
        <aside className="space-y-6">
          <div className="min-h-[120px] rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Agents</h2>
            <div className="mt-4 space-y-3">
              {agents.length === 0 ? (
                <p className="text-sm text-zinc-500">No agents yet.</p>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent._id}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-zinc-500">{agent.role}</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">{agent.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Navigation</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {["Tasks", "Content Calendar", "Knowledge Base", "Meeting Notes", "Approvals", "Support", "B2B", "Templates", "Reports"].map((item) => (
                <li key={item} className="rounded-lg px-3 py-2 hover:bg-zinc-100">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <div key={kpi._id} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{kpi.metric}</p>
                <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                {kpi.delta && (
                  <p className="text-sm text-emerald-600">
                    {kpi.delta} {kpi.period ?? ""}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Admin Controls</h2>
              <span className="text-xs text-zinc-400">Add agents & assign tasks</span>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <form onSubmit={handleCreateAgent} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Add Agent</p>
                <div className="mt-3 space-y-3">
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
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white"
                >
                  Create agent
                </button>
              </form>

              <form onSubmit={handleAssignTask} className="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Assign Task</p>
                <div className="mt-3 space-y-3">
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
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                >
                  Assign task
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="min-h-[120px] rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{status}</h3>
                  <span className="text-xs text-zinc-400">{tasksByStatus[status]?.length ?? 0}</span>
                </div>
                <div className="mt-3 space-y-3">
                  {(tasksByStatus[status] ?? []).map((task) => (
                    <div key={task._id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">Channel: {task.channel}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Content Calendar</h2>
              <span className="text-xs text-zinc-400">{calendarItems.length} items</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {CALENDAR_STATUSES.map((status) => (
                <div key={status} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{status}</h3>
                    <span className="text-xs text-zinc-400">{calendarByStatus[status]?.length ?? 0}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(calendarByStatus[status] ?? []).map((item) => (
                      <div key={item._id} className="rounded-lg border border-zinc-100 bg-white px-3 py-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-zinc-500">
                          {item.platform}
                          {item.publishDate ? ` · ${item.publishDate}` : ""}
                        </p>
                        {item.campaign && (
                          <p className="text-xs text-zinc-400">{item.campaign}</p>
                        )}
                      </div>
                    ))}
                    {(calendarByStatus[status] ?? []).length === 0 && (
                      <p className="text-xs text-zinc-400">No items</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Knowledge Base</h2>
              <span className="text-xs text-zinc-400">{knowledgeItems.length} docs</span>
            </div>
            <div className="mt-4 grid gap-3">
              {knowledgeItems.length === 0 ? (
                <p className="text-sm text-zinc-500">No playbooks yet.</p>
              ) : (
                knowledgeItems.map((item) => (
                  <div key={item._id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className="text-xs text-zinc-500">{item.category}</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{item.summary}</p>
                    {item.link && (
                      <p className="mt-2 text-xs text-emerald-700">{item.link}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Meeting Notes</h2>
              <span className="text-xs text-zinc-400">{meetingNotes.length} notes</span>
            </div>
            <div className="mt-4 grid gap-3">
              {meetingNotes.length === 0 ? (
                <p className="text-sm text-zinc-500">No meeting notes yet.</p>
              ) : (
                meetingNotes.map((note) => (
                  <div key={note._id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{note.title}</p>
                      <span className="text-xs text-zinc-500">{note.meetingType}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{note.date}</p>
                    <p className="mt-2 text-xs text-zinc-500">{note.summary}</p>
                    {note.nextSteps && note.nextSteps.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-zinc-500">
                        {note.nextSteps.map((step, index) => (
                          <li key={`${note._id}-step-${index}`}>{step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Standups</h2>
              <span className="text-xs text-zinc-400">{standups.length} entries</span>
            </div>
            <div className="mt-4 space-y-3">
              {standups.length === 0 ? (
                <p className="text-sm text-zinc-500">No standups yet.</p>
              ) : (
                standups.map((entry) => (
                  <div key={entry._id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{entry.date}</p>
                      <span className="text-xs text-zinc-500">{entry.blockers.length} blockers</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{entry.summary}</p>
                    <p className="mt-2 text-xs text-zinc-400">{entry.statusBreakdown}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Alerts</h2>
              <span className="text-xs text-zinc-400">{alerts.length} active</span>
            </div>
            <div className="mt-4 space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-zinc-500">No alerts triggered.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert._id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{alert.type.replace(/_/g, " ")}</p>
                      <span className="text-xs text-zinc-500">{alert.severity}</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{alert.message}</p>
                    <p className="mt-2 text-xs text-zinc-400">{alert.createdAt}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Audit Trail</h2>
              <span className="text-xs text-zinc-400">{auditLogs.length} entries</span>
            </div>
            <div className="mt-4 space-y-3">
              {auditLogs.length === 0 ? (
                <p className="text-sm text-zinc-500">No audit logs yet.</p>
              ) : (
                auditLogs.map((entry) => (
                  <div key={entry._id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{entry.action}</p>
                      <span className="text-xs text-zinc-500">{entry.entityType}</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{entry.rationale}</p>
                    {entry.expectedImpact && (
                      <p className="mt-2 text-xs text-zinc-400">Impact: {entry.expectedImpact}</p>
                    )}
                    {entry.measurementPlan && (
                      <p className="mt-1 text-xs text-zinc-400">Measure: {entry.measurementPlan}</p>
                    )}
                    <p className="mt-2 text-xs text-zinc-400">{entry.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Support Queue</h2>
              <span className="text-xs text-zinc-400">{support.length} tickets</span>
            </div>
            <div className="mt-4 grid gap-3">
              {support.length === 0 ? (
                <p className="text-sm text-zinc-500">No support tickets found.</p>
              ) : (
                support.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{ticket.ticketId}</p>
                      <p className="text-xs text-zinc-500">
                        {ticket.category ?? "General"} · {ticket.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{ticket.priority}</p>
                      {ticket.sla && <p className="text-xs text-amber-600">SLA: {ticket.sla}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">B2B Pipeline</h2>
              <span className="text-xs text-zinc-400">{pipeline.length} accounts</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {PIPELINE_STAGES.map((stage) => (
                <div key={stage} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{stage}</h3>
                    <span className="text-xs text-zinc-400">{pipelineByStage[stage]?.length ?? 0}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(pipelineByStage[stage] ?? []).map((account) => (
                      <div key={account._id} className="rounded-lg border border-zinc-100 bg-white px-3 py-2">
                        <p className="text-sm font-medium">{account.accountName}</p>
                        {account.nextStep && (
                          <p className="text-xs text-zinc-500">Next: {account.nextStep}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        <aside className="space-y-6">
          <div className="min-h-[120px] rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Live Feed</h2>
            <ul className="mt-3 space-y-3 text-sm text-zinc-700">
              {activities.length === 0 ? (
                <li className="text-sm text-zinc-500">No activity yet.</li>
              ) : (
                activities.map((item) => (
                  <li key={item._id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                    {item.message}
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Approvals Queue</h2>
            {approvals.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-500">No pending approvals.</p>
            ) : (
              approvals.map((approval) => (
                <div
                  key={approval._id}
                  className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  {approval.type} — pending
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
