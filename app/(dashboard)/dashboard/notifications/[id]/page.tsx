import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Fragment, type ReactNode } from "react";

type Params = Promise<{
  id: string;
}>;

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

function isIsoLikeDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value);
}

function formatDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMaybeDate(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (isIsoLikeDate(trimmed)) return formatDate(trimmed);
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime()) && /[-:TZ]/.test(trimmed)) {
    return formatDate(parsed);
  }
  return trimmed;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getKind(meta: Record<string, unknown>, type: string | null) {
  return text(meta.kind, type ?? "account");
}

function isLikelyPdfUrl(value: string) {
  const v = value.trim();
  return /^https?:\/\//i.test(v) || v.startsWith("/") || /\.pdf(\?|#|$)/i.test(v);
}

function normalizeAttachmentUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return isLikelyPdfUrl(trimmed) ? trimmed : "";
}

function findPdfLikeValue(input: unknown, visited = new WeakSet<object>()): string {
  if (!input || typeof input !== "object") return "";

  const obj = input as Record<string, unknown>;
  if (visited.has(obj)) return "";
  visited.add(obj);

  const preferredKeys = [
    "pdfUrl",
    "pdf_url",
    "receiptPdf",
    "receipt_pdf",
    "attachmentPdf",
    "attachment_pdf",
    "attachmentUrl",
    "attachment_url",
    "fileUrl",
    "file_url",
    "documentUrl",
    "document_url",
    "downloadUrl",
    "download_url",
    "receiptUrl",
    "receipt_url",
    "url",
    "href",
    "path",
    "file",
    "attachment",
  ];

  for (const key of preferredKeys) {
    const direct = obj[key];
    const normalized = normalizeAttachmentUrl(direct);
    if (normalized) return normalized;
  }

  for (const value of Object.values(obj)) {
    if (typeof value === "string") {
      const normalized = normalizeAttachmentUrl(value);
      if (normalized) return normalized;
      continue;
    }

    if (value && typeof value === "object") {
      const nested = findPdfLikeValue(value, visited);
      if (nested) return nested;
    }
  }

  return "";
}

function getAttachmentUrl(metadata: Record<string, unknown>, metaText: string) {
  const fromMetadata = findPdfLikeValue(metadata);
  if (fromMetadata) return fromMetadata;

  const fromMetaText = normalizeAttachmentUrl(metaText);
  if (fromMetaText) return fromMetaText;

  return "";
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isTitleCaseWord(word: string) {
  return /^[A-Z][a-z]+(?:-[A-Z][a-z]+)?$/.test(word);
}

function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 9l-5 4 5 4" />
      <path d="M19 19v-3a7 7 0 0 0-7-7H5" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9l5 4-5 4" />
      <path d="M5 19v-3a7 7 0 0 1 7-7h7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4 transition-transform duration-200 group-open:rotate-180"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2">
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 shadow-sm dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-7 w-7"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 2h7l5 5v15H7z" />
        <path d="M14 2v5h5" />
        <path d="M9 13h6" />
        <path d="M9 16h6" />
        <path d="M9 19h4" />
      </svg>

      <span
        className="absolute right-0 top-0 h-4 w-4 rounded-tr-2xl bg-red-200/90 dark:bg-red-800/70"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
      />
    </div>
  );
}

function ExternalArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function RichText({
  textValue,
  companyName,
  subject,
  senderName,
  recipientName,
}: {
  textValue: string;
  companyName?: string;
  subject?: string;
  senderName?: string;
  recipientName?: string;
}) {
  const patterns: Array<{
    regex: RegExp;
    render: (match: string, key: string) => ReactNode;
  }> = [
    {
      regex: /\bhttps?:\/\/[^\s<]+/gi,
      render: (match, key) => (
        <a
          key={key}
          href={match}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-600 underline decoration-sky-500 underline-offset-2 hover:text-sky-500 dark:text-sky-400"
        >
          {match}
        </a>
      ),
    },
    {
      regex: /\b(?:\d{1,2}:\d{2}\s?(?:AM|PM|am|pm)|(?:[01]?\d|2[0-3]):[0-5]\d)\b/g,
      render: (match, key) => (
        <strong key={key} className="font-semibold text-foreground">
          {match}
        </strong>
      ),
    },
    {
      regex: /\b(?:\$|USD\s?)\d[\d,]*(?:\.\d{2})?\b/g,
      render: (match, key) => (
        <strong key={key} className="font-semibold text-foreground">
          {match}
        </strong>
      ),
    },
  ];

  if (companyName?.trim()) {
    patterns.push({
      regex: new RegExp(`\\b${escapeRegExp(companyName)}\\b`, "gi"),
      render: (match, key) => (
        <strong key={key} className="font-semibold text-foreground">
          {match}
        </strong>
      ),
    });
  }

  if (subject?.trim()) {
    patterns.push({
      regex: new RegExp(`\\b${escapeRegExp(subject)}\\b`, "gi"),
      render: (match, key) => (
        <strong key={key} className="font-semibold text-foreground">
          {match}
        </strong>
      ),
    });
  }

  if (senderName?.trim()) {
    patterns.push({
      regex: new RegExp(`\\b${escapeRegExp(senderName)}\\b`, "gi"),
      render: (match, key) => (
        <strong key={key} className="font-semibold text-foreground">
          {match}
        </strong>
      ),
    });
  }

  if (recipientName?.trim()) {
    patterns.push({
      regex: new RegExp(`\\b${escapeRegExp(recipientName)}\\b`, "gi"),
      render: (match, key) => (
        <strong key={key} className="font-semibold text-foreground">
          {match}
        </strong>
      ),
    });
  }

  const lines = textValue.split(/\n+/).filter(Boolean);

  return (
    <>
      {lines.map((line, lineIndex) => {
        const pieces: ReactNode[] = [];
        let cursor = 0;

        while (cursor < line.length) {
          let earliestMatch:
            | {
                start: number;
                end: number;
                match: string;
                renderer: (match: string, key: string) => ReactNode;
              }
            | null = null;

          for (const pattern of patterns) {
            pattern.regex.lastIndex = 0;
            const m = pattern.regex.exec(line.slice(cursor));
            if (!m || m.index === undefined) continue;

            const start = cursor + m.index;
            const end = start + m[0].length;

            if (!earliestMatch || start < earliestMatch.start) {
              earliestMatch = {
                start,
                end,
                match: m[0],
                renderer: pattern.render,
              };
            }
          }

          if (!earliestMatch) {
            const rest = line.slice(cursor);
            const tokens = rest.split(/(\s+)/);
            pieces.push(
              ...tokens.map((token, idx) => {
                if (
                  isTitleCaseWord(token) ||
                  (token === token.toUpperCase() && /[A-Z]/.test(token))
                ) {
                  return (
                    <strong
                      key={`${lineIndex}-${cursor}-${idx}`}
                      className="font-semibold text-foreground"
                    >
                      {token}
                    </strong>
                  );
                }
                return token;
              }),
            );
            break;
          }

          if (earliestMatch.start > cursor) {
            const before = line.slice(cursor, earliestMatch.start);
            const tokens = before.split(/(\s+)/);
            pieces.push(
              ...tokens.map((token, idx) => {
                if (
                  isTitleCaseWord(token) ||
                  (token === token.toUpperCase() && /[A-Z]/.test(token))
                ) {
                  return (
                    <strong
                      key={`${lineIndex}-${cursor}-b-${idx}`}
                      className="font-semibold text-foreground"
                    >
                      {token}
                    </strong>
                  );
                }
                return token;
              }),
            );
          }

          pieces.push(
            earliestMatch.renderer(
              earliestMatch.match,
              `${lineIndex}-${earliestMatch.start}-${earliestMatch.end}`,
            ),
          );

          cursor = earliestMatch.end;
        }

        return (
          <p key={lineIndex} className="whitespace-pre-wrap">
            {pieces.map((piece, idx) => (
              <Fragment key={idx}>{piece}</Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function CompactIdentityPanel({
  senderName,
  senderUsername,
  recipientName,
  recipientUsername,
  companyName,
}: {
  senderName: string;
  senderUsername: string;
  recipientName: string;
  recipientUsername: string;
  companyName: string;
}) {
  return (
    <details className="group rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-zinc-950">
      <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-sm font-semibold text-foreground shadow-sm dark:border-gray-800 dark:bg-zinc-900">
          {(senderName || "S").slice(0, 1).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              From
            </span>
            <span className="break-words text-base font-bold text-foreground">
              {senderName}
            </span>
            {senderUsername ? (
              <span className="break-words text-sm text-muted-foreground">
                &lt;{senderUsername}&gt;
              </span>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">Tap to see recipient details</p>
        </div>

        <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 p-1.5 text-muted-foreground shadow-sm dark:border-gray-800 dark:bg-zinc-900">
          <ChevronIcon />
        </span>
      </summary>

      <div className="border-t border-gray-200 px-4 py-4 dark:border-gray-800">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-zinc-900/40">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              From
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-foreground">{senderName}</p>
            {senderUsername ? (
              <p className="mt-1 break-words text-sm text-muted-foreground">{senderUsername}</p>
            ) : null}
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-zinc-900/40">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              To
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-foreground">{recipientName}</p>
            {recipientUsername ? (
              <p className="mt-1 break-words text-sm text-muted-foreground">
                {recipientUsername}
              </p>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{companyName}</p>
      </div>
    </details>
  );
}

function AttachmentPreview({
  attachmentUrl,
  attachmentLabel,
}: {
  attachmentUrl: string;
  attachmentLabel: string;
}) {
  if (!attachmentUrl) {
    return (
      <section className="pt-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Attachment
        </h2>

        <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-zinc-950">
          <p className="text-sm text-muted-foreground">
            No attachment was found for this notification.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-2">
      <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
        Attachment
      </h2>

      <a
        href={attachmentUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={attachmentLabel}
        className="mt-3 block rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 dark:border-gray-800 dark:bg-zinc-950"
      >
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="relative shrink-0">
            <PdfIcon />
            <div className="absolute -bottom-2 -right-2 rounded-full border border-red-200 bg-white px-2 py-0.5 text-[10px] font-bold tracking-[0.18em] text-red-700 shadow-sm dark:border-red-900/40 dark:bg-zinc-950 dark:text-red-300">
              PDF
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {attachmentLabel}
              </p>
              <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                Document
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              The attachment is linked in the whole card.
            </p>
          </div>

          <span
            aria-hidden="true"
            className="shrink-0 rounded-full border border-gray-200 bg-gray-50 p-2 text-muted-foreground dark:border-gray-800 dark:bg-zinc-900"
          >
            <ExternalArrowIcon />
          </span>
        </div>
      </a>
    </section>
  );
}

function DetailsCard({
  txRef,
  receiptNumber,
  eventName,
}: {
  txRef: string;
  receiptNumber: string;
  eventName: string;
}) {
  const items = [
    txRef ? { label: "Reference", value: txRef } : null,
    receiptNumber ? { label: "Receipt No", value: receiptNumber } : null,
    eventName ? { label: "Event", value: eventName } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  if (!items.length) return null;

  return (
    <section className="pt-2">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm dark:border-gray-800 dark:from-zinc-950 dark:to-zinc-900/40">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-muted-foreground shadow-sm dark:border-gray-800 dark:bg-zinc-950">
            <DotIcon />
          </span>
          <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Details
          </h2>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-zinc-950">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={`px-4 py-3 ${index !== items.length - 1 ? "border-b border-gray-200 dark:border-gray-800" : ""}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-1 break-all text-sm font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Page({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin?next=/dashboard/notifications");
  }

  const { id } = await params;

  const event = await prisma.activityEvent.findFirst({
    where: {
      id,
      entityType: "USER",
      entityId: user.id,
    },
    select: {
      id: true,
      title: true,
      meta: true,
      type: true,
      metadata: true,
      createdAt: true,
    },
  });

  if (!event) {
    redirect("/dashboard/notifications");
  }

  const meta = asRecord(event.metadata);
  const kind = getKind(meta, event.type);

  const purpose = text(meta.purpose, "Normal transfer");
  const txRef = text(meta.txRef, "");
  const receiptNumber = text(meta.receiptNumber, txRef || event.id);

  const senderName = text(meta.senderDisplayName, text(meta.senderName, "Credit Cache"));
  const senderUsername = text(meta.senderUsername, "");
  const recipientName = text(meta.recipientDisplayName, text(meta.recipientName, "You"));
  const recipientUsername = text(meta.recipientUsername, "");
  const companyName = text(meta.companyName, "Credit Cache");
  const eventName = text(meta.eventName, "");
  const note = text(meta.note, "");
  const message = text(meta.message, event.meta ?? event.title);

  const amountCents = numberValue(meta.amountCents);
  const issuedAt = formatMaybeDate(meta.issuedAt) || formatDate(event.createdAt);

  const isReceipt =
    kind.toLowerCase().includes("receipt") || kind.toLowerCase().includes("credit_receipt");

  const isAward =
    kind.toLowerCase().includes("transfer") ||
    kind.toLowerCase().includes("winning") ||
    kind.toLowerCase().includes("sweepstake") ||
    kind.toLowerCase().includes("scholarship") ||
    kind.toLowerCase().includes("sponsorship") ||
    kind.toLowerCase().includes("funding");

  const attachmentUrl =
    isReceipt || isAward
      ? `/dashboard/notifications/${event.id}/receipt/pdf`
      : getAttachmentUrl(meta, text(event.meta, ""));

  const attachmentLabel = isReceipt
    ? "PDF receipt"
    : isAward
      ? "PDF attachment"
      : "Attachment";

  const salutation = recipientName ? `Dear ${recipientName},` : "Dear Winner,";

  const signatureLine = "With steady regards,";
  const signatureName = "The Credit Cache Records Desk";
  const signatureTag = "Clear records. Clean delivery.";

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-start gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
          <Link
            href="/dashboard/notifications"
            aria-label="Back to notifications"
            className="mt-1 shrink-0 rounded-full border border-gray-200 bg-white p-2 text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md dark:border-gray-800 dark:bg-zinc-950"
          >
            <BackIcon />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Notification
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {purpose}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-foreground shadow-sm dark:border-gray-800 dark:bg-zinc-950">
                {isReceipt ? "Credit receipt" : "Award notification"}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm dark:border-gray-800 dark:bg-zinc-950">
                <span>{issuedAt}</span>
                <LockIcon />
              </span>
            </div>
          </div>
        </header>

        <main className="w-full py-5">
          <article className="w-full space-y-5">
            <CompactIdentityPanel
              senderName={senderName}
              senderUsername={senderUsername}
              recipientName={recipientName}
              recipientUsername={recipientUsername}
              companyName={companyName}
            />

            <section className="space-y-4 pt-2 text-[15px] leading-7 text-foreground">
              <p className="text-base leading-7 text-foreground">{salutation}</p>

              <div className="space-y-4">
                <RichText
                  textValue={message}
                  companyName={companyName}
                  subject={purpose}
                  senderName={senderName}
                  recipientName={recipientName}
                />

                {isAward && amountCents ? (
                  <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:from-zinc-950 dark:to-zinc-900/40">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Award amount
                    </p>
                    <p className="mt-2 text-xl font-semibold text-foreground">
                      {formatCurrency(amountCents, "USD")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {companyName ? `From ${companyName}` : ""}
                      {companyName && eventName ? " · " : ""}
                      {eventName ? `For ${eventName}` : ""}
                    </p>
                  </div>
                ) : null}

                {note ? (
                  <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:from-zinc-950 dark:to-zinc-900/40">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Note
                    </p>
                    <div className="mt-3 text-sm leading-7 text-muted-foreground">
                      <RichText
                        textValue={note}
                        companyName={companyName}
                        subject={purpose}
                        senderName={senderName}
                        recipientName={recipientName}
                      />
                    </div>
                  </div>
                ) : null}

                <p className="text-muted-foreground">
                  Please keep this notice for your records. The PDF receipt is attached below.
                </p>
              </div>
            </section>

            <DetailsCard txRef={txRef} receiptNumber={receiptNumber} eventName={eventName} />

            <AttachmentPreview attachmentUrl={attachmentUrl} attachmentLabel={attachmentLabel} />

            <footer className="border-t border-gray-200 pt-3 dark:border-gray-800">
              <p className="text-sm font-semibold text-foreground">{signatureLine}</p>
              <p className="mt-1 font-semibold text-foreground">{signatureName}</p>
              <p className="text-sm text-muted-foreground">{signatureTag}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {companyName} · Official notification record
              </p>
            </footer>

            <section className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                aria-label="Reply"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-zinc-950"
              >
                <ReplyIcon />
                Reply
              </button>
              <button
                type="button"
                aria-label="Forward"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-zinc-950"
              >
                <ForwardIcon />
                Forward
              </button>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
}