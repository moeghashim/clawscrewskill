"use client";

import SideNav from "@/components/SideNav";
import SectionTitle from "@/components/SectionTitle";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/lib/convex";
import { useState } from "react";
import EmptyState from "@/components/EmptyState";

export default function DocumentsPage() {
  const documents = useQuery(api.documents.list) || [];
  const createDoc = useMutation(api.documents.create);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createDoc({ title, content, type: "other" });
    setTitle("");
    setContent("");
  };

  return (
    <main className="min-h-screen p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <SideNav />

        <div>
          <SectionTitle title="Documents" subtitle="Knowledge" />

          <form onSubmit={onCreate} className="border border-[var(--grid)] bg-white p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-[var(--grid)] px-4 py-3 text-sm"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="border border-[var(--grid)] px-4 py-3 text-sm"
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <button className="mt-4 bg-[var(--forest)] text-white px-6 py-3 text-[12px] uppercase tracking-[0.2em] mono">
              Create Document
            </button>
          </form>

          <div className="border border-[var(--grid)] bg-white p-6">
            <div className="text-[10px] uppercase tracking-[0.2em] opacity-60 mono">Library</div>
            <div className="mt-4 space-y-2">
              {documents.length === 0 && <EmptyState label="No documents" />}
              {documents.map((d) => (
                <div key={d._id} className="border border-[var(--grid)] p-3 text-sm">
                  <div className="uppercase tracking-tight">{d.title}</div>
                  <div className="text-xs opacity-60 mt-1">{d.content}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
