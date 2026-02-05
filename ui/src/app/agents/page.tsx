"use client";

import SideNav from "@/components/SideNav";
import SectionTitle from "@/components/SectionTitle";
import { useQuery } from "convex/react";
import { api } from "@/lib/convex";

export default function AgentsPage() {
  const agents = useQuery(api.agents.list) || [];

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Agents" subtitle="Roster" />
          <div className="border border-[var(--grid)] bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Agents</div>
            <div className="mt-4 space-y-2">
              {agents.length === 0 && <div className="text-sm opacity-60">No agents</div>}
              {agents.map((a) => (
                <div key={a._id} className="border border-[var(--grid)] p-3 text-sm">
                  <div className="uppercase tracking-tight">{a.name}</div>
                  <div className="text-xs opacity-60 mt-1">{a.role} — {a.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
