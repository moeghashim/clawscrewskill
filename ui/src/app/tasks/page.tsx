"use client";

import SectionTitle from "@/components/SectionTitle";
import SideNav from "@/components/SideNav";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import Link from "next/link";

const columns = [
  "inbox",
  "assigned",
  "in_progress",
  "review",
  "done",
  "blocked",
];

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list) || [];
  const createTask = useMutation(api.tasks.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createTask({ title, description });
    setTitle("");
    setDescription("");
  };

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Tasks" subtitle="Kanban" />

          <form onSubmit={onCreate} className="border border-[#3A3A38]/20 bg-white p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="border border-[#3A3A38]/20 px-4 py-3 text-sm"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <button className="mt-4 bg-[#1A3C2B] text-white px-6 py-3 text-[12px] uppercase tracking-[0.2em]">
              Create Task
            </button>
          </form>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-[1px] bg-[#3A3A38]/20 border border-[#3A3A38]/20">
            {columns.map((col) => (
              <div key={col} className="bg-[#F7F7F5] p-6 min-h-[220px]">
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">{col}</div>
                <div className="mt-4 space-y-3">
                  {tasks.filter((t) => t.status === col).map((t) => (
                    <Link key={t._id} href={`/tasks/${t._id}`} className="block border border-[#3A3A38]/20 bg-white p-3 text-sm">
                      <div className="uppercase tracking-tight">{t.title}</div>
                      <div className="text-xs opacity-60 mt-1">{t.description}</div>
                    </Link>
                  ))}
                  {tasks.filter((t) => t.status === col).length === 0 && (
                    <div className="text-sm opacity-60">No tasks</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
