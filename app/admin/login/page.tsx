"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = searchParams.get("next") ?? "/admin";

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

      const data = (await res.json().catch(() => null)) as
        | { message?: string; nextPath?: string }
        | null;

      if (!res.ok) {
        throw new Error(data?.message ?? "Authentication failed");
      }

      router.replace(data?.nextPath ?? nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-zinc-50 text-zinc-950 dark:bg-zinc-900 dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-12">
        <section className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/10">
              <Image
                src="/cc.jpg"
                alt="Credit Cache logo"
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500 dark:text-zinc-400">
                Credit Cache
              </p>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Admin Access
              </p>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Welcome back
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Continue from where you left off.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-600 dark:text-zinc-400">
              Sign in to access your Credit Cache admin dashboard, manage
              activity, and keep everything moving from one clean workspace.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Secure access
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Protected sign-in flow.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Clean workflow
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Fast admin onboarding.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Responsive UI
                </p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Looks great on all screens.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-6 py-5 dark:border-white/10 sm:px-8">
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

            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
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

              <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                Only users with ADMIN or SUPER_ADMIN roles can access this area.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                {loading ? "Please wait..." : "Admin sign in"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}