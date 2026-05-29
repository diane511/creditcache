import Link from "next/link";

type SavedCard = {
  id?: string;
  brand: string;
  last4: string;
  type: string;
  expiry: string;
  status: string;
};

type PaymentMethod = {
  id?: string;
  name: string;
  note: string;
  status: string;
};

type HistoryItem = {
  id?: string;
  title: string;
  meta: string;
  amount?: number;
  currency?: string;
  tone?: "primary" | "good" | "warn" | "danger";
  href?: string;
};

type GrantOpportunity = {
  id?: string;
  title: string;
  provider: string;
  amount?: string;
  deadline?: string;
  description: string;
  eligibility?: "eligible" | "review" | "closed" | "ineligible";
  href?: string;
  tags?: string[];
};

type NotificationItem = {
  id?: string;
  title: string;
  meta: string;
  read?: boolean;
  href?: string;
};

type ScamReportItem = {
  status?: string;
  [key: string]: unknown;
};

type DashboardPageProps = {
  balance?: number;
  currency?: string;
  balanceLabel?: string;
  savedCards?: SavedCard[];
  paymentMethods?: PaymentMethod[];
  recentHistory?: HistoryItem[];
  applications?: unknown[];
  opportunities?: GrantOpportunity[];
  scamReports?: ScamReportItem[];
  notifications?: NotificationItem[];
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function toneClass(tone: HistoryItem["tone"] = "primary") {
  switch (tone) {
    case "good":
      return "text-emerald-600 dark:text-emerald-400";
    case "warn":
      return "text-amber-600 dark:text-amber-400";
    case "danger":
      return "text-rose-600 dark:text-rose-400";
    case "primary":
    default:
      return "text-zinc-950 dark:text-white";
  }
}

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

export default function DashboardPage({
  balance = 0,
  currency = "USD",
  balanceLabel = "Available balance",
  savedCards = [],
  paymentMethods = [],
  recentHistory = [],
  applications = [],
  opportunities = [],
  scamReports = [],
  notifications = [],
}: DashboardPageProps) {
  const openReportsCount = scamReports.filter(
    (item) => item.status !== "Resolved"
  ).length;

  const eligibleOpportunities = opportunities.filter(
    (item) => item.eligibility !== "ineligible" && item.eligibility !== "closed"
  );

  const unreadNotificationsCount = notifications.filter(
    (item) => !item.read
  ).length;

  const balanceFormatted = formatMoney(balance, currency);

  const actions = [
    {
      label: "Withdraw",
      href: "/dashboard/withdraw",
      kind: "withdraw" as const,
    },
    {
      label: "Deposit",
      href: "/dashboard/deposit",
      kind: "deposit" as const,
    },
    {
      label: "Transfer",
      href: "/dashboard/transfer",
      kind: "transfer" as const,
    },
  ];

  return (
    <div className="-ml-6 w-[calc(100%+1.5rem)] min-w-0 max-w-none overflow-x-hidden sm:mx-0 sm:w-full sm:max-w-full">
      <div className="mx-auto max-w-md space-y-5 pb-6">
        <div className="flex items-start justify-between px-1 pt-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              Home
            </div>
            <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Welcome back
            </div>
          </div>

          <Link href="/dashboard/notifications" aria-label="Notifications">
            <BellIcon unread={unreadNotificationsCount > 0} />
          </Link>
        </div>

        <div className="px-1">
          <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {balanceLabel}
          </div>
          <div className="mt-2 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            {balanceFormatted}
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            Your current available funds
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {actions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <ActionIcon kind={action.kind} />
                <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                  {action.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                Notifications
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Latest updates and reminders
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
              {notifications.length}
            </span>
          </div>

          <div className="mt-4 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 dark:divide-white/10 dark:border-white/10">
            {notifications.length ? (
              notifications.slice(0, 4).map((item, index) => (
                <Link
                  key={item.id ?? `${item.title}-${index}`}
                  href={item.href ?? "/dashboard/notifications"}
                  className="flex items-start justify-between gap-3 bg-zinc-50 px-4 py-4 transition hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-950 dark:text-white">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.meta}
                    </div>
                  </div>

                  {!item.read ? (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
                  ) : (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-transparent" />
                  )}
                </Link>
              ))
            ) : (
              <div className="bg-zinc-50 px-4 py-6 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                No notifications yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                Recent activity
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Your latest account updates
              </p>
            </div>
            <Link
              href="/dashboard/history"
              className="text-xs font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 dark:divide-white/10 dark:border-white/10">
            {recentHistory.length ? (
              recentHistory.slice(0, 4).map((item, index) => (
                <div
                  key={item.id ?? `${item.title}-${index}`}
                  className="flex items-center justify-between gap-4 bg-zinc-50 px-4 py-4 dark:bg-zinc-950"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-950 dark:text-white">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.meta}
                    </div>
                  </div>

                  {typeof item.amount === "number" ? (
                    <div
                      className={`shrink-0 text-sm font-semibold ${toneClass(
                        item.tone
                      )}`}
                    >
                      {item.amount > 0 ? "+" : ""}
                      {formatMoney(Math.abs(item.amount), item.currency ?? currency)}
                    </div>
                  ) : (
                    <div className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      —
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-zinc-50 px-4 py-6 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                No recent activity yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                Grant opportunities
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Eligible opportunities for you
              </p>
            </div>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
              {eligibleOpportunities.length}
            </span>
          </div>

          <div className="mt-4 divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 dark:divide-white/10 dark:border-white/10">
            {eligibleOpportunities.length ? (
              eligibleOpportunities.slice(0, 4).map((item, index) => (
                <div
                  key={item.id ?? `${item.title}-${index}`}
                  className="bg-zinc-50 px-4 py-4 dark:bg-zinc-950"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-zinc-950 dark:text-white">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {item.provider}
                        {item.deadline ? ` · ${item.deadline}` : ""}
                      </div>
                    </div>

                    {item.amount ? (
                      <div className="shrink-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.amount}
                      </div>
                    ) : null}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {item.description}
                  </p>

                  {item.href ? (
                    <div className="mt-3">
                      <Link
                        href={item.href}
                        className="text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
                      >
                        Review
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="bg-zinc-50 px-4 py-6 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                No eligible grant opportunities right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}