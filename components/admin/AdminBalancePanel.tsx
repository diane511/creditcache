// main/components/admin/AdminBalancePanel.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import type {
  AdminOpportunity,
  AdminGuidance,
  AdminUser,
  QueueItem,
} from "@/lib/admin-data";
import AdminTransferModal from "./AdminTransferModal";

type AdminRole = "admin" | "super-admin";

type AdminUserWithStatus = AdminUser & {
  status?: "pending" | "active" | "suspended";
};

type Props = {
  role: AdminRole;
  opportunities?: AdminOpportunity[];
  guidancePosts?: AdminGuidance[];
  users?: AdminUserWithStatus[];
  queueItems?: QueueItem[];
  adminBalanceCents?: number;
  currencyCode?: string;
};

type TopUpPlan = {
  label: string;
  badge: string;
  amountNgn: number;
  usdCredit: number; // cents
  description: string;
};

type TopUpMode = "pack" | "manual";

const MAX_BALANCE_USD = 1_000_000;
const PAYMENTS_ROUTE = "/admin/payments";

const TOP_UP_PLANS: TopUpPlan[] = [
  {
    label: "Lowest Entry",
    badge: "No discount",
    amountNgn: 2500,
    usdCredit: 10_000_000, // $100,000
    description: "Best starting point.",
  },
  {
    label: "Popular",
    badge: "10% OFF",
    amountNgn: 7500,
    usdCredit: 30_000_000, // $300,000
    description: "A stronger starter pack.",
  },
  {
    label: "More Value",
    badge: "25% OFF",
    amountNgn: 20000,
    usdCredit: 100_000_000, // $1,000,000
    description: "A serious credit jump.",
  },
  {
    label: "Top Value",
    badge: "40% OFF",
    amountNgn: 45000,
    usdCredit: 600_000_000, // $6,000,000
    description: "For high-volume usage.",
  },
  {
    label: "Ultimate",
    badge: "55% OFF",
    amountNgn: 75000,
    usdCredit: 1_000_000_000, // $10,000,000
    description: "Largest pack available.",
  },
];

const PACK_CENTS_PER_NGN = TOP_UP_PLANS[0].usdCredit / TOP_UP_PLANS[0].amountNgn;
const MANUAL_RATE_MULTIPLIER = 0.85; // 15% worse than the fixed packs

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

function getManualUsdCredit(amountNgn: number) {
  return Math.round(amountNgn * PACK_CENTS_PER_NGN * MANUAL_RATE_MULTIPLIER);
}

function buildPaymentsUrl(params: {
  amountNgn: number;
  amountUsd: number;
  mode: TopUpMode;
  label: string;
}) {
  const searchParams = new URLSearchParams({
    amountNgn: String(Math.round(params.amountNgn)),
    amountUsd: String(Math.round(params.amountUsd)),
    mode: params.mode,
    label: params.label,
    source: "admin-balance-topup",
  });

  return `${PAYMENTS_ROUTE}?${searchParams.toString()}`;
}

function ActionButton({
  children,
  href,
  onClick,
  secondary = false,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  secondary?: boolean;
}) {
  const className = [
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
    secondary
      ? "border border-black/10 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
      : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100",
  ].join(" ");

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function TopLink({
  href,
  title,
  hint,
}: {
  href: string;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 border-t border-black/5 py-4 transition hover:opacity-80 dark:border-white/10"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-zinc-950 dark:text-white">{title}</span>
        <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
      </span>
      <span className="text-sm text-zinc-400 transition group-hover:translate-x-0.5 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
        ↗
      </span>
    </Link>
  );
}

function PlanPill({
  active,
  badge,
}: {
  active: boolean;
  badge: string;
}) {
  return (
    <span
      className={[
        "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        active
          ? "border-transparent bg-white/20 text-white"
          : "border-black/10 bg-white text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400",
      ].join(" ")}
    >
      {badge}
    </span>
  );
}

export function AdminBalancePanel({
  role,
  opportunities = [],
  guidancePosts = [],
  users = [],
  queueItems = [],
  adminBalanceCents = 0,
  currencyCode = "USD",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshedOnce = useRef(false);

  const [balanceCents, setBalanceCents] = useState(adminBalanceCents);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TopUpPlan>(TOP_UP_PLANS[0]);
  const [topUpMode, setTopUpMode] = useState<TopUpMode>("pack");
  const [manualAmountNgn, setManualAmountNgn] = useState("");
  const [topUpError, setTopUpError] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setBalanceCents(adminBalanceCents);
  }, [adminBalanceCents]);

  useEffect(() => {
    async function loadCurrentBalance() {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        const data = (await response.json().catch(() => null)) as
          | {
              user?: {
                creditBalance?: number;
                creditBalanceCents?: number;
              } | null;
            }
          | null;

        if (!response.ok || !data?.user) return;

        if (typeof data.user.creditBalanceCents === "number") {
          setBalanceCents(data.user.creditBalanceCents);
          return;
        }

        if (typeof data.user.creditBalance === "number") {
          setBalanceCents(data.user.creditBalance);
        }
      } catch {
        // keep existing balance
      }
    }

    loadCurrentBalance();
  }, []);

  useEffect(() => {
    const payment = searchParams.get("payment");

    if (payment === "success" && !refreshedOnce.current) {
      refreshedOnce.current = true;
      router.refresh();

      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams, router]);

  const liveCount = opportunities.length + guidancePosts.length;
  const underReviewCount = queueItems.reduce((sum, item) => sum + item.count, 0);
  const maxBalanceCents = MAX_BALANCE_USD * 100;

  const manualAmount = Number(manualAmountNgn);
  const isManualAmountValid = Number.isFinite(manualAmount) && manualAmount > 0;
  const manualUsdCredit = isManualAmountValid ? getManualUsdCredit(manualAmount) : 0;

  const activeUsdCredit =
    topUpMode === "manual" && isManualAmountValid ? manualUsdCredit : selectedPlan.usdCredit;

  const topUpPreview = useMemo(
    () => `${formatCurrency(activeUsdCredit, "USD")} credit`,
    [activeUsdCredit],
  );

  function closeTopUpModal() {
    setTopUpOpen(false);
    setTopUpError(null);
  }

  function handleGoToPayments() {
    setTopUpError(null);

    const finalAmountNgn =
      topUpMode === "manual" && isManualAmountValid ? manualAmount : selectedPlan.amountNgn;

    const finalUsdCredit =
      topUpMode === "manual" && isManualAmountValid ? manualUsdCredit : selectedPlan.usdCredit;

    if (!finalAmountNgn || !finalUsdCredit) {
      setTopUpError("Enter a valid naira amount or choose a pack.");
      return;
    }

    setNavigating(true);

    router.push(
      buildPaymentsUrl({
        amountNgn: finalAmountNgn,
        amountUsd: finalUsdCredit,
        mode: topUpMode,
        label:
          topUpMode === "manual" && isManualAmountValid ? "Manual top up" : selectedPlan.label,
      }),
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="grid gap-8 border-y border-black/5 py-8 dark:border-white/10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
            Balance
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <h2 className="text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              {formatCurrency(balanceCents, currencyCode)}
            </h2>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ActionButton onClick={() => setTopUpOpen(true)}>Top up balance</ActionButton>
            <ActionButton onClick={() => setTransferOpen(true)} secondary>
              Send credits
            </ActionButton>
            <ActionButton href="/admin/invites" secondary>
              Invite hub
            </ActionButton>
          </div>
        </div>

        <dl className="grid gap-0 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center justify-between gap-4 border-t border-black/5 py-3 first:border-t-0 dark:border-white/10">
            <dt>Live content</dt>
            <dd className="font-medium text-zinc-950 dark:text-white">{liveCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-black/5 py-3 dark:border-white/10">
            <dt>Users</dt>
            <dd className="font-medium text-zinc-950 dark:text-white">{users.length}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-black/5 py-3 dark:border-white/10">
            <dt>Queue</dt>
            <dd className="font-medium text-zinc-950 dark:text-white">{underReviewCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-black/5 py-3 dark:border-white/10">
            <dt>Role</dt>
            <dd className="font-medium text-zinc-950 dark:text-white">
              {role === "super-admin" ? "Super admin" : "Admin"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <TopLink href="/admin/metrics" title="Metrics" hint="Detailed dashboard numbers." />
        <TopLink href="/admin/opportunities" title="Opportunities" hint="Manage items." />
        <TopLink href="/admin/guidance" title="Guidance" hint="Manage posts." />
        <TopLink href="/admin/users" title="Users" hint="Manage accounts." />
      </section>

      {topUpOpen ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-zinc-950/60 p-2 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[calc(100vh-1rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-black/5 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-zinc-950 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-xl">
                  Top up balance
                </h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  Choose a pack or enter any naira amount for a manual quote. Manual top-up uses
                  a 15% higher rate and shows no discount.
                </p>
              </div>

              <button
                type="button"
                onClick={closeTopUpModal}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/5 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                aria-label="Close top up modal"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {TOP_UP_PLANS.map((plan) => {
                const active = topUpMode === "pack" && selectedPlan.label === plan.label;

                return (
                  <button
                    key={plan.label}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setTopUpMode("pack");
                    }}
                    className={[
                      "rounded-3xl border p-4 text-left transition",
                      active
                        ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
                        : "border-black/5 bg-zinc-50 text-zinc-950 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <PlanPill active={active} badge={plan.badge} />
                      <div className="text-[10px] uppercase tracking-[0.18em] opacity-70">
                        {plan.description}
                      </div>
                    </div>

                    <div className="mt-3 text-2xl font-black tracking-tight">
                      {formatCurrency(plan.usdCredit, "USD")}
                    </div>
                    <div className="mt-1 text-sm font-semibold opacity-90">Credit</div>
                    <div className="mt-3 text-xs opacity-70">{formatNaira(plan.amountNgn)}</div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-3xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    Manual top up
                  </div>
                  <div className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                    Enter any naira amount to preview the dollar credit at the manual rate.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTopUpMode("manual")}
                  className={[
                    "rounded-full px-4 py-2 text-xs font-semibold transition",
                    topUpMode === "manual"
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                      : "border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  Use manual
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Naira amount
                  </span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={manualAmountNgn}
                    onChange={(e) => {
                      setManualAmountNgn(e.target.value);
                      setTopUpMode("manual");
                    }}
                    placeholder="e.g. 7500"
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                  />
                </label>

                <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 text-right dark:border-white/10 dark:bg-zinc-950 sm:min-w-56">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Manual credit
                  </div>
                  <div className="mt-1 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                    {isManualAmountValid ? formatCurrency(manualUsdCredit, "USD") : "—"}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {isManualAmountValid ? formatNaira(manualAmount) : "Enter an amount"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              Selected:{" "}
              <span className="font-semibold">
                {formatCurrency(activeUsdCredit, "USD")} credit
              </span>
            </div>

            <div className="mt-2 rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              Current balance:{" "}
              <span className="font-semibold">{formatCurrency(balanceCents, currencyCode)}</span>
            </div>

            {topUpError ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                {topUpError}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeTopUpModal}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleGoToPayments}
                disabled={navigating}
                className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
              >
                {navigating ? "Going to payments..." : "Go to payments"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AdminTransferModal
        open={transferOpen}
        users={users}
        balanceCents={balanceCents}
        currencyCode={currencyCode}
        onClose={() => setTransferOpen(false)}
        onSuccess={(nextBalanceCents) => {
          setBalanceCents(nextBalanceCents);
          router.refresh();
        }}
      />
    </div>
  );
}

export default AdminBalancePanel;