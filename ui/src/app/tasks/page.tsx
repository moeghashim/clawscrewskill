"use client";

import SectionTitle from "@/components/SectionTitle";
import SideNav from "@/components/SideNav";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

const columns = [
  "inbox",
  "assigned",
  "in_progress",
  "review",
  "done",
  "blocked",
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

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Tasks" subtitle="Kanban" />

          <form onSubmit={onCreate} className="border border-[var(--grid)] bg-white p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-[var(--grid)] px-4 py-3 text-sm"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="border border-[var(--grid)] px-4 py-3 text-sm"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button className="mt-4 bg-[var(--forest)] text-white px-6 py-3 text-[12px] uppercase tracking-[0.2em] mono">
              Create Task
            </button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[var(--grid)] border border-[var(--grid)]">
            {columns.map((col) => (
              <div key={col} className="bg-[var(--paper)] p-6 min-h-[220px]">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">{col}</div>
                <div className="mt-4 space-y-3">
                  {tasks.filter((t) => t.status === col).map((t) => (
                    <div key={t._id} className="border border-[var(--grid)] bg-white p-3 text-sm">
                      <Link href={`/tasks/${t._id}`} className="block">
                        <div className="uppercase tracking-tight">{t.title}</div>
                        <div className="text-xs opacity-60 mt-1">{t.description}</div>
                      </Link>

                      {col === "inbox" && (
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onToggle(t, !t.enabled)}
                            className={`text-[10px] uppercase tracking-[0.2em] mono px-3 py-1 border ${
                              t.enabled ? "border-[var(--forest)]" : "border-[var(--grid)] opacity-60"
                            }`}
                          >
                            {t.enabled ? "On" : "Off"}
                          </button>
                          <div className="flex items-center gap-2">
                            <button
                              disabled={!t.enabled}
                              onClick={() => openSchedule(t)}
                              className="text-[10px] uppercase tracking-[0.2em] mono px-3 py-1 border border-[var(--grid)] disabled:opacity-40"
                            >
                              Schedule
                            </button>
                            {t.schedule && (
                              <button
                                onClick={() => onClearSchedule(t)}
                                className="text-[10px] uppercase tracking-[0.2em] mono px-3 py-1 border border-[var(--grid)]"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {tasks.filter((t) => t.status === col).length === 0 && (
                    <EmptyState label="No tasks" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {scheduleTaskId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-6">
          <div className="bg-white border border-[var(--grid)] w-full max-w-lg p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">
              Schedule Task
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setScheduleType("once")}
                className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] mono border ${
                  scheduleType === "once" ? "border-[var(--forest)]" : "border-[var(--grid)]"
                }`}
              >
                One-time
              </button>
              <button
                onClick={() => setScheduleType("cron")}
                className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] mono border ${
                  scheduleType === "cron" ? "border-[var(--forest)]" : "border-[var(--grid)]"
                }`}
              >
                Cron
              </button>
            </div>

            <form onSubmit={submitSchedule} className="mt-4 space-y-3">
              {scheduleType === "once" ? (
                <input
                  type="datetime-local"
                  className="w-full border border-[var(--grid)] px-4 py-3 text-sm"
                  value={runAt}
                  onChange={(e) => setRunAt(e.target.value)}
                />
              ) : (
                <input
                  className="w-full border border-[var(--grid)] px-4 py-3 text-sm"
                  placeholder="Cron expression (e.g. 0 9 * * 1)"
                  value={cron}
                  onChange={(e) => setCron(e.target.value)}
                />
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[var(--forest)] text-white px-4 py-2 text-[12px] uppercase tracking-[0.2em] mono"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleTaskId(null)}
                  className="border border-[var(--grid)] px-4 py-2 text-[12px] uppercase tracking-[0.2em] mono"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
