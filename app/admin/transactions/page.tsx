import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/admin-data";

type QueryValue = string | string[] | undefined;
type SearchParams = Record<string, QueryValue>;

type CreditTopUpHistory = {
  id: string;
  label: string;
  email: string;
  mode?: string | null;
  providerStatus?: string | null;
  amountNgn: number;
  creditedUsdCents?: number | null;
  creditedUsd?: number | null;
  status: string;
  createdAt: string | Date;
};

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

type TransactionKind = "topup" | "transfer";

type TransactionItem = {
  id: string;
  slug: string;
  kind: TransactionKind;
  status: string;
  createdAt: string | Date;
  dateKey: string;
  title: string;
  subtitle: string;
  meta: string[];
  primaryAmount: string;
  secondaryAmount?: string;
};

const PAGE_SIZE = 20;

const first = (v: QueryValue) => (Array.isArray(v) ? v[0] : v);
const clean = (v?: string) => (v ?? "").trim().toLowerCase();

function toDate(value: string | Date) {
  return typeof value === "string" ? new Date(value) : value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSlug(kind: TransactionKind, title: string, id: string) {
  return `${kind}-${slugify(title)}-${id.slice(0, 8)}`;
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

function formatDate(value: string | Date) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function dateKey(value: string | Date) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Africa/Lagos",
  }).format(new Date());
}

function buildUrl(pathname: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function statusTone(status: string) {
  const s = status.toLowerCase();

  if (["success", "completed", "successful"].includes(s)) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }
  if (["pending", "processing", "queued"].includes(s)) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
  }
  if (["failed", "reversed", "cancelled"].includes(s)) {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  }
  return "bg-muted text-muted-foreground";
}

function kindTone(kind: TransactionKind) {
  return kind === "topup"
    ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
    : "bg-violet-500/10 text-violet-700 dark:text-violet-300";
}

