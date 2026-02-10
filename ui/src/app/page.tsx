"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import { PauseIcon, PlayIcon, TrashIcon, BoltIcon } from "@heroicons/react/24/solid";
import { useHumanAgent } from "@/lib/humanAgent";

const columns = [
  { key: "inbox", label: "01 / Inbox" },
  { key: "assigned", label: "02 / Assigned" },
  { key: "in_progress", label: "03 / Active" },
  { key: "review", label: "04 / Review" },
  { key: "done", label: "05 / Done" },
];

export default function Home() {
  const missions = (useQuery(api.missions.list) || []) as any[];
  const tasks = (useQuery(api.tasks.list) || []) as any[];
  const agents = (useQuery(api.agents.list) || []) as any[];
  const { human: humanAgent, ensureHuman } = useHumanAgent();
  const createMission = useMutation(api.missions.create);
  const updateMission = useMutation(api.missions.update);
  const createTask = useMutation(api.tasks.create);
  const toggleEnabled = useMutation(api.tasks.toggleEnabled);
  const pauseTask = useMutation(api.tasks.pause);
  const deleteTask = useMutation(api.tasks.remove);
  const setSchedule = useMutation(api.tasks.setSchedule);
  const clearSchedule = useMutation(api.tasks.clearSchedule);
  const upsertAgent = useMutation(api.agents.upsert);
  const pauseAgent = useMutation(api.agents.pause);
  const deleteAgent = useMutation(api.agents.remove);

  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [dmDraft, setDmDraft] = useState("");

  const unreadCounts = (useQuery(api.directMessages.unreadCounts) || {}) as Record<string, number>;
  const dmThread = (useQuery(api.directMessages.thread, {
    agentId: (selectedAgentId ?? undefined) as any,
    limit: 50,
  }) || []) as any[];
  const humanThread = (useQuery(api.directMessages.thread, {
    agentId: (humanAgent?._id ?? undefined) as any,
    limit: 20,
  }) || []) as any[];
  const markReadForAgent = useMutation(api.directMessages.markReadForAgent);
  const sendDm = useMutation(api.directMessages.send);
  const runWave = useMutation(api.workflowWaves.runWave);
  const runs = (useQuery(api.runs.list, { limit: 20 }) || []) as any[];
  const visibleRuns = selectedMissionId ? runs.filter((r) => r.missionId === selectedMissionId) : runs;
  const startRun = useMutation(api.runs.start);

  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const runSteps = (useQuery(api.runSteps.byRun, { runId: (selectedRunId ?? undefined) as any }) || []) as any[];
  const [selectedRunStepId, setSelectedRunStepId] = useState<string | null>(null);
  const selectedRunStep = runSteps.find((s) => s._id === selectedRunStepId) || null;
  const stepMessages = (useQuery(api.messages.byTask, {
    taskId: (selectedRunStep?.taskId ?? undefined) as any,
  }) || []) as any[];
  const submitStepResult = useMutation(api.runEngine.submitStepResult);
  const createMessage = useMutation(api.messages.create);
  const [gateJsonDraft, setGateJsonDraft] = useState("{");

  const [missionName, setMissionName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [missionObjective, setMissionObjective] = useState("");
  const [soul, setSoul] = useState("");
  const [agentModel, setAgentModel] = useState("");
  const [toolsAllowed, setToolsAllowed] = useState("");
  const [constraints, setConstraints] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [missionCron, setMissionCron] = useState("");
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
    if (!missionName || !agentName || !soul) return;

    const missionId = await createMission({
      name: missionName,
      objective: missionObjective || undefined,
      constraints: constraints || undefined,
      toolsAllowed: toolsAllowed
        ? toolsAllowed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      soul,
    } as any);

    const sessionKey = `agent:${slug(agentName)}:${Date.now()}`;
    const agentId = await upsertAgent({
      name: agentName,
      role: "agent",
      sessionKey,
      status: "idle",
      missionId,
      model: agentModel || undefined,
      thinking: "low",
      toolsAllowed: toolsAllowed
        ? toolsAllowed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      constraints: constraints || undefined,
      repoPath: repoPath || undefined,
    } as any);

    await updateMission({ id: missionId as any, primaryAgentId: agentId as any } as any);

    setSelectedMissionId(missionId);
    setSelectedAgentId(agentId);

    setMissionName("");
    setMissionObjective("");
    setAgentName("");
    setSoul("");
    setAgentModel("");
    setToolsAllowed("");
    setConstraints("");
    setRepoPath("");
    setMissionCron("");
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
        await setSchedule({
          id: scheduleTaskId as any,
          schedule: { type: "cron", cron },
        });
      }

      setScheduleTaskId(null);
      setRunAt("");
      setCron("");
    } catch (err: any) {
      setCronError(err?.message || "Schedule failed");
    }
  };

  const onCreateWithErrorHandling = async (e: React.FormEvent) => {
    try {
      await onCreate(e);
    } catch (err: any) {
      setCronError(err?.message || "Create mission failed");
    }
  };

  const onToggle = async (task: any, enabled: boolean) => {
    await toggleEnabled({ id: task._id, enabled });
  };

  const onClearSchedule = async (task: any) => {
    await clearSchedule({ id: task._id });
  };

  const visibleTasks = tasks
    .filter((t) => (selectedMissionId ? t.missionId === selectedMissionId : true))
    .filter((t) => (selectedAgentId ? t.assigneeIds?.includes(selectedAgentId) : true));

  const inboxTasks = visibleTasks.filter((t) => t.status === "inbox");
  const assignedTasks = visibleTasks.filter((t) => t.status === "assigned");
  const activeTasks = visibleTasks.filter((t) => t.status === "in_progress");
  const reviewTasks = visibleTasks.filter((t) => t.status === "review");
  const doneTasks = visibleTasks.filter((t) => t.status === "done");

  const columnsData = {
    inbox: inboxTasks,
    assigned: assignedTasks,
    in_progress: activeTasks,
    review: reviewTasks,
    done: doneTasks,
  } as Record<string, any[]>;

  const agentsById = new Map<string, any>(agents.map((a) => [a._id, a]));

  const onPauseTask = async (task: any) => {
    await pauseTask({ id: task._id });
  };

  const onDeleteTask = async (task: any) => {
    if (!confirm(`Delete task "${task.title}"?`)) return;
    await deleteTask({ id: task._id });
  };

  const onPauseAgent = async (agentId: string) => {
    if (!confirm(`Pause this agent and all its tasks?`)) return;
    await pauseAgent({ agentId: agentId as any });
  };

  const onDeleteAgent = async (agentId: string) => {
    const agent = agentsById.get(agentId);
    if (!confirm(`Delete agent "${agent?.name ?? agentId}" and ALL related tasks?`)) return;
    await deleteAgent({ agentId: agentId as any });
    if (selectedAgentId === agentId) setSelectedAgentId(null);
  };

  const ensureSystemAgentId = async () => {
    return await upsertAgent({
      name: "System",
      role: "system",
      sessionKey: "system",
      status: "active",
    } as any);
  };

  const onSendDm = async () => {
    if (!selectedAgentId) return;
    const content = dmDraft.trim();
    if (!content) return;

    const fromAgentId = await ensureSystemAgentId();
    await sendDm({
      toAgentId: selectedAgentId as any,
      fromAgentId,
      content,
    } as any);
    setDmDraft("");
    await markReadForAgent({ agentId: selectedAgentId as any });
  };

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
        <aside className="w-52 border-r border-[var(--grid)] flex flex-col bg-[var(--paper)] min-h-0">
          <div className="p-5 space-y-8 flex-1 overflow-y-auto min-h-0">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40 mb-4">Missions</p>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      setSelectedMissionId(null);
                      setSelectedAgentId(null);
                    }}
                    className={`w-full text-left flex items-center justify-between text-[12px] ${
                      selectedMissionId === null ? "font-medium text-[var(--forest)]" : "text-[#3A3A38]/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-[var(--forest)] rounded-full"></span>
                      All Missions
                    </span>
                    <span className="font-mono text-[9px] opacity-40">[{missions.length}]</span>
                  </button>
                </li>
                {missions.map((m) => (
                  <li key={m._id}>
                    <button
                      onClick={() => {
                        setSelectedMissionId(m._id);
                        setSelectedAgentId(m.primaryAgentId ?? null);
                      }}
                      className={`w-full text-left flex items-center justify-between text-[12px] ${
                        selectedMissionId === m._id ? "font-medium text-[var(--forest)]" : "text-[#3A3A38]/60"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${m.intakeStatus === "complete" ? "bg-[var(--forest)]" : "bg-[var(--gold)]"}`}></span>
                        {m.name}
                      </span>
                      <span className="font-mono text-[9px] opacity-40">[{tasks.filter((t) => t.missionId === m._id).length}]</span>
                    </button>
                  </li>
                ))}
              </ul>

              {selectedMissionId && (
                <div className="mt-3 space-y-2">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#3A3A38]/40">Primary agent</div>
                  <div className="border border-[#3A3A38]/10 bg-white px-2 py-2">
                    <div className="text-[12px] text-[#3A3A38]">
                      {agentsById.get(selectedAgentId ?? "")?.name ?? "(none)"}
                    </div>
                    <div className="font-mono text-[9px] text-[#3A3A38]/40 mt-1">
                      Intake: {missions.find((x) => x._id === selectedMissionId)?.intakeStatus}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40">Runs</p>
                <button
                  onClick={async () => {
                    const title = prompt("Run title (feature request):");
                    if (!title) return;
                    if (!selectedMissionId) {
                      alert("Select a mission first.");
                      return;
                    }
                    const systemId = await ensureSystemAgentId();
                    const res = await startRun({ missionId: selectedMissionId as any, workflowKey: "feature-dev", title, createdByAgentId: systemId } as any);
                    setSelectedRunId(res.runId);
                  }}
                  className="border border-[#3A3A38]/20 hover:border-[#3A3A38]/50 px-2 py-1 font-mono text-[9px] uppercase tracking-wider"
                >
                  +
                </button>
              </div>
              <div className="space-y-2">
                {visibleRuns.length === 0 && (
                  <div className="font-mono text-[9px] uppercase tracking-widest text-[#3A3A38]/40">No runs</div>
                )}
                {visibleRuns.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => {
                      setSelectedRunId(r._id);
                      setSelectedRunStepId(null);
                    }}
                    className={`w-full text-left border bg-white px-2 py-2 ${
                      selectedRunId === r._id ? "border-[#3A3A38]/40" : "border-[#3A3A38]/10 hover:border-[#3A3A38]/30"
                    } ${r.status === "needs_human" ? "bg-[var(--coral)]/5" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-medium text-[#1A3C2B] truncate">{r.title}</div>
                      <div
                        className={`font-mono text-[9px] uppercase tracking-widest ${
                          r.status === "needs_human" ? "text-[var(--coral)]" : "text-[#3A3A38]/40"
                        }`}
                      >
                        {r.status}
                      </div>
                    </div>
                    <div className="font-mono text-[9px] text-[#3A3A38]/40 mt-1">{r.workflowKey}</div>
                  </button>
                ))}
              </div>

              {selectedRunId && (
                <div className="mt-3 border border-[#3A3A38]/10 bg-white">
                  <div className="p-2 border-b border-[#3A3A38]/10 font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40">
                    Run Steps
                  </div>
                  <div className="p-2 space-y-2">
                    {runSteps.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => {
                          setSelectedRunStepId(s._id);
                          setGateJsonDraft(s.lastGateResultJson || "{");
                        }}
                        className={`w-full text-left flex items-center justify-between text-[10px] border px-2 py-1 ${
                          selectedRunStepId === s._id ? "border-[#3A3A38]/40" : "border-[#3A3A38]/10 hover:border-[#3A3A38]/20"
                        }`}
                      >
                        <div className="font-mono uppercase tracking-widest text-[#3A3A38]/60">
                          {String(s.index + 1).padStart(2, "0")} / {s.stepKey}
                        </div>
                        <div className="font-mono uppercase tracking-widest text-[#3A3A38]/40">{s.status}</div>
                      </button>
                    ))}
                  </div>

                  {selectedRunStep && (
                    <div className="border-t border-[#3A3A38]/10">
                      <div className="p-2 border-b border-[#3A3A38]/10 font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40">
                        Step Detail
                      </div>
                      <div className="p-2 space-y-2">
                        <div className="font-mono text-[9px] uppercase tracking-widest text-[#3A3A38]/50">
                          Role: {selectedRunStep.role} • Status: {selectedRunStep.status}
                        </div>

                        <textarea
                          className="w-full border border-[#3A3A38]/20 px-2 py-2 text-[10px] font-mono min-h-[120px]"
                          value={gateJsonDraft}
                          onChange={(e) => setGateJsonDraft(e.target.value)}
                          placeholder='{"status":"PASS","summary":"..."}'
                        />
                        <button
                          onClick={async () => {
                            if (!selectedRunStep.taskId) return;
                            const fromAgentId = await ensureSystemAgentId();
                            const msgId = await createMessage({
                              taskId: selectedRunStep.taskId,
                              fromAgentId,
                              content: gateJsonDraft,
                              attachments: [],
                            } as any);
                            await submitStepResult({ runStepId: selectedRunStep._id, messageId: msgId } as any);
                          }}
                          className="w-full border border-[#3A3A38]/20 hover:border-[#3A3A38]/50 px-2 py-2 font-mono text-[10px] uppercase tracking-wider"
                        >
                          Submit Gate Result
                        </button>

                        <div className="border border-[#3A3A38]/10">
                          <div className="p-2 border-b border-[#3A3A38]/10 font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40">
                            Messages
                          </div>
                          <div className="max-h-40 overflow-y-auto p-2 space-y-2">
                            {stepMessages.length === 0 ? (
                              <div className="font-mono text-[9px] uppercase tracking-widest text-[#3A3A38]/40">
                                No messages
                              </div>
                            ) : (
                              stepMessages.slice(-10).map((m) => (
                                <div key={m._id} className="text-[10px]">
                                  <div className="font-mono text-[9px] text-[#3A3A38]/40">{m._creationTime}</div>
                                  <div className="text-[#3A3A38] whitespace-pre-wrap">{m.content}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/40">
                    Human Inbox
                  </p>
                  <button
                    onClick={async () => {
                      const humanId = await ensureHuman();
                      await markReadForAgent({ agentId: humanId as any });
                    }}
                    className="border border-[#3A3A38]/20 hover:border-[#3A3A38]/50 px-2 py-1 font-mono text-[9px] uppercase tracking-wider"
                    title="Mark Human inbox read"
                  >
                    Mark read
                  </button>
                </div>

                {!humanAgent ? (
                  <button
                    onClick={async () => {
                      await ensureHuman();
                    }}
                    className="w-full border border-[#3A3A38]/20 hover:border-[#3A3A38]/50 px-2 py-2 font-mono text-[9px] uppercase tracking-wider"
                  >
                    Create Human agent
                  </button>
                ) : (
                  <div className="border border-[#3A3A38]/10 bg-white">
                    <div className="p-2 border-b border-[#3A3A38]/10 flex items-center justify-between">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-[#3A3A38]/50">
                        Unread: <span className="text-[#3A3A38]">{unreadCounts[humanAgent._id] ?? 0}</span>
                      </div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-[#3A3A38]/40">
                        {humanAgent.name}
                      </div>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-2 space-y-2">
                      {humanThread.length === 0 ? (
                        <div className="font-mono text-[9px] uppercase tracking-widest text-[#3A3A38]/40">
                          No messages
                        </div>
                      ) : (
                        humanThread.map((m) => (
                          <div key={m._id} className="text-[10px]">
                            <div className="font-mono text-[9px] text-[#3A3A38]/40">
                              {agentsById.get(m.fromAgentId)?.name ?? m.fromAgentId.slice(0, 8)}
                              {m.read ? "" : " (unread)"}
                            </div>
                            <div className="text-[#3A3A38] whitespace-pre-wrap">{m.content}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-5 border-t border-[#3A3A38]/20 font-mono text-[8px] text-[#3A3A38]/40 uppercase tracking-widest">
            Ver: 2.44.09 // stable
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-[var(--paper)]/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--grid)] bg-[var(--paper)] flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/50">
                Agents: <span className="text-[#3A3A38]">{agents.length}</span>
              </div>
              <div className="h-3 w-[1px] bg-[#3A3A38]/20"></div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/50">
                Running tasks:{" "}
                <span className="text-[#3A3A38]">{tasks.filter((t) => t.enabled !== false && !(t.dependsOnTaskIds?.length) && !t.waitingForTaskId).length}</span>
              </div>
            </div>

            <button
              onClick={async () => {
                const systemId = await ensureSystemAgentId();
                await runWave({ runnerAgentId: systemId, limit: 5 } as any);
              }}
              className="flex items-center gap-2 border border-[#3A3A38]/20 hover:border-[#3A3A38]/50 px-3 py-1.5"
              title="Run next workflow wave (start ready steps)"
            >
              <BoltIcon className="w-4 h-4 text-[#3A3A38]/70" />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3A3A38]/70">Run Wave</span>
            </button>
          </div>

          <div className="flex-1 grid grid-cols-5 overflow-hidden">
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
                      {!(col.key === "inbox" || col.key === "assigned" || col.key === "done") && (
                        <span
                          className={`priority-badge font-mono uppercase ${
                            t.enabled === false
                              ? "bg-[#3A3A38]/10 text-[#3A3A38]"
                              : t.waitingForTaskId
                                ? "bg-[var(--gold)] text-[var(--forest)]"
                                : "bg-[#9EFFBF] text-[var(--forest)]"
                          }`}
                        >
                          {t.enabled === false ? "Paused" : t.waitingForTaskId ? "Waiting" : "Running"}
                        </span>
                      )}
                    </div>
                    <div className="block">
                      <h3 className="font-header font-bold text-xs leading-tight mb-1">{t.title}</h3>
                      <p className="text-[10px] text-[#3A3A38]/60 mb-3">{t.description}</p>
                    </div>

                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono text-[8px] text-[#3A3A38]/50 uppercase tracking-widest">
                          {t.assigneeIds?.[0]
                            ? `Agent: ${agentsById.get(t.assigneeIds[0])?.name ?? t.assigneeIds[0].slice(0, 8)}`
                            : "Unassigned"}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => ((t.enabled ?? true) ? onPauseTask(t) : onToggle(t, true))}
                            className="px-2 py-1 border border-[#3A3A38]/20 hover:border-[#3A3A38]/50"
                            title={(t.enabled ?? true) ? "Pause task" : "Resume task"}
                          >
                            {t.enabled === false ? (
                              <PlayIcon className="w-4 h-4 text-[#3A3A38]/70" />
                            ) : (
                              <PauseIcon className="w-4 h-4 text-[#3A3A38]/70" />
                            )}
                          </button>
                          <button
                            onClick={() => onDeleteTask(t)}
                            className="px-2 py-1 border border-[#3A3A38]/20 hover:border-[#3A3A38]/50"
                            title="Delete task"
                          >
                            <TrashIcon className="w-4 h-4 text-[#3A3A38]/70" />
                          </button>
                        </div>
                      </div>

                      {col.key === "inbox" && (
                        <div className="flex items-center gap-2">
                          <button
                            disabled={t.enabled === false}
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
                      )}

                      {col.key === "inbox" && t.schedule && (
                        <div className="font-mono text-[8px] text-[#3A3A38]/50 uppercase tracking-widest">
                          {t.schedule.type === "once" && t.schedule.runAt
                            ? `Scheduled ${new Date(t.schedule.runAt).toLocaleString()}`
                            : t.schedule.type === "cron"
                              ? `Cron ${t.schedule.cron}`
                              : "Scheduled"}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {columnsData[col.key]?.length === 0 && (
                  <div className="text-[10px] text-[#3A3A38]/40 font-mono uppercase tracking-widest">No tasks</div>
                )}
              </div>
            </div>
          ))}
          </div>
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
            <form onSubmit={onCreateWithErrorHandling} className="mt-4 space-y-3">
              <input
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Mission name (e.g. SEO Department)"
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                required
              />
              <input
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Primary agent name (e.g. Teddy)"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                required
              />
              <textarea
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm min-h-[80px]"
                placeholder="Objective (what this mission/team is responsible for)"
                value={missionObjective}
                onChange={(e) => setMissionObjective(e.target.value)}
              />
              <textarea
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm min-h-[140px]"
                placeholder="Soul (persona/instructions for OpenClaw)"
                value={soul}
                onChange={(e) => setSoul(e.target.value)}
                required
              />
              <input
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Agent model (optional)"
                value={agentModel}
                onChange={(e) => setAgentModel(e.target.value)}
              />
              <input
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Tools allowed (comma-separated, optional)"
                value={toolsAllowed}
                onChange={(e) => setToolsAllowed(e.target.value)}
              />
              <input
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Repo path (optional, e.g. /Users/moeghashim/projects/clawscrew)"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
              />
              <textarea
                className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm min-h-[90px]"
                placeholder="Constraints / do-not-do (optional)"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
              />
              {/* Mission itself is not schedulable; schedule individual tasks inside the mission. */}
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
