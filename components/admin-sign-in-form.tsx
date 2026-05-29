"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type AdminSignInFormProps = {
  nextPath?: string;
};

export function AdminSignInForm({ nextPath = "/admin/dashboard" }: AdminSignInFormProps) {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/signin", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          next: nextPath,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        message?: string;
        nextPath?: string;
      } | null;

      if (!res.ok) {
        throw new Error(data?.message ?? "Authentication failed");
      }

      const destination = data?.nextPath || nextPath;
      router.replace(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 px-6 py-5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/10">
              <Image
                src="/cc.jpg"
                alt="Credit Cache logo"
                width={48}
                height={48}
                className="h-10 w-10 object-cover"
                priority
              />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Credit Cache
              </p>
              <h1 className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
                Admin sign in
              </h1>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email or phone
              </span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                placeholder="admin@example.com"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-zinc-400 dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
                required
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
          >
            {loading ? "Please wait..." : "Sign in to admin"}
          </button>
        </form>
      </div>
    </div>
  );
}