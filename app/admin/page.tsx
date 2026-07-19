// main/app/admin/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { AdminBalancePanel } from "@/components/admin/AdminBalancePanel";
import { AdminNotificationsBell } from "@/components/admin/AdminNotificationsBell";
import { AdminPendingApprovalNotice } from "@/components/admin/AdminPendingApprovalNotice";
import { AdminSuspendedNotice } from "@/components/admin/AdminSuspendedNotice";
import { AdminBannedNotice } from "@/components/admin/AdminBannedNotice";
import { buildAdminNotifications } from "@/lib/admin-notifications";
import { getAdminDashboardData, type CreditTopUpHistory } from "@/lib/admin-data";

type CreditTransferHistory = {
  id: string;
  txRef: string;
  senderLookup: string;
  recipientLookup: string;
  purpose: string;
  amountCents: number;
  status: string;
  createdAt: string | Date;
  note?: string | null;
};

type ActivityKind = "topup" | "transfer";

type ActivityItem = {
  id: string;
  kind: ActivityKind;
  createdAt: string | Date;
  title: string;
  subtitle: string;
  meta: string[];
  amountLabel: string;
  amountValue: string;
  status: string;
};

type AdminUserStatus = "active" | "pending" | "suspended";

type AdminAccessState = "none" | "pending" | "suspended" | "banned";

function getAdminAccessState(user: {
  role?: string | null;
  status?: string | null;
  isApproved?: boolean | null;
}): AdminAccessState {
  const role = (user.role ?? "").toUpperCase();
  const status = (user.status ?? "").toUpperCase();

  if (role === "PENDING_ADMIN" || user.isApproved === false) {
    return "pending";
  }

  if (status === "SUSPENDED") {
    return "suspended";
  }

  if (status === "BANNED" || role === "BANNED") {
    return "banned";
  }

  return "none";
}

function normalizeAdminUserStatus(status: string | null | undefined): AdminUserStatus {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "active";
    case "pending":
      return "pending";
    case "suspended":
      return "suspended";
    default:
      return "pending";
  }
}