function kindLabel(kind: TransactionKind) {
  return kind === "topup" ? "Top-up" : "Transfer";
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LedgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M6 5.5h12A1.5 1.5 0 0 1 19.5 7v10A1.5 1.5 0 0 1 18 18.5H6A1.5 1.5 0 0 1 4.5 17V7A1.5 1.5 0 0 1 6 5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TodayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M7 4.5V7M17 4.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M6 6.5h12A1.5 1.5 0 0 1 19.5 8v10A1.5 1.5 0 0 1 18 19.5H6A1.5 1.5 0 0 1 4.5 18V8A1.5 1.5 0 0 1 6 6.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M7.5 11.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TopUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M12 5v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M8.5 8.5 12 5l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m13 3 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 17H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m11 13-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={["h-4 w-4", className].filter(Boolean).join(" ")} fill="none" aria-hidden="true">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Bubble({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground shadow-sm">
      {children}
    </span>
  );
}

function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`.trim()}>
      {children}
    </span>
  );
}

function buildItems(topUps: CreditTopUpHistory[], transfers: CreditTransferHistory[]) {
  const items: TransactionItem[] = [
    ...topUps.map((tx) => ({
      id: `topup-${tx.id}`,
      slug: buildSlug("topup", tx.label, tx.id),
      kind: "topup" as const,
      status: tx.status,
      createdAt: tx.createdAt,
      dateKey: dateKey(tx.createdAt),
      title: tx.label,
      subtitle: tx.email,
      meta: [tx.mode, tx.providerStatus].filter(Boolean) as string[],
      primaryAmount: formatNaira(tx.amountNgn),
      secondaryAmount: formatUsdFromCents(tx.creditedUsdCents ?? tx.creditedUsd ?? 0),
    })),
    ...transfers.map((tx) => ({
      id: `transfer-${tx.id}`,
      slug: buildSlug("transfer", tx.recipientLookup, tx.id),
      kind: "transfer" as const,
      status: tx.status,
      createdAt: tx.createdAt,
      dateKey: dateKey(tx.createdAt),
      title: tx.recipientLookup,
      subtitle: `From ${tx.senderLookup}`,
      meta: [tx.txRef, tx.note].filter(Boolean) as string[],
      primaryAmount: formatUsdFromCents(tx.amountCents),
      secondaryAmount: tx.purpose ? tx.purpose.replace(/_/g, " ").toLowerCase() : undefined,
    })),
  ];

  return items.sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());
}

function statusOptions(items: TransactionItem[]) {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.status, (counts.get(item.status) ?? 0) + 1);

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([status, count]) => ({ status, count }));
}

function groupVisible(items: TransactionItem[]) {
  const recent = items.slice(0, 4);
  const rest = items.slice(4);
  const today = todayKey();

  return {
    recent,
    todayItems: rest.filter((item) => item.dateKey === today),
    earlierItems: rest.filter((item) => item.dateKey !== today),
  };
}

function TransactionCard({ item }: { item: TransactionItem }) {
  return (
    <li>
      <Link href={`/admin/transactions/${item.slug}`} className="block">
        <article className="rounded-[1.5rem] bg-card p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md">
          <div className="flex items-center gap-3">
            <Bubble>{item.kind === "topup" ? <TopUpIcon /> : <TransferIcon />}</Bubble>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <Pill className={statusTone(item.status)}>{item.status}</Pill>
                <Pill className={kindTone(item.kind)}>{kindLabel(item.kind)}</Pill>
              </div>

              <p className="mt-1 truncate text-sm text-muted-foreground">{item.subtitle}</p>
              {item.meta.length ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">{item.meta.join(" • ")}</p>
              ) : null}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold tracking-tight text-foreground">{item.primaryAmount}</div>
              {item.secondaryAmount ? (
                <div className="mt-0.5 text-xs text-muted-foreground">{item.secondaryAmount}</div>
              ) : null}
              <div className="mt-0.5 text-xs text-muted-foreground">{formatDate(item.createdAt)}</div>
            </div>
          </div>
        </article>
      </Link>
    </li>
  );
}

function Section({
  icon,
  title,
  count,
  items,
}: {
  icon: ReactNode;
  title: string;
  count: number;
  items: TransactionItem[];
}) {
  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
          <Bubble>{icon}</Bubble>
          <span>{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => (
          <TransactionCard key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[1.8rem] bg-card px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-foreground shadow-sm">
        <LedgerIcon />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">No transactions found</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        Try a broader search, switch type or status, or clear filters to bring back the full ledger.
      </p>
    </div>
  );
}

export default async function AdminTransactionsPage({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/auth/signin?next=/admin/transactions");
  if (!isAdminRole(sessionUser.role)) redirect("/dashboard");

  const data = await getAdminDashboardData(sessionUser);
  const dashboardData = data as typeof data & { creditTransfers?: CreditTransferHistory[] };

  const items = buildItems((data.creditTopUps ?? []) as CreditTopUpHistory[], (dashboardData.creditTransfers ?? []) as CreditTransferHistory[]);

  const q = clean(first(searchParams.q));
  const status = clean(first(searchParams.status));
  const kind = clean(first(searchParams.kind));
  const pageRaw = Number.parseInt(first(searchParams.page) ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const filtered = items.filter((item) => {
    const haystack = [
      item.title,
      item.subtitle,
      item.status,
      item.primaryAmount,
      item.secondaryAmount ?? "",
      ...item.meta,
      item.kind,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!q || haystack.includes(q)) &&
      (!status || item.status.toLowerCase() === status) &&
      (!kind || item.kind === kind)
    );
  });

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > visible.length;
  const { recent, todayItems, earlierItems } = groupVisible(visible);

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

  const pathname = "/admin/transactions";

  const chip = (label: string, next: Record<string, string | number | undefined>) => (
    <Link
      href={buildUrl(pathname, {
        q: q || undefined,
        status: status || undefined,
        kind: kind || undefined,
        page: 1,
        ...next,
      })}
      className={`inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition ${
        next.kind !== undefined
          ? kind === next.kind
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:text-foreground"
          : next.status !== undefined
            ? status === clean(String(next.status))
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
            : !kind && !status
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="space-y-4 px-1 sm:px-2 lg:px-3">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Transactions</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Clean ledger view for reviewing top-ups and credit transfers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{displayName}</span>
            <span className="opacity-60">·</span>
            <span>Admin dashboard</span>
          </div>
        </header>

        <section className="rounded-[1.8rem] bg-card/90 p-4 shadow-sm backdrop-blur-xl sm:p-5">
          <form action={pathname} method="get" className="flex flex-col gap-3 md:flex-row md:items-center">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            {kind ? <input type="hidden" name="kind" value={kind} /> : null}

            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-muted-foreground">
                <SearchIcon />
              </span>
              <input
                name="q"
                defaultValue={q}
                placeholder="Search name, email, reference, note, status..."
                className="h-12 w-full rounded-full bg-muted/80 pl-11 pr-4 text-[15px] text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:bg-background"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-95"
            >
              <FilterIcon />
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {chip("All", {})}
            {chip("Top-ups", { kind: "topup" })}
            {chip("Transfers", { kind: "transfer" })}
            {statusOptions(items).slice(0, 6).map((option) => chip(option.status, { status: option.status }))}
          </div>
        </section>

        <section className="space-y-6">
          {visible.length ? (
            <>
              <Section icon={<ClockIcon />} title="Recent" count={recent.length} items={recent} />
              <Section icon={<TodayIcon />} title="Today" count={todayItems.length} items={todayItems} />
              <Section icon={<LedgerIcon />} title="Earlier" count={earlierItems.length} items={earlierItems} />
            </>
          ) : (
            <EmptyState />
          )}
        </section>

        {hasMore ? (
          <div className="pb-4 text-center">
            <Link
              href={buildUrl(pathname, {
                q: q || undefined,
                status: status || undefined,
                kind: kind || undefined,
                page: page + 1,
              })}
              className="inline-flex items-center gap-2 rounded-full bg-muted px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-px hover:bg-muted/80"
            >
              Load more
              <ChevronRightIcon />
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}