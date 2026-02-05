"use client";

import SideNav from "@/components/SideNav";
import SectionTitle from "@/components/SectionTitle";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";

export default function Home() {
  const tasks = (useQuery(api.tasks.list) || []) as any[];
  const agents = (useQuery(api.agents.list) || []) as any[];
  const feed = (useQuery(api.feed.list, { limit: 10 }) || []) as any[];

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Dashboard" subtitle="Mission Control" />

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[var(--grid)] p-6 bg-white">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Status</div>
              <div className="mt-4 text-3xl uppercase tracking-tight">Operational</div>
            </div>
            <div className="border border-[var(--grid)] p-6 bg-white">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Tasks</div>
              <div className="mt-4 text-3xl uppercase tracking-tight">{tasks.length} Active</div>
            </div>
            <div className="border border-[var(--grid)] p-6 bg-white">
              <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Agents</div>
              <div className="mt-4 text-3xl uppercase tracking-tight">{agents.length} Online</div>
            </div>
          </section>

          <section className="mt-10 border border-[var(--grid)] bg-white p-6">
            <h2 className="text-[12px] uppercase tracking-[0.2em] mono">Activity Feed</h2>
            <div className="mt-4 space-y-2">
              {feed.length === 0 && <div className="text-sm opacity-60">No activity yet.</div>}
              {feed.map((item) => (
                <div key={item._id} className="text-sm">
                  {item.message}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
