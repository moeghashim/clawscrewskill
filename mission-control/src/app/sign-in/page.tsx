"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });
      if (signInError) {
        throw new Error(signInError.message);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
      });
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f5f2] px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Mission Control</h1>
        <p className="mt-2 text-sm text-zinc-500">
          {mode === "signin" ? "Sign in to continue" : "Create your account"}
        </p>

        <div className="mt-6 space-y-4">
          {mode === "signup" && (
            <div>
              <label className="text-sm text-zinc-600">Name</label>
              <input
                className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Moe"
              />
            </div>
          )}
          <div>
            <label className="text-sm text-zinc-600">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-600">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              type="password"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white"
            onClick={mode === "signin" ? handleSignIn : handleSignUp}
            disabled={loading}
          >
            {loading
              ? "Working..."
              : mode === "signin"
              ? "Sign in"
              : "Create account"}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-zinc-500">
          {mode === "signin" ? (
            <button
              className="text-zinc-700 underline"
              onClick={() => setMode("signup")}
            >
              Need an account? Sign up
            </button>
          ) : (
            <button
              className="text-zinc-700 underline"
              onClick={() => setMode("signin")}
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
