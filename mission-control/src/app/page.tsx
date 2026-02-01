const agents = [
  { name: "Hassoun", role: "Master Orchestrator", status: "Working" },
  { name: "Naseem", role: "SEO Master", status: "Working" },
  { name: "Amina", role: "Support Agent", status: "Working" },
];

const kpis = [
  { label: "SEO Sessions", value: "12.4k", delta: "+6%" },
  { label: "Ad Spend", value: "$4.8k", delta: "+3%" },
  { label: "Support SLA", value: "5h 12m", delta: "-18%" },
];

const tasks = {
  Inbox: [
    { title: "Audit product pages", owner: "Naseem" },
    { title: "Top 5 support issues", owner: "Amina" },
  ],
  Assigned: [
    { title: "SEO technical audit", owner: "Naseem" },
    { title: "Support macros refresh", owner: "Amina" },
  ],
  "In Progress": [
    { title: "Mission Control UI build", owner: "Hassoun" },
  ],
  Review: [
    { title: "Keyword map draft", owner: "Naseem" },
  ],
  Done: [
    { title: "Initial backlog created", owner: "Hassoun" },
  ],
};

const liveFeed = [
  "Naseem posted audit findings for /collections.",
  "Amina updated SLA risk: Delivery delay tickets up.",
  "Hassoun created approval request for Google Ads spend.",
];

export default function Home() {
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
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Agents</h2>
            <div className="mt-4 space-y-3">
              {agents.map((agent) => (
                <div key={agent.name} className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-zinc-500">{agent.role}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600">{agent.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Navigation</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {["Tasks", "Approvals", "Templates", "Reports", "Settings"].map((item) => (
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
              <div key={kpi.label} className="rounded-2xl border border-zinc-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-semibold">{kpi.value}</p>
                <p className="text-sm text-emerald-600">{kpi.delta} WoW</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            {Object.entries(tasks).map(([status, items]) => (
              <div key={status} className="rounded-2xl border border-zinc-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{status}</h3>
                  <span className="text-xs text-zinc-400">{items.length}</span>
                </div>
                <div className="mt-3 space-y-3">
                  {items.map((task) => (
                    <div key={task.title} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">Owner: {task.owner}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Live Feed</h2>
            <ul className="mt-3 space-y-3 text-sm text-zinc-700">
              {liveFeed.map((item) => (
                <li key={item} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Approvals Queue</h2>
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-800">
              Google Ads budget change — pending review
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Support Queue</h2>
            <p className="mt-2 text-sm">SUP-1042 · Delivery delay · High</p>
            <p className="text-xs text-zinc-500">SLA: 2h</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
