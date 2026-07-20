// main/components/admin/AdminBalancePanel.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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
  const [transferOpen, setTransferOpen] = useState(false);

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
            <ActionButton href="/admin/payments/plans">Top up balance</ActionButton>
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