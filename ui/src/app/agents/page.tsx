import SideNav from "@/components/SideNav";
import SectionTitle from "@/components/SectionTitle";

export default function AgentsPage() {
  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Agents" subtitle="Roster" />
          <div className="border border-[#3A3A38]/20 bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Agents</div>
            <div className="mt-4 text-sm opacity-60">No agents</div>
          </div>
        </div>
      </div>
    </main>
  );
}
