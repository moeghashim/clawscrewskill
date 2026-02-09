"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";

const columns = [
  { key: "inbox", label: "01 / Inbox" },
  { key: "assigned", label: "02 / Assigned" },
  { key: "in_progress", label: "03 / Active" },
  { key: "review", label: "04 / Review" },
  { key: "done", label: "05 / Done" },
];

export default function Home() {
  const tasks = (useQuery(api.tasks.list) || []) as any[];
  const createTask = useMutation(api.tasks.create);
  const toggleEnabled = useMutation(api.tasks.toggleEnabled);
  const setSchedule = useMutation(api.tasks.setSchedule);
  const clearSchedule = useMutation(api.tasks.clearSchedule);
  const upsertAgent = useMutation(api.agents.upsert);

  const [agentName, setAgentName] = useState("");
  const [mission, setMission] = useState("");
  const [soul, setSoul] = useState("");
  const [newMissionOpen, setNewMissionOpen] = useState(false);

  const [scheduleTaskId, setScheduleTaskId] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState<"once" | "cron">("once");
  const [runAt, setRunAt] = useState("");
  const [cron, setCron] = useState("");
  const [cronError, setCronError] = useState<string | null>(null);

  const slug = (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName || !mission || !soul) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const sessionKey = `agent:${slug(agentName)}:${Date.now()}`;

    const agentId = await upsertAgent({
      name: agentName,
      role: "agent",
      sessionKey,
      status: "idle",
      mission,
      soul,
      timezone,
      thinking: "low",
    } as any);

    await createTask({
      title: mission,
      description: `Agent: ${agentName}`,
      assigneeIds: [agentId],
    } as any);

    setAgentName("");
    setMission("");
    setSoul("");
    setNewMissionOpen(false);
  };

  const openSchedule = (task: any) => {
    setScheduleTaskId(task._id);
    const existing = task.schedule;
    if (existing?.type === "cron") {
      setScheduleType("cron");
      setCron(existing.cron || "");
      setRunAt("");
    } else {
      setScheduleType("once");
      setRunAt(existing?.runAt ? new Date(existing.runAt).toISOString().slice(0, 16) : "");
      setCron("");
    }
  };

  const submitSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTaskId) return;
    setCronError(null);

    try {
      if (scheduleType === "once") {
        if (!runAt) return;
        const ts = new Date(runAt).getTime();
        await setSchedule({
          id: scheduleTaskId as any,
          schedule: { type: "once", runAt: ts },
        });
      } else {
        if (!cron) return;
        const parts = cron.trim().split(/\s+/);
        if (parts.length < 5) {
          setCronError("Cron must have 5 fields");
          return;
        }
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        await setSchedule({
          id: scheduleTaskId as any,
          schedule: { type: "cron", cron, timezone },
        });
      }

      setScheduleTaskId(null);
      setRunAt("");
      setCron("");
    } catch (err: any) {
      setCronError(err?.message || "Schedule failed");
    }
  };

  const onToggle = async (task: any, enabled: boolean) => {
    await toggleEnabled({ id: task._id, enabled });
  };

  const onClearSchedule = async (task: any) => {
    await clearSchedule({ id: task._id });
  };

  const inboxTasks = tasks.filter((t) => t.status === "inbox");
  const assignedTasks = tasks.filter((t) => t.status === "assigned");
  const activeTasks = tasks.filter((t) => t.status === "in_progress");
  const reviewTasks = tasks.filter((t) => t.status === "review");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const columnsData = {
    inbox: inboxTasks,
    assigned: assignedTasks,
    in_progress: activeTasks,
    review: reviewTasks,
    done: doneTasks,
  } as Record<string, any[]>;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--grid) 1px, transparent 1px), linear-gradient(to bottom, var(--grid) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <header className="relative z-20 h-16 border-b border-[var(--grid)] flex items-center justify-between px-6 bg-[var(--paper)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[var(--forest)] flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <h1 className="font-header text-lg font-bold tracking-tight text-[var(--forest)] uppercase">
            OpsCore // Mission Control
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewMissionOpen(true)}
            className="bg-[var(--forest)] text-white font-mono text-[9px] px-4 py-1.5 uppercase tracking-wider hover:opacity-90"
          >
            New Mission
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative z-10">
        <aside className="w-52 border-r border-[var(--grid)] flex flex-col bg-[var(--paper)]">
          <div className="p-5 space-y-8 flex-1 overflow-y-auto">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40 mb-4">Mission Folders</p>
              <ul className="space-y-3">
                <li>
                  <a className="flex items-center justify-between text-[12px] font-medium text-[var(--forest)]">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[var(--forest)] rounded-full"></span>
                      All Tasks
                    </span>
                    <span className="font-mono text-[9px] opacity-40">[{tasks.length}]</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="p-5 border-t border-[#3A3A38]/20 font-mono text-[8px] text-[#3A3A38]/40 uppercase tracking-widest">
            Ver: 2.44.09 // stable
          </div>
        </aside>

        <section className="flex-1 grid grid-cols-5 bg-[var(--paper)]/50 overflow-hidden">
          {columns.map((col) => (
            <div key={col.key} className="flex flex-col border-r border-[#3A3A38]/10">
              <div className="p-3 border-b border-[var(--grid)] flex items-center justify-between bg-[var(--paper)] sticky top-0 z-10">
                <h2 className="font-header font-bold text-[11px] tracking-tight uppercase">{col.label}</h2>
                <span className="font-mono text-[9px] opacity-40">{columnsData[col.key]?.length || 0}</span>
              </div>
              <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {columnsData[col.key]?.map((t) => (
                  <div key={t._id} className="task-card bg-white border border-[#3A3A38]/10 p-3 border-l-2 border-l-[var(--forest)]">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-mono text-[9px] text-[#3A3A38]/40">{t._id.slice(0, 8)}</span>
                      <span className="priority-badge font-mono bg-[#9EFFBF] text-[var(--forest)] uppercase">Normal</span>
                    </div>
                    <div className="block">
                      <h3 className="font-header font-bold text-xs leading-tight mb-1">{t.title}</h3>
                      <p className="text-[10px] text-[#3A3A38]/60 mb-3">{t.description}</p>
                    </div>

                    {col.key === "inbox" && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => onToggle(t, !t.enabled)}
                            className={`font-mono text-[9px] px-3 py-1.5 border uppercase tracking-wider ${
                              t.enabled ? "border-[var(--forest)]" : "border-[#3A3A38]/20 opacity-60"
                            }`}
                          >
                            {t.enabled ? "On" : "Off"}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={!t.enabled}
                              onClick={() => openSchedule(t)}
                              className="font-mono text-[9px] px-3 py-1.5 border border-[#3A3A38]/20 uppercase tracking-wider disabled:opacity-40"
                            >
                              Schedule
                            </button>
                            {t.schedule && (
                              <button
                                onClick={() => onClearSchedule(t)}
                                className="font-mono text-[9px] px-3 py-1.5 border border-[#3A3A38]/20 uppercase tracking-wider"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                        {t.schedule && (
                          <div className="font-mono text-[8px] text-[#3A3A38]/50 uppercase tracking-widest">
                            {t.schedule.type === "once" && t.schedule.runAt
                              ? `Scheduled ${new Date(t.schedule.runAt).toLocaleString()}`
                              : t.schedule.type === "cron"
                                ? `Cron ${t.schedule.cron} ${t.schedule.timezone ? `(${t.schedule.timezone})` : ""}`
                                : "Scheduled"}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {columnsData[col.key]?.length === 0 && (
                  <div className="text-[10px] text-[#3A3A38]/40 font-mono uppercase tracking-widest">No tasks</div>
                )}
              </div>
            </div>
          ))}
        </section>

      </main>

      <footer className="h-8 border-t border-[var(--grid)] bg-[var(--forest)] flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#9EFFBF] rounded-full"></span>
            <span className="font-mono text-[8px] text-white uppercase tracking-widest">Mainframe Link Active</span>
          </div>
          <div className="h-3 w-[1px] bg-white/20"></div>
          <span className="font-mono text-[8px] text-white/60 uppercase tracking-widest">Secure Protocol: RSA-4096</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[8px] text-white/60 uppercase tracking-widest">Latency: 14ms</span>
          <span className="font-mono text-[8px] text-white uppercase tracking-widest">14:21:44 PST</span>
        </div>
      </footer>

      {newMissionOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="bg-white border border-[var(--grid)] w-full max-w-lg p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-mono">
              New Mission
            </div>
            <form onSubmit={onCreate} className="mt-4 space-y-3">
              <input
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Agent name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
              <input
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Mission"
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                required
              />
              <textarea
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm min-h-[140px]"
                placeholder="Soul (persona/instructions for OpenClaw)"
                value={soul}
                onChange={(e) => setSoul(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[var(--forest)] text-white px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setNewMissionOpen(false)}
                  className="border border-[#3A3A38]/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {scheduleTaskId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6 z-50">
          <div className="bg-white border border-[var(--grid)] w-full max-w-lg p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-mono">
              Schedule Task
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setScheduleType("once")}
                className={`px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-mono border ${
                  scheduleType === "once" ? "border-[var(--forest)]" : "border-[#3A3A38]/20"
                }`}
              >
                One-time
              </button>
              <button
                onClick={() => setScheduleType("cron")}
                className={`px-3 py-1 text-[9px] uppercase tracking-[0.2em] font-mono border ${
                  scheduleType === "cron" ? "border-[var(--forest)]" : "border-[#3A3A38]/20"
                }`}
              >
                Cron
              </button>
            </div>

            <form onSubmit={submitSchedule} className="mt-4 space-y-3">
              {scheduleType === "once" ? (
                <input
                  type="datetime-local"
                  className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                  value={runAt}
                  onChange={(e) => setRunAt(e.target.value)}
                />
              ) : (
                <div className="space-y-2">
                  <input
                    className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                    placeholder="Cron expression (e.g. 0 9 * * 1)"
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                  />
                  {cronError && (
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--coral)] font-mono">
                      {cronError}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[var(--forest)] text-white px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleTaskId(null)}
                  className="border border-[#3A3A38]/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-mono"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
