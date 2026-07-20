// main/app/admin/payments/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getManualCredit } from "@/lib/creditcache-payments";

type VerifyState = {
  status: "idle" | "loading" | "success" | "failed";
  message: string;
  reference?: string;
  paidAmountNgn?: number;
  creditedUsd?: number;
};

const MIN_MANUAL_TOP_UP_NGN = 1;

function formatCurrency(cents: number, currencyCode = "USD") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currencyCode.toUpperCase()}`;
  }
}

function formatNaira(amount: number) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₦${Math.round(amount).toLocaleString("en-NG")}`;
  }
}

function readPositiveNumber(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>({
    status: "idle",
    message: "Waiting for payment details.",
  });

  const amountNgn = useMemo(
    () => readPositiveNumber(searchParams.get("amountNgn")) ?? 0,
    [searchParams],
  );
  const amountUsdFromQuery = useMemo(
    () => readPositiveNumber(searchParams.get("amountUsd")),
    [searchParams],
  );
  const mode = searchParams.get("mode") === "manual" ? "manual" : "pack";
  const label = searchParams.get("label")?.trim() || "Selected credit pack";
  const source = searchParams.get("source")?.trim() || "admin-balance-topup";

  const reference = searchParams.get("tx_ref") ?? searchParams.get("reference") ?? "";
  const transactionId = searchParams.get("transaction_id") ?? "";

  const amountUsd =
    amountUsdFromQuery ??
    (mode === "manual" && amountNgn > 0 ? getManualCredit(amountNgn) : 0);

  const isReady = amountNgn > 0 && amountUsd > 0;

  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "";

    const url = new URL("/admin/payments", window.location.origin);
    searchParams.forEach((value, key) => {
      if (key === "reference" || key === "tx_ref" || key === "transaction_id") return;
      url.searchParams.set(key, value);
    });

    return url.toString();
  }, [searchParams]);

  useEffect(() => {
    async function loadLoggedInUser() {
      try {
        setEmailLoading(true);

        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | {
              user?: {
                email?: string;
              } | null;
              message?: string;
            }
          | null;

        if (!response.ok || !data?.user?.email) {
          throw new Error(data?.message ?? "Unable to load logged-in user email.");
        }

        setEmail(data.user.email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load user email.");
      } finally {
        setEmailLoading(false);
      }
    }

    loadLoggedInUser();
  }, []);

  useEffect(() => {
    async function verifyPayment() {
      if (!reference && !transactionId) return;

      setVerifyState({
        status: "loading",
        message: "Verifying payment...",
      });

      try {
        const params = new URLSearchParams();
        if (reference) params.set("tx_ref", reference);
        if (transactionId) params.set("transaction_id", transactionId);

        const response = await fetch(`/api/creditcache/payments/verify?${params.toString()}`, {
          method: "GET",
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | {
              status?: boolean;
              message?: string;
              data?: {
                status?: string;
                reference?: string;
                amount?: number;
                creditedUsd?: number;
                creditedUsdCents?: number;
              };
            }
          | null;

        if (!response.ok || !data?.status || !data.data) {
          throw new Error(data?.message ?? "Payment verification failed.");
        }

        setVerifyState({
          status: "success",
          message: data.message ?? "Payment verified and balance updated.",
          reference: data.data.reference,
          paidAmountNgn: typeof data.data.amount === "number" ? data.data.amount : undefined,
          creditedUsd:
            typeof data.data.creditedUsdCents === "number"
              ? data.data.creditedUsdCents
              : data.data.creditedUsd,
        });

        router.replace("/admin?payment=success");
      } catch (err) {
        setVerifyState({
          status: "failed",
          message: err instanceof Error ? err.message : "Unable to verify payment.",
        });
      }
    }

    verifyPayment();
  }, [reference, transactionId, router]);

  async function handleProceed() {
    setError(null);

    if (!email.trim()) {
      setError("Unable to find the logged-in user's email.");
      return;
    }

    if (!isReady) {
      setError("This checkout is missing an amount.");
      return;
    }

    if (mode === "manual" && amountNgn < MIN_MANUAL_TOP_UP_NGN) {
      setError(`Enter a valid manual amount of at least ₦${MIN_MANUAL_TOP_UP_NGN.toLocaleString("en-NG")}.`);
      return;
    }

    if (!callbackUrl) {
      setError("Unable to build the callback URL.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/creditcache/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amountNgn,
          amountUsd,
          mode,
          callbackUrl,
          label,
          source,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            status?: boolean;
            message?: string;
            data?: {
              authorization_url?: string;
              tx_ref?: string;
            };
          }
        | null;

      if (!response.ok || !data?.status || !data.data?.authorization_url) {
        throw new Error(data?.message ?? "Unable to start checkout.");
      }

      window.location.href = data.data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment.");
    } finally {
      setLoading(false);
    }
  }

  const displayTitle = label;
  const displayModeLabel = mode === "manual" ? "Manual top up" : "Fixed pack";

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black tracking-tight">CreditCache Payments</h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Confirm the chosen top-up and continue to checkout.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Back
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Selected top-up
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight">{displayTitle}</h2>
              </div>

              <div className="rounded-full border border-black/5 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                {displayModeLabel}
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Amount paid
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                  {isReady ? formatNaira(amountNgn) : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Credit added
                </div>
                <div className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                  {isReady ? formatCurrency(amountUsd, "USD") : "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Rate
                </div>
                <div className="mt-2 text-lg font-semibold text-zinc-950 dark:text-white">
                  {mode === "manual" ? "15% higher manual rate" : "Fixed pack rate"}
                </div>
              </div>

              <div className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Logged-in email
                </div>
                <div className="mt-2 text-lg font-semibold text-zinc-950 dark:text-white">
                  {emailLoading ? "Loading..." : email || "Not found"}
                </div>
              </div>
            </div>

            {!isReady ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                This checkout is missing the selected amount. Go back to the packs page and choose a plan.
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleProceed}
                disabled={loading || emailLoading || !isReady}
                className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                {loading ? "Opening checkout..." : "Proceed to payment"}
              </button>

              <Link
                href="/admin/payments/plans"
                className="rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Back to packs
              </Link>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold tracking-tight">Details</div>
              <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between gap-3">
                  <span>Label</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{displayTitle}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Source</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{source}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Mode</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{displayModeLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Amount</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">
                    {isReady ? formatNaira(amountNgn) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold tracking-tight">Payment status</div>

              <div className="mt-4 rounded-2xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-950">
                <div className="text-sm font-medium text-zinc-950 dark:text-white">
                  {verifyState.status === "loading"
                    ? "Verifying..."
                    : verifyState.status === "success"
                      ? "Verified"
                      : verifyState.status === "failed"
                        ? "Not verified"
                        : "Waiting"}
                </div>

                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {verifyState.message}
                </p>

                {verifyState.reference ? (
                  <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                    Reference: {verifyState.reference}
                  </div>
                ) : null}

                {typeof verifyState.paidAmountNgn === "number" ? (
                  <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Paid amount: {formatNaira(verifyState.paidAmountNgn)}
                  </div>
                ) : null}

                {typeof verifyState.creditedUsd === "number" ? (
                  <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    Credited: {formatCurrency(verifyState.creditedUsd, "USD")}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold tracking-tight">Note</div>
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                The pack is selected only once on the packs page. This page only confirms the amount
                and starts checkout.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}