"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const nextPath = useMemo(() => searchParams.get("next") ?? "/dashboard", [searchParams]);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function run() {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token");
        return;
      }

      setStatus("loading");

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message ?? "Verification failed");
        }

        setStatus("success");
        setMessage(data?.message ?? "Email verified");

        router.replace(nextPath);
        router.refresh();
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      }
    }

    run();
  }, [token, nextPath, router]);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
        <h1 className="text-xl font-black text-zinc-950 dark:text-white">
          Verify email
        </h1>

        <p className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          {status === "loading" ? "Verifying..." : message}
        </p>

        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/auth/sign-in" className="underline">
            Go to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}