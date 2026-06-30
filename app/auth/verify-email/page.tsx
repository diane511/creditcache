"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type ApiResponse = {
  code?: string;
  message?: string;
  redirectUrl?: string;
  expiresInSeconds?: number;
  retryAfterSeconds?: number;
  errors?: Array<{ field?: string | null; message: string }>;
};

function normalizeCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = useMemo(
    () => searchParams.get("email") ?? "",
    [searchParams],
  );

  const nextPath = useMemo(
    () => searchParams.get("next") ?? "/dashboard?welcome=verified",
    [searchParams],
  );

  const isAdminFlow = nextPath.startsWith("/admin");
  const signInHref = isAdminFlow
    ? "/admin/ops-7c3a/signin"
    : "/auth/signin";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (resendIn <= 0) return;

    const timer = setInterval(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendIn]);

  const resendLabel =
    resendIn > 0 ? `Resend code in ${formatSeconds(resendIn)}` : "Resend code";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail) {
      setStatus("error");
      setMessage("Enter the email address that received the code.");
      return;
    }

    if (cleanCode.length !== 6) {
      setStatus("error");
      setMessage("Enter the 6-digit verification code.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          code: cleanCode,
          nextPath,
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok) {
        throw new Error(data?.message ?? "Verification failed");
      }

      setStatus("success");
      setMessage(data?.message ?? "Email verified");

      router.replace(data?.redirectUrl ?? nextPath);
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Verification failed");
    }
  }

  async function resendCode() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setStatus("error");
      setMessage("Enter your email address first.");
      return;
    }

    setResendLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          nextPath,
        }),
      });

      const data = (await res.json().catch(() => null)) as ApiResponse | null;

      if (!res.ok) {
        if (res.status === 429 && data?.retryAfterSeconds) {
          setResendIn(data.retryAfterSeconds);
        }
        throw new Error(data?.message ?? "Could not resend code");
      }

      const expiresInSeconds = data?.expiresInSeconds ?? 15 * 60;
      setResendIn(60);
      setStatus("success");
      setMessage(data?.message ?? "A new verification code was sent.");

      const expireAt = Date.now() + expiresInSeconds * 1000;
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((expireAt - Date.now()) / 1000));
        if (remaining === 0) clearInterval(timer);
      }, 1000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-black text-zinc-950 dark:text-white">
          Verify email
        </h1>

        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Enter the code we sent to your inbox.
          {isAdminFlow ? " This account must be verified before admin sign in." : ""}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Verification code
            </span>
            <input
              value={code}
              onChange={(e) => setCode(normalizeCode(e.target.value))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              maxLength={6}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none dark:border-white/10 dark:bg-zinc-950/40 dark:text-white"
              required
            />
          </label>

          {message ? (
            <p
              className={`rounded-2xl px-4 py-3 text-sm ${
                status === "error"
                  ? "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
              }`}
            >
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-950"
          >
            {status === "loading" ? "Verifying..." : "Verify email"}
          </button>

          <button
            type="button"
            onClick={resendCode}
            disabled={resendLoading || resendIn > 0}
            className="w-full rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
          >
            {resendLoading ? "Sending..." : resendLabel}
          </button>

          <div className="flex flex-col items-center gap-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <Link href={signInHref} className="underline">
              Go to sign in
            </Link>
            <Link href="/auth/forgot-password" className="underline">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}