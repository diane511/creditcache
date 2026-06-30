"use client";

import Link from "next/link";
import type { ReactNode } from "react";

function BellIcon({ unread = false }: { unread?: boolean }) {
  return (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="h-5 w-5 text-zinc-950 dark:text-white"
      >
        <path
          d="M15 17H9m8-6a5 5 0 10-10 0c0 5-2 6-2 6h14s-2-1-2-6Zm-3.5 8a2 2 0 01-3 0"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unread ? (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-950" />
      ) : null}
    </span>
  );
}

function ActionIcon({ kind }: { kind: "withdraw" | "deposit" | "transfer" }) {
  const common = {
    className: "h-5 w-5 text-zinc-950 dark:text-white",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (kind === "withdraw") {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M7.5 14.5L12 19l4.5-4.5" />
        <path d="M5 5h14" />
      </svg>
    );
  }

  if (kind === "deposit") {
    return (
      <svg {...common}>
        <path d="M12 19V5" />
        <path d="M7.5 9.5L12 5l4.5 4.5" />
        <path d="M5 19h14" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M6 7h8a4 4 0 014 4v0" />
      <path d="M14 5l4 4-4 4" />
      <path d="M18 17H10a4 4 0 01-4-4v0" />
      <path d="M10 19l-4-4 4-4" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "default" | "good" | "warn" | "danger";
}) {
  const toneClasses =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10"
        : tone === "danger"
          ? "border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10"
          : "border-black/5 bg-white dark:border-white/10 dark:bg-white/5";

  return (
    <div className={`rounded-3xl border p-4 shadow-sm ${toneClasses}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <div className="mt-3 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{caption}</p>
    </div>
  );
}

export function DashboardOverview({
  firstName,
  balanceLabel,
  balanceFormatted,
  savedCardsCount,
  paymentMethodsCount,
  applicationsCount,
  openReportsCount,
  unreadNotifications,
}: {
  firstName: string;
  balanceLabel: string;
  balanceFormatted: string;
  savedCardsCount: number;
  paymentMethodsCount: number;
  applicationsCount: number;
  openReportsCount: number;
  unreadNotifications: boolean;
}) {
  const actions = [
    { label: "Withdraw", href: "/dashboard/withdraw", kind: "withdraw" as const },
    { label: "Deposit", href: "/dashboard/deposit", kind: "deposit" as const },
    { label: "Transfer", href: "/dashboard/transfer", kind: "transfer" as const },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            Home
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Good to see you, {firstName}.
          </h1>
          <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Here is everything happening in your account today.
          </p>
        </div>

        <Link href="/dashboard/notifications" aria-label="Notifications">
          <BellIcon unread={unreadNotifications} />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={balanceLabel}
          value={balanceFormatted}
          caption="Your current available funds."
        />
        <StatCard
          label="Secure vault"
          value={`${savedCardsCount + paymentMethodsCount}`}
          caption={`${savedCardsCount} saved cards and ${paymentMethodsCount} payment methods.`}
          tone="good"
        />
        <StatCard
          label="Applications"
          value={`${applicationsCount}`}
          caption="Tracked items and submissions in your workspace."
          tone="warn"
        />
        <StatCard
          label="Open reports"
          value={`${openReportsCount}`}
          caption="Pending scam or safety reports."
          tone="danger"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-white/10">
                <ActionIcon kind={action.kind} />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                  {action.label}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Open {action.label.toLowerCase()} flow
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}