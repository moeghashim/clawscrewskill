import SideNav from "@/components/SideNav";
import SectionTitle from "@/components/SectionTitle";

export default function TaskDetail() {
  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Task Detail" subtitle="Task" />
          <div className="border border-[#3A3A38]/20 bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Title</div>
            <div className="mt-2 text-xl uppercase tracking-tight">Untitled Task</div>
            <div className="mt-6 text-[10px] uppercase tracking-[0.2em] opacity-60">Description</div>
            <div className="mt-2 text-sm opacity-70">No description</div>
          </div>

          <div className="mt-6 border border-[#3A3A38]/20 bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">Comments</div>
            <div className="mt-4 text-sm opacity-60">No messages</div>
          </div>
        </div>
      </div>
    </main>
  );
}
