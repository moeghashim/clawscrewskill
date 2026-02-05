export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1A3C2B] p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b border-[#3A3A38]/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#1A3C2B]"></div>
            <h1 className="text-2xl uppercase tracking-tight">ClawsCrew</h1>
          </div>
          <form action="/api/logout" method="post">
            <button className="text-[10px] uppercase tracking-[0.2em] border border-[#1A3C2B] px-4 py-2">
              Logout
            </button>
          </form>
        </div>

        <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#3A3A38]/20 p-6 bg-white">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Status</div>
            <div className="mt-4 text-3xl uppercase tracking-tight">Operational</div>
          </div>
          <div className="border border-[#3A3A38]/20 p-6 bg-white">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Tasks</div>
            <div className="mt-4 text-3xl uppercase tracking-tight">0 Active</div>
          </div>
          <div className="border border-[#3A3A38]/20 p-6 bg-white">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Agents</div>
            <div className="mt-4 text-3xl uppercase tracking-tight">0 Online</div>
          </div>
        </section>

        <section className="mt-10 border border-[#3A3A38]/20 bg-white p-6">
          <h2 className="text-[12px] uppercase tracking-[0.2em]">Activity Feed</h2>
          <div className="mt-4 text-sm opacity-60">No activity yet.</div>
        </section>
      </div>
    </main>
  );
}
