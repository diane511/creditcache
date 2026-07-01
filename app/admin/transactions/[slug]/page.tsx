import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/admin-data";

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

type TopUpTransactionItem = {
  id: string;
  slug: string;
  kind: "topup";
  status: string;
  createdAt: string | Date;
  title: string;
  subtitle: string;
  meta: string[];
  primaryAmount: string;
  secondaryAmount?: string;
  routeLabel: string;
  source: {
    type: "topup";
    value: CreditTopUpHistory;
  };
};

type TransferTransactionItem = {
  id: string;
  slug: string;
  kind: "transfer";
  status: string;
  createdAt: string | Date;
  title: string;
  subtitle: string;
  meta: string[];
  primaryAmount: string;
  secondaryAmount?: string;
  routeLabel: string;
  source: {
    type: "transfer";
    value: CreditTransferHistory;
  };
};

type TransactionItem = TopUpTransactionItem | TransferTransactionItem;

function isTopUpTransaction(item: TransactionItem): item is TopUpTransactionItem {
  return item.kind === "topup";
}

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

function formatDateLong(value: string | Date) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return typeof value === "string" ? value : "";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}

function formatKind(kind: TransactionKind) {
  return kind === "topup" ? "TOP UP" : "TRANSFER";
}

function normalizeStatus(status: string) {
  return status.toLowerCase().trim();
}

function statusClass(status: string) {
  const s = normalizeStatus(status);

  if (["success", "successful", "completed", "done", "paid"].includes(s)) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
  }

  if (["pending", "processing", "queued", "in-progress", "awaiting"].includes(s)) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
  }

  if (["failed", "reversed", "cancelled", "canceled", "declined", "error"].includes(s)) {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20";
  }

  return "bg-muted text-muted-foreground border-border";
}

function statusLabel(status: string) {
  const s = normalizeStatus(status);

  if (s === "success") return "SUCCESSFUL";
  if (s === "successful") return "SUCCESSFUL";
  if (s === "completed") return "COMPLETED";
  if (s === "pending") return "PENDING";
  if (s === "processing") return "PROCESSING";
  if (s === "failed") return "FAILED";
  if (s === "reversed") return "REVERSED";
  if (s === "cancelled" || s === "canceled") return "CANCELLED";

  return status.toUpperCase();
}

function buildTopUpItem(tx: CreditTopUpHistory): TopUpTransactionItem {
  return {
    id: `topup-${tx.id}`,
    slug: buildSlug("topup", tx.label, tx.id),
    kind: "topup",
    status: tx.status,
    createdAt: tx.createdAt,
    title: tx.label,
    subtitle: tx.email,
    meta: [tx.mode, tx.providerStatus].filter(Boolean) as string[],
    primaryAmount: formatNaira(tx.amountNgn),
    secondaryAmount: formatUsdFromCents(tx.creditedUsdCents ?? tx.creditedUsd ?? 0),
    routeLabel: "top-up",
    source: {
      type: "topup",
      value: tx,
    },
  };
}

function buildTransferItem(tx: CreditTransferHistory): TransferTransactionItem {
  return {
    id: `transfer-${tx.id}`,
    slug: buildSlug("transfer", tx.recipientLookup, tx.id),
    kind: "transfer",
    status: tx.status,
    createdAt: tx.createdAt,
    title: tx.recipientLookup,
    subtitle: `From ${tx.senderLookup}`,
    meta: [tx.txRef, tx.note].filter(Boolean) as string[],
    primaryAmount: formatUsdFromCents(tx.amountCents),
    secondaryAmount: tx.purpose ? tx.purpose.replace(/_/g, " ").toUpperCase() : undefined,
    routeLabel: "credit transfer",
    source: {
      type: "transfer",
      value: tx,
    },
  };
}

function buildItems(topUps: CreditTopUpHistory[], transfers: CreditTransferHistory[]) {
  const items: TransactionItem[] = [
    ...topUps.map(buildTopUpItem),
    ...transfers.map(buildTransferItem),
  ];

  return items.sort((a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime());
}

function ReceiptDivider() {
  return <div className="my-3 border-t border-dashed border-border/60" />;
}

function ReceiptRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-0.5">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`text-right text-[12px] ${
          strong ? "font-bold text-foreground" : "font-normal text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ReceiptLine({ children }: { children: ReactNode }) {
  return (
    <div className="w-full text-center font-mono text-[12px] leading-5 text-foreground">
      {children}
    </div>
  );
}

function ReceiptTitle({ children }: { children: ReactNode }) {
  return (
    <div className="w-full text-center font-mono text-[18px] font-bold tracking-[0.22em] text-foreground">
      {children}
    </div>
  );
}

function ReceiptSubTitle({ children }: { children: ReactNode }) {
  return (
    <div className="w-full text-center font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
      {children}
    </div>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M14 6 8 12l6 6"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TopUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M12 5v10" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path
        d="M8.5 8.5 12 5l3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19h14" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path d="M5 7h12" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path
        d="m13 3 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M19 17H7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path
        d="m11 13-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/auth/signin?next=/admin/transactions");
  if (!isAdminRole(sessionUser.role)) redirect("/dashboard");

  const data = await getAdminDashboardData(sessionUser);
  const dashboardData = data as typeof data & { creditTransfers?: CreditTransferHistory[] };

  const items = buildItems(
    (data.creditTopUps ?? []) as CreditTopUpHistory[],
    (dashboardData.creditTransfers ?? []) as CreditTransferHistory[]
  );

  const item = items.find((entry) => entry.slug === slug);

  if (!item) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground print:bg-background print:px-0 print:py-0">
      <div className="mx-auto flex w-full max-w-[460px] flex-col gap-4 print:max-w-none">
        <div className="print:hidden">
          <Link
            href="/admin/transactions"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 underline underline-offset-4"
          >
            <BackIcon />
            Back to transactions
          </Link>
        </div>

        <section className="relative mx-auto w-full max-w-[380px] bg-card px-5 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-border/60 print:mx-0 print:max-w-none print:shadow-none print:ring-0">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-[radial-gradient(circle_at_10px_0,transparent_0,transparent_9px,theme(colors.background)_10px)] bg-[length:20px_100%] bg-repeat-x" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-[radial-gradient(circle_at_10px_100%,transparent_0,transparent_9px,theme(colors.background)_10px)] bg-[length:20px_100%] bg-repeat-x" />

          <div className="flex flex-col items-center">
            <ReceiptTitle>RECEIPT</ReceiptTitle>
            <ReceiptSubTitle>OFFICIAL TRANSACTION RECORD</ReceiptSubTitle>

            <div className="mt-3 text-center font-mono text-[11px] leading-5 text-muted-foreground">
              <div>ADMIN LEDGER</div>
              <div>TRANSACTION VERIFICATION COPY</div>
            </div>
          </div>

          <ReceiptDivider />

          <div className="font-mono text-[12px] leading-5 text-foreground">
            <ReceiptLine>{item.title.toUpperCase()}</ReceiptLine>
            <ReceiptLine>{item.subtitle}</ReceiptLine>
          </div>

          <ReceiptDivider />

          <div className="font-mono text-[12px] leading-5 text-foreground">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">TYPE</span>
              <span className="flex items-center gap-1.5 text-[12px] font-bold">
                {item.kind === "topup" ? <TopUpIcon /> : <TransferIcon />}
                {formatKind(item.kind)}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">STATUS</span>
              <span
                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.14em] ${statusClass(item.status)}`}
              >
                {statusLabel(item.status)}
              </span>
            </div>

            <ReceiptRow label="DATE" value={formatDateLong(item.createdAt)} />
            <ReceiptRow label="REFERENCE" value={item.source.value.id} />
            <ReceiptRow label="SLUG" value={item.slug} />
          </div>

          <ReceiptDivider />

          <div className="text-center font-mono">
            <div className="text-[11px] tracking-[0.2em] text-muted-foreground">AMOUNT</div>
            <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {item.primaryAmount}
            </div>
            <div className="mt-1 text-[12px] tracking-[0.16em] text-muted-foreground">
              {item.secondaryAmount ?? "—"}
            </div>
          </div>

          <ReceiptDivider />

          <div className="font-mono text-[12px] leading-5 text-foreground">
            {isTopUpTransaction(item) ? (
              <>
                <ReceiptRow label="CUSTOMER" value={item.source.value.label} />
                <ReceiptRow label="EMAIL" value={item.source.value.email} />
                <ReceiptRow label="MODE" value={item.source.value.mode ?? "—"} />
                <ReceiptRow label="PROVIDER" value={item.source.value.providerStatus ?? "—"} />
                <ReceiptRow
                  label="NAIRA AMOUNT"
                  value={formatNaira(item.source.value.amountNgn)}
                  strong
                />
                <ReceiptRow
                  label="USD CREDITED"
                  value={formatUsdFromCents(
                    item.source.value.creditedUsdCents ?? item.source.value.creditedUsd ?? 0
                  )}
                  strong
                />
              </>
            ) : (
              <>
                <ReceiptRow label="SENDER" value={item.source.value.senderLookup} />
                <ReceiptRow label="RECIPIENT" value={item.source.value.recipientLookup} />
                <ReceiptRow label="TRANSFER REF" value={item.source.value.txRef} />
                <ReceiptRow
                  label="PURPOSE"
                  value={item.source.value.purpose?.replace(/_/g, " ").toUpperCase() || "—"}
                />
                <ReceiptRow
                  label="AMOUNT"
                  value={formatUsdFromCents(item.source.value.amountCents)}
                  strong
                />
                <ReceiptRow label="NOTE" value={item.source.value.note || "—"} />
              </>
            )}
          </div>

          <ReceiptDivider />

          <div className="font-mono text-[11px] leading-5 text-muted-foreground">
            <div className="text-center">THANK YOU</div>
            <div className="mt-1 text-center">KEEP THIS COPY FOR YOUR RECORDS</div>
            <div className="mt-3 text-center">VERIFIED BY ADMIN SYSTEM</div>
          </div>
        </section>
      </div>
    </main>
  );
}