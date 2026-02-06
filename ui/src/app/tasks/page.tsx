"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import Link from "next/link";

const columns = [
  { key: "inbox", label: "01 / Inbox" },
  { key: "assigned", label: "02 / Assigned" },
  { key: "in_progress", label: "03 / Active" },
  { key: "review", label: "04 / Review" },
  { key: "done", label: "05 / Done" },
];

export default function TasksPage() {
  const tasks = (useQuery(api.tasks.list) || []) as any[];
  const createTask = useMutation(api.tasks.create);
  const toggleEnabled = useMutation(api.tasks.toggleEnabled);
  const setSchedule = useMutation(api.tasks.setSchedule);
  const clearSchedule = useMutation(api.tasks.clearSchedule);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [scheduleTaskId, setScheduleTaskId] = useState<string | null>(null);
  const [scheduleType, setScheduleType] = useState<"once" | "cron">("once");
  const [runAt, setRunAt] = useState("");
  const [cron, setCron] = useState("");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createTask({ title, description });
    setTitle("");
    setDescription("");
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

    if (scheduleType === "once") {
      if (!runAt) return;
      const ts = new Date(runAt).getTime();
      await setSchedule({
        id: scheduleTaskId as any,
        schedule: { type: "once", runAt: ts },
      });
    } else {
      if (!cron) return;
      await setSchedule({
        id: scheduleTaskId as any,
        schedule: { type: "cron", cron },
      });
    }

    setScheduleTaskId(null);
    setRunAt("");
    setCron("");
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
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20"
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
        <nav className="hidden lg:flex items-center gap-6">
          <a className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#3A3A38]/60 flex items-center gap-2">
            <span className="text-[var(--forest)]">01.</span> Dashboard
          </a>
          <a className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#3A3A38]/60 flex items-center gap-2">
            <span className="text-[var(--forest)]">02.</span> Fleet Ops
          </a>
          <a className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--forest)] font-bold flex items-center gap-2">
            <span className="text-[var(--forest)]">03.</span> Mission Log
          </a>
          <a className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#3A3A38]/60 flex items-center gap-2">
            <span className="text-[var(--forest)]">04.</span> Network
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="font-mono text-[9px] px-3 py-1.5 border border-[var(--grid)] hover:border-[#3A3A38]/50 uppercase tracking-wider">
            System: Nominal
          </button>
          <button className="bg-[var(--forest)] text-white font-mono text-[9px] px-4 py-1.5 uppercase tracking-wider hover:opacity-90">
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
            <div className="pt-5 border-t border-[#3A3A38]/10">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40 mb-4">Infrastructure</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-tight">US-EAST-1</span>
                  <span className="w-2 h-2 rounded-full bg-[#9EFFBF] animate-pulse"></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-tight">EU-CENT-1</span>
                  <span className="w-2 h-2 rounded-full bg-[#9EFFBF]"></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-tight">AP-SOUTH-1</span>
                  <span className="w-2 h-2 rounded-full bg-[#F4D35E]"></span>
                </div>
              </div>
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
                    <Link href={`/tasks/${t._id}`} className="block">
                      <h3 className="font-header font-bold text-xs leading-tight mb-1">{t.title}</h3>
                      <p className="text-[10px] text-[#3A3A38]/60 mb-3">{t.description}</p>
                    </Link>

                    {col.key === "inbox" && (
                      <div className="flex items-center justify-between mt-2">
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

        <aside className="w-72 border-l border-[var(--grid)] flex flex-col bg-white">
          <div className="p-4 border-b border-[var(--grid)] bg-[var(--paper)]">
            <h2 className="font-header font-bold text-[11px] tracking-tight uppercase">Live Operations Feed</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-0">
            <div className="p-3 border-b border-[#3A3A38]/10 hover:bg-[var(--paper)]/50 transition-colors">
              <div className="flex gap-2">
                <span className="font-mono text-[9px] text-[#3A3A38]/40">01</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-0.5">
                    <span className="font-mono text-[9px] font-bold text-[var(--forest)]">SYSTEM_UPDATE</span>
                    <span className="font-mono text-[8px] text-[#3A3A38]/40">14:20:11</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-[#3A3A38]">New build deployed to <span className="text-[var(--forest)] font-medium">staging-cluster-04</span>.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white border-t border-[var(--grid)]">
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-[9px] text-[var(--forest)]">$</span>
              <input type="text" placeholder="CMD..." className="w-full bg-[var(--paper)] border border-[#3A3A38]/20 p-1.5 pl-6 font-mono text-[9px] uppercase tracking-wider focus:outline-none focus:border-[var(--forest)]" />
            </div>
          </div>
        </aside>
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
                <input
                  className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                  placeholder="Cron expression (e.g. 0 9 * * 1)"
                  value={cron}
                  onChange={(e) => setCron(e.target.value)}
                />
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
