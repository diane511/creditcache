"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);

  const initialExpiresAt = searchParams.get("expiresAt")
    ? Number(searchParams.get("expiresAt"))
    : null;

  const initialResendAt = searchParams.get("sentAt")
    ? Number(searchParams.get("sentAt")) + (Number(searchParams.get("resendAfter") ?? "60") * 1000)
    : null;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(initialExpiresAt);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(initialResendAt);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const codeExpiresIn =
    codeExpiresAt != null ? Math.max(0, Math.ceil((codeExpiresAt - now) / 1000)) : null;

  const resendIn =
    resendAvailableAt != null ? Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)) : 0;

  async function resendCode() {
    if (!email) return;

    setResendLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 404 && data?.code === "USER_NOT_FOUND") {
        throw new Error(data?.message ?? "No account found for this email.");
      }

      if (res.status === 429 && data?.code === "RESEND_COOLDOWN") {
        const retryAfterSeconds = data?.retryAfterSeconds ?? 60;
        setResendAvailableAt(Date.now() + retryAfterSeconds * 1000);
        throw new Error(data?.message ?? "Please wait before requesting another code.");
      }

      if (!res.ok) {
        throw new Error(data?.message ?? "Request failed");
      }

      const sentNow = Date.now();
      const expiresInSeconds = data?.expiresInSeconds ?? 15 * 60;
      const resendAfterSeconds = data?.resendAfterSeconds ?? 60;

      setMessage(data?.message ?? "A new code has been sent.");
      setCode("");
      setCodeExpiresAt(sentNow + expiresInSeconds * 1000);
      setResendAvailableAt(sentNow + resendAfterSeconds * 1000);

      router.replace(
        `/auth/reset-password?email=${encodeURIComponent(email)}&sentAt=${sentNow}&expiresAt=${sentNow + expiresInSeconds * 1000}&resendAfter=${resendAfterSeconds}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setResendLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Missing email address");
      return;
    }

    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }

    if (codeExpiresAt != null && Date.now() > codeExpiresAt) {
      setError("That code expired. Request a new one.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message ?? "Request failed");
      }

      setMessage("Password updated");
      router.push("/auth/sign-in");
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
          Set a new password
        </h1>

        {email ? (
          <div className="mt-2 space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              Code sent to <span className="font-medium">{email}</span>
            </p>
            {codeExpiresIn != null ? (
              <p>Code expires in {formatSeconds(codeExpiresIn)}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            Missing email address
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Reset code
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
              required
              maxLength={6}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              New password
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirm password
            </span>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
              required
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-950"
          >
            {loading ? "Please wait..." : "Update password"}
          </button>

          <button
            type="button"
            onClick={resendCode}
            disabled={!email || resendLoading || resendIn > 0}
            className="w-full rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            {resendLoading
              ? "Sending..."
              : resendIn > 0
                ? `Resend code in ${formatSeconds(resendIn)}`
                : "Resend code"}
          </button>

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