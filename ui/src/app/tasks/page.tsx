import SectionTitle from "@/components/SectionTitle";
import SideNav from "@/components/SideNav";

const columns = [
  "inbox",
  "assigned",
  "in_progress",
  "review",
  "done",
  "blocked",
];

export default function TasksPage() {
  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Tasks" subtitle="Kanban" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[#3A3A38]/20 border border-[#3A3A38]/20">
            {columns.map((col) => (
              <div key={col} className="bg-[#F7F7F5] p-6 min-h-[220px]">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                  {col}
                </div>
                <div className="mt-4 text-sm opacity-60">No tasks</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
