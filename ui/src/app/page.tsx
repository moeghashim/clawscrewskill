import SideNav from "@/components/SideNav";
import SectionTitle from "@/components/SectionTitle";

export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Dashboard" subtitle="Mission Control" />

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </main>
  );
}
