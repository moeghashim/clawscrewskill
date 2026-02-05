"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.replace("/");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#1A3C2B] flex items-center justify-center p-8">
      <div className="w-full max-w-md border border-[#3A3A38]/20 bg-white p-10">
        <div className="mb-8">
          <div className="w-10 h-10 bg-[#1A3C2B] mb-4"></div>
          <h1 className="text-3xl font-bold tracking-tight uppercase">ClawsCrew</h1>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60 mt-2">
            Single-user access
          </p>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-60">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#1A3C2B]"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] opacity-60">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#3A3A38]/20 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#1A3C2B]"
              required
            />
          </div>
          {error && <div className="text-sm text-[#FF8C69]">{error}</div>}
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#1A3C2B] text-white py-3 text-[12px] uppercase tracking-[0.2em]"
          >
            {loading ? "Authenticating..." : "Enter"}
          </button>
        </form>
      </div>
    </main>
  );
}
