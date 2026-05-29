"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestSucceeded, setRequestSucceeded] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setRequestSucceeded(false);

    try {
      const value = email.trim().toLowerCase();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        throw new Error("Please enter a valid email address");
      }

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 404 && data?.code === "USER_NOT_FOUND") {
        setError(data?.message ?? "No account found for this email.");
        return;
      }

      if (res.status === 429 && data?.code === "RESEND_COOLDOWN") {
        throw new Error(data?.message ?? "Please wait before requesting another code.");
      }

      if (!res.ok) {
        throw new Error(data?.message ?? "Request failed");
      }

      setMessage(data?.message ?? "A reset code has been sent to your email.");
      setRequestSucceeded(true);

      router.push(
        `/auth/reset-password?email=${encodeURIComponent(value)}&sentAt=${Date.now()}&expiresAt=${Date.now() + (data?.expiresInSeconds ?? 900) * 1000}&resendAfter=${data?.resendAfterSeconds ?? 60}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-black text-zinc-950 dark:text-white">
          Reset your password
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
              required
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              <p>{error}</p>
              {error.toLowerCase().includes("no account found") ? (
                <Link href="/auth/sign-up" className="mt-2 inline-block underline">
                  Create account
                </Link>
              ) : null}
            </div>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-950"
          >
            {loading ? "Please wait..." : "Send reset code"}
          </button>

          {requestSucceeded ? (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}&sentAt=${Date.now()}&expiresAt=${Date.now() + 15 * 60 * 1000}&resendAfter=60`,
                )
              }
              className="w-full rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
            >
              I have my code
            </button>
          ) : null}

          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/auth/sign-in" className="underline">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}