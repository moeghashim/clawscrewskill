"use client";

import SideNav from "@/components/SideNav";
import SectionTitle from "@/components/SectionTitle";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import { useSystemAgent } from "@/lib/systemAgent";

export default function TaskDetail() {
  const params = useParams();
  const id = params?.id as string;
  const task = useQuery(api.tasks.get, { id: id as any }) as any;
  const messages = (useQuery(api.messages.byTask, { taskId: id as any }) || []) as any[];
  const createMessage = useMutation(api.messages.create);
  const [content, setContent] = useState("");
  const { ensureSystem } = useSystemAgent();

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !task) return;
    const agentId = await ensureSystem();
    await createMessage({ taskId: task._id, fromAgentId: agentId, content, attachments: [] });
    setContent("");
  };

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Task Detail" subtitle="Task" />
          <div className="border border-[var(--grid)] bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Title</div>
            <div className="mt-2 text-xl uppercase tracking-tight">
              {task?.title || "Untitled Task"}
            </div>
            <div className="mt-6 text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Description</div>
            <div className="mt-2 text-sm opacity-70">{task?.description || "No description"}</div>
          </div>

          <div className="mt-6 border border-[var(--grid)] bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Comments</div>
            <div className="mt-4 space-y-2">
              {messages.length === 0 && <div className="text-sm opacity-60">No messages</div>}
              {messages.map((m) => (
                <div key={m._id} className="text-sm">
                  {m.content}
                </div>
              ))}
            </div>
            <form onSubmit={onSend} className="mt-4 flex gap-2">
              <input
                className="flex-1 border border-[var(--grid)] px-4 py-2 text-sm"
                placeholder="Write a comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button className="bg-[var(--forest)] text-white px-4 py-2 text-[12px] uppercase tracking-[0.2em] mono">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
