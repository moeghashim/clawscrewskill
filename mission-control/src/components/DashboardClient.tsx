"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

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

const statusColor = (status: string) => {
  switch (status) {
    case "Inbox":
      return "bg-zinc-400";
    case "Assigned":
      return "bg-blue-500";
    case "In Progress":
      return "bg-amber-500";
    case "Review":
      return "bg-purple-500";
    case "Done":
      return "bg-emerald-500";
    case "Blocked":
      return "bg-rose-500";
    default:
      return "bg-zinc-300";
  }
};

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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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

  const selectedTask = selectedTaskId ? tasks.find((task) => task._id === selectedTaskId) : null;

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
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600">
            {agents.length} agents · {tasks.length} tasks
          </span>
          <Link
            href="/agents/new"
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
          >
            Add agent
          </Link>
          <Link
            href="/tasks/assign"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Create task
          </Link>
          <span className="text-sm text-zinc-500">21:15</span>
        </div>
      </header>

      <div className="grid grid-cols-[260px_1fr_320px] gap-6 px-6 py-6">
        <aside className="space-y-6 sticky top-6 self-start">
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
                      <p className="text-xs text-zinc-500">{agent.role} · {agent.function}</p>
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

          <div className="grid grid-cols-5 gap-4">
            {STATUS_ORDER.map((status) => (
              <div key={status} className="min-h-[120px] rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{status}</h3>
                  <span className="text-xs text-zinc-400">{tasksByStatus[status]?.length ?? 0}</span>
                </div>
                <div className="mt-3 space-y-3">
                  {(tasksByStatus[status] ?? []).map((task) => {
                    const isActive = task.status === "In Progress" || task.status === "Optimizing";
                    return (
                      <button
                        type="button"
                        key={task._id}
                        onClick={() => setSelectedTaskId(task._id)}
                        className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${statusColor(task.status)}`} />
                            <p className="text-sm font-medium">{task.title}</p>
                          </div>
                          {isActive && (
                            <span className="inline-flex items-center text-xs text-emerald-600">
                              <svg
                                className="mr-1 h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M12 6V3m0 18v-3m6-6h3M3 12h3m11.314-6.314 2.121-2.121M4.565 19.435l2.121-2.121m0-11.314L4.565 4.565m12.728 12.728 2.121 2.121" />
                              </svg>
                              Processing
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                          <span>{task.channel}</span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5">{task.priority}</span>
                        </div>
                      </button>
                    );
                  })}
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
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-400">Task details</p>
                <h2 className="text-lg font-semibold">{selectedTask.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskId(null)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-zinc-700">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${statusColor(selectedTask.status)}`} />
                <span>{selectedTask.status}</span>
                <span className="text-zinc-400">·</span>
                <span>{selectedTask.channel}</span>
                <span className="text-zinc-400">·</span>
                <span>{selectedTask.priority}</span>
              </div>
              {selectedTask.description && <p>{selectedTask.description}</p>}
              {selectedTask.dueDate && <p><span className="font-medium">Due:</span> {selectedTask.dueDate}</p>}
              {selectedTask.brand && <p><span className="font-medium">Brand:</span> {selectedTask.brand}</p>}
              {selectedTask.kpiTarget && <p><span className="font-medium">KPI:</span> {selectedTask.kpiTarget}</p>}
              {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                <div>
                  <p className="font-medium">Checklist</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-zinc-600">
                    {selectedTask.checklist.map((item, index) => (
                      <li key={`${selectedTask._id}-check-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedTask.definitionOfDone && (
                <p><span className="font-medium">Definition of done:</span> {selectedTask.definitionOfDone}</p>
              )}
              {selectedTask.decisionLog && selectedTask.decisionLog.length > 0 && (
                <div>
                  <p className="font-medium">Decision log</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-zinc-600">
                    {selectedTask.decisionLog.map((item, index) => (
                      <li key={`${selectedTask._id}-decision-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