function formatUsdFromCents(cents: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
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

function toDate(value: string | Date) {
  return typeof value === "string" ? new Date(value) : value;
}

function formatDate(value: string | Date) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClasses(status: string) {
  const lower = status.toLowerCase();

  if (lower === "success" || lower === "completed") {
    return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
  }

  if (lower === "pending") {
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
  }

  if (lower === "failed" || lower === "reversed") {
    return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";
  }

  return "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200";
}

function purposeLabel(purpose: string) {
  return purpose.replace(/_/g, " ").toLowerCase();
}

function IconShell({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: "default" | "soft" | "dark";
  className?: string;
}) {
  const toneClass =
    tone === "dark"
      ? "border-zinc-950 bg-zinc-950 text-white dark:border-white/10 dark:bg-white/5 dark:text-white"
      : tone === "soft"
        ? "border-black/5 bg-background/70 text-foreground backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white"
        : "border-black/5 bg-background text-foreground backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white";

  return (
    <span
      className={[
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border",
        toneClass,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function ActivityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 16h4l2-4 3 7 3-6h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M16 20v-1.5c0-1.9-1.8-3.5-4-3.5s-4 1.6-4 3.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M5 12h14M5 17h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 4h2m6 0h2m-6 0v6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TopUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 5v14m-5-5 5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M7 7h12M15 3l4 4-4 4M17 17H5M9 13l-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M12 2l1.7 5.2L19 9l-5.3 1.8L12 16l-1.7-5.2L5 9l5.3-1.8L12 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BellWaveIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M15.5 17.5H8.5c0-2.4-.8-3.2-1.6-4.3A5.7 5.7 0 0 1 6 10.1V9a6 6 0 1 1 12 0v1.1c0 1.1-.4 2.1-1 3.1-.8 1.1-1.5 1.9-1.5 4.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 17.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TransactionsMark() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="48" className="fill-zinc-950/5 dark:fill-white/10" />
      <circle cx="60" cy="60" r="34" className="fill-zinc-950/5 dark:fill-white/5" />
      <path
        d="M34 55h52M34 67h36M34 43h24"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M81 40l8 8-8 8"
        stroke="currentColor"
        strokeOpacity="0.68"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M39 77c5-8 11-11 21-11 9 0 15 3 21 11"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="43.5" cy="40.5" r="4" className="fill-zinc-950 dark:fill-white" />
    </svg>
  );
}

function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] bg-background/70 p-4 backdrop-blur dark:bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            {label}
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</div>
        </div>
        <IconShell tone="soft">{icon}</IconShell>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{hint}</p>
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-background/70 p-5 backdrop-blur dark:bg-white/5">
      <div className="relative flex min-h-[12rem] items-center justify-between gap-5">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-background dark:bg-white dark:text-zinc-950">
            <SparkIcon />
            Live admin Transactions
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Balanced, clear, and ready to scan</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Balance, notifications, activity, and transfers stay grouped without visual clutter.
            </p>
          </div>
        </div>

        <div className="h-28 w-28 shrink-0 text-foreground/90 dark:text-white/90 sm:h-32 sm:w-32">
          <TransactionsMark />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  count,
  icon,
  action,
}: {
  title: string;
  subtitle: string;
  count: number;
  icon: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        <IconShell tone="soft">{icon}</IconShell>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {action}
        <span className="inline-flex shrink-0 items-center rounded-full bg-background/75 px-3 py-1 text-xs font-semibold text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
          {count}
        </span>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const icon = item.kind === "topup" ? <TopUpIcon /> : <TransferIcon />;

  return (
    <li className="rounded-[1.75rem] bg-background/70 p-4 backdrop-blur dark:bg-white/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <IconShell tone="soft">{icon}</IconShell>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{item.subtitle}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{formatDate(item.createdAt)}</span>
            {item.meta.map((part) => (
              <span key={part} className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-white/5">
                {part}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <span className="block capitalize">{item.amountLabel}</span>
            <span className="mt-1 block text-foreground">{item.amountValue}</span>
          </div>
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
              statusClasses(item.status),
            ].join(" ")}
          >
            {item.status}
          </span>
        </div>
      </div>
    </li>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] bg-background/60 px-6 py-12 text-center backdrop-blur dark:bg-white/5">
      <div className="mx-auto flex w-fit items-center justify-center">
        <IconShell tone="soft">{icon}</IconShell>
      </div>
      <div className="mt-4 text-base font-semibold text-foreground">{title}</div>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  hint,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-[1.75rem] bg-background/70 px-4 py-4 backdrop-blur transition hover:-translate-y-px hover:bg-background dark:bg-white/5 dark:hover:bg-white/[0.07]"
    >
      <span className="flex min-w-0 items-center gap-3">
        <IconShell tone="soft">{icon}</IconShell>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">{hint}</span>
        </span>
      </span>
      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">Open</span>
    </Link>
  );
}

export default async function AdminPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/auth/signin?next=/admin");
  }

  const accessState = getAdminAccessState(sessionUser);

  if (accessState === "pending") {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <AdminPendingApprovalNotice
          email={sessionUser.email ?? null}
          requestedPath="/admin"
          title="Your admin account is waiting for approval"
          description="You are signed in, but a super admin still needs to approve your account before the admin workspace opens."
        />
      </main>
    );
  }

  if (accessState === "suspended") {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <AdminSuspendedNotice
          email={sessionUser.email ?? null}
          requestedPath="/admin"
          title="This admin account is suspended"
          description="Your account is currently suspended, so admin pages are not available right now."
        />
      </main>
    );
  }

  if (accessState === "banned") {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <AdminBannedNotice
          email={sessionUser.email ?? null}
          requestedPath="/admin"
          title="This admin account is banned"
          description="This account is not allowed to access admin pages."
        />
      </main>
    );
  }

  if (!isAdminRole(sessionUser.role)) {
    redirect("/dashboard");
  }

  const data = await getAdminDashboardData(sessionUser);
  const dashboardData = data as typeof data & { creditTransfers?: CreditTransferHistory[] };

  const creditTopUps = data.creditTopUps ?? [];
  const transfers = dashboardData.creditTransfers ?? [];

  const notifications = buildAdminNotifications(data);
  const notificationIds = notifications.map((item) => item.id);

  const user = sessionUser as {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.name ||
    user.email?.split("@")[0] ||
    "Admin";

  const normalizedUsers = (data.users ?? []).map((item) => ({
    ...item,
    status: normalizeAdminUserStatus((item as { status?: string | null }).status),
  }));

  const panelData = {
    ...data,
    users: normalizedUsers,
  };

  const mergedActivity: ActivityItem[] = [
    ...creditTopUps.map((tx) => ({
      id: tx.id,
      kind: "topup" as const,
      createdAt: tx.createdAt,
      title: tx.label,
      subtitle: tx.email,
      meta: [tx.mode, tx.providerStatus].filter(Boolean) as string[],
      amountLabel: formatNaira(tx.amountNgn),
      amountValue: formatUsdFromCents(tx.creditedUsdCents ?? tx.creditedUsd),
      status: tx.status,
    })),
    ...transfers.map((tx) => ({
      id: tx.id,
      kind: "transfer" as const,
      createdAt: tx.createdAt,
      title: tx.recipientLookup,
      subtitle: `From ${tx.senderLookup}`,
      meta: [tx.txRef, tx.note].filter(Boolean) as string[],
      amountLabel: purposeLabel(tx.purpose),
      amountValue: formatUsdFromCents(tx.amountCents),
      status: tx.status,
    })),
  ]
    .sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <main
      className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8"
      style={{
        fontFamily:
          'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="mx-auto w-full max-w-7xl space-y-10">
        <header className="flex items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back, {displayName}
            </h1>
          </div>

          <AdminNotificationsBell notificationIds={notificationIds} />
        </header>

        <div className="rounded-[2rem]">
          <AdminBalancePanel {...panelData} role="admin" />
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile
              label="Live content"
              value={data.opportunities?.length ?? 0}
              icon={<ActivityIcon />}
              hint="Current opportunities in view."
            />
            <StatTile
              label="People"
              value={data.users?.length ?? 0}
              icon={<UsersIcon />}
              hint="Managed user accounts."
            />
            <StatTile
              label="Queue"
              value={data.queueItems?.reduce((sum, item) => sum + item.count, 0) ?? 0}
              icon={<QueueIcon />}
              hint="Items awaiting review."
            />
            <StatTile
              label="Top-ups"
              value={creditTopUps.length}
              icon={<TopUpIcon />}
              hint="Recent funding activity."
            />
          </div>

          <HeroIllustration />
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <QuickAction
            href="/admin/queue"
            icon={<QueueIcon />}
            title="Review queue"
            hint="Open pending items"
          />
          <QuickAction
            href="/admin/users"
            icon={<UsersIcon />}
            title="People"
            hint="Manage accounts"
          />
          <QuickAction
            href="/admin/transactions"
            icon={<TopUpIcon />}
            title="Transactions"
            hint="View the full list"
          />
        </section>

        <section className="space-y-4">
          <SectionHeading
            title="Recent activity"
            subtitle="The latest top-ups and credit movements in one place."
            count={mergedActivity.length}
            icon={<SparkIcon />}
            action={
              <Link
                href="/admin/transactions"
                className="text-sm font-semibold text-zinc-700 transition hover:text-foreground dark:text-zinc-300 dark:hover:text-white"
              >
                See all
              </Link>
            }
          />

          {mergedActivity.length ? (
            <ul className="space-y-3">
              {mergedActivity.map((item) => (
                <ActivityRow key={item.kind + item.id} item={item} />
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nothing here yet"
              description="When activity starts, the newest entries will appear here."
              icon={<SparkIcon />}
            />
          )}
        </section>

        <section className="rounded-[1.75rem] bg-background/60 p-5 backdrop-blur dark:bg-white/5">
          <div className="flex items-start gap-3">
            <IconShell tone="soft">
              <BellWaveIcon />
            </IconShell>
            <div>
              <div className="text-sm font-bold text-foreground">Quiet updates</div>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Important changes stay visible without crowding the interface.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}