"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { AdminUser } from "@/lib/admin-data";

type AdminUserWithStatus = AdminUser & {
  status?: "pending" | "active" | "suspended";
};

type TransferPurpose =
  | "WINNING"
  | "SWEEPSTAKE"
  | "SCHOLARSHIP"
  | "SPONSORSHIP"
  | "FUNDING"
  | "NORMAL_TRANSFER";

type Props = {
  open: boolean;
  users?: AdminUserWithStatus[];
  balanceCents: number;
  currencyCode?: string;
  onClose: () => void;
  onSuccess: (nextBalanceCents: number) => void;
};

const TRANSFER_PURPOSES: { value: TransferPurpose; label: string }[] = [
  { value: "WINNING", label: "Winning" },
  { value: "SWEEPSTAKE", label: "Sweepstake" },
  { value: "SCHOLARSHIP", label: "Scholarship" },
  { value: "SPONSORSHIP", label: "Sponsorship" },
  { value: "FUNDING", label: "Funding" },
  { value: "NORMAL_TRANSFER", label: "Normal transfer" },
];

const RESERVED_USERNAME_LIKE_VALUES = new Set([
  "user",
  "users",
  "admin",
  "admins",
  "super-admin",
  "super_admin",
  "pending-admin",
  "pending_admin",
]);

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

function safeText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readMaybeString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLookup(value: unknown) {
  return safeText(value).trim().toLowerCase();
}

function isReservedUsernameLike(value: string) {
  return RESERVED_USERNAME_LIKE_VALUES.has(normalizeLookup(value));
}

function getCandidateString(...values: unknown[]) {
  for (const value of values) {
    const text = readMaybeString(value);
    if (text) return text;
  }

  return "";
}

function getUserId(user: AdminUserWithStatus) {
  const record = user as Record<string, unknown>;
  const nested = (record.user ?? {}) as Record<string, unknown>;
  return getCandidateString(record.id, nested.id);
}

function getUserDisplayName(user: AdminUserWithStatus) {
  const record = user as Record<string, unknown>;
  const nestedUser = (record.user ?? {}) as Record<string, unknown>;

  return getCandidateString(
    record.displayName,
    record.legalName,
    record.fullName,
    record.name,
    nestedUser.displayName,
    nestedUser.legalName,
    nestedUser.fullName,
    nestedUser.name,
  );
}

function getUserUsername(user: AdminUserWithStatus) {
  const record = user as Record<string, unknown>;
  const nestedUser = (record.user ?? {}) as Record<string, unknown>;

  const candidates = [
    readMaybeString(record.username),
    readMaybeString(record.userName),
    readMaybeString(record.handle),
    readMaybeString(nestedUser.username),
    readMaybeString(nestedUser.userName),
    readMaybeString(nestedUser.handle),
  ].filter(Boolean);

  const preferred = candidates.find((value) => !isReservedUsernameLike(value));
  return preferred ?? candidates[0] ?? "";
}

function getUserEmail(user: AdminUserWithStatus) {
  const record = user as Record<string, unknown>;
  const nestedUser = (record.user ?? {}) as Record<string, unknown>;

  return getCandidateString(record.email, nestedUser.email);
}

/**
 * Formats a typed dollar amount with commas as the user types.
 * Examples:
 *   "1" -> "1"
 *   "12" -> "12"
 *   "1234" -> "1,234"
 *   "1234.5" -> "1,234.5"
 *   "1234.56" -> "1,234.56"
 */
function formatDollarInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const wholeRaw = parts[0] ?? "";
  const decimalRaw = parts.slice(1).join("").slice(0, 2);

  const whole = wholeRaw.replace(/^0+(?=\d)/, "");
  const wholeFormatted = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  if (cleaned.includes(".")) {
    return `${wholeFormatted || "0"}.${decimalRaw}`;
  }

  return wholeFormatted || "0";
}

function parseDollarInputToCents(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;

  const num = Number(cleaned);
  if (!Number.isFinite(num)) return NaN;

  return Math.round(num * 100);
}

type RecipientRow = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  searchText: string;
};

export function AdminTransferModal({
  open,
  users = [],
  balanceCents,
  currencyCode = "USD",
  onClose,
  onSuccess,
}: Props) {
  const [transferRecipient, setTransferRecipient] = useState("");
  const [transferPurpose, setTransferPurpose] =
    useState<TransferPurpose>("NORMAL_TRANSFER");
  const [transferAmountDollars, setTransferAmountDollars] = useState("");
  const [transferNote, setTransferNote] = useState("");
  const [transferCompanyName, setTransferCompanyName] = useState("");
  const [transferEventName, setTransferEventName] = useState("");
  const [transferAwardTitle, setTransferAwardTitle] = useState("");
  const [transferPlacement, setTransferPlacement] = useState("");
  const [transferCustomMessage, setTransferCustomMessage] = useState("");
  const [transferReceiptTitle, setTransferReceiptTitle] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTransferRecipient("");
    setTransferPurpose("NORMAL_TRANSFER");
    setTransferAmountDollars("");
    setTransferNote("");
    setTransferCompanyName("");
    setTransferEventName("");
    setTransferAwardTitle("");
    setTransferPlacement("");
    setTransferCustomMessage("");
    setTransferReceiptTitle("");
    setTransferError(null);
    setTransferring(false);
  }, [open]);

  const recipientDirectory = useMemo<RecipientRow[]>(() => {
    return users
      .map((user) => {
        const id = getUserId(user);
        const username = getUserUsername(user);
        const displayName = getUserDisplayName(user) || "User";
        const email = getUserEmail(user);

        const searchText = [id, username, displayName, email]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return {
          id,
          username,
          displayName,
          email,
          searchText,
        };
      })
      .filter((item) => item.id || item.username || item.email || item.displayName);
  }, [users]);

  const normalizedLookup = normalizeLookup(transferRecipient);

  const matchedRecipient = useMemo(() => {
    if (!normalizedLookup) return null;

    return (
      recipientDirectory.find((item) => {
        if (normalizeLookup(item.id) === normalizedLookup) return true;
        if (normalizeLookup(item.username) === normalizedLookup) return true;
        return item.searchText.includes(normalizedLookup);
      }) ?? null
    );
  }, [normalizedLookup, recipientDirectory]);

  const amountCents = parseDollarInputToCents(transferAmountDollars);
  const isAmountValid = Number.isFinite(amountCents) && amountCents > 0;
  const specialPurpose = transferPurpose !== "NORMAL_TRANSFER";

  const recipientPayload =
    matchedRecipient?.id || matchedRecipient?.username || normalizedLookup;

  async function handleSendTransfer() {
    setTransferError(null);

    if (!normalizedLookup) {
      setTransferError("Enter a user id or username.");
      return;
    }

    if (!isAmountValid) {
      setTransferError("Enter a valid transfer amount.");
      return;
    }

    if (amountCents > balanceCents) {
      setTransferError("Transfer amount cannot exceed the current balance.");
      return;
    }

    if (!recipientPayload) {
      setTransferError("Recipient not found.");
      return;
    }

    setTransferring(true);

    try {
      const response = await fetch("/api/admin/transfers", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: recipientPayload,
          recipientId: matchedRecipient?.id || undefined,
          recipientUsername: matchedRecipient?.username || undefined,
          amountCents: Math.round(amountCents),
          purpose: transferPurpose,
          note: transferNote.trim() || undefined,
          companyName: specialPurpose ? transferCompanyName.trim() || undefined : undefined,
          eventName: specialPurpose ? transferEventName.trim() || undefined : undefined,
          awardTitle: specialPurpose ? transferAwardTitle.trim() || undefined : undefined,
          placement: specialPurpose ? transferPlacement.trim() || undefined : undefined,
          customMessage: specialPurpose ? transferCustomMessage.trim() || undefined : undefined,
          receiptTitle: specialPurpose ? transferReceiptTitle.trim() || undefined : undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            error?: string;
            senderBalanceCents?: number;
            senderBalance?: number;
          }
        | null;

      if (!response.ok) {
        setTransferError(data?.error ?? "Transfer failed.");
        return;
      }

      const nextBalance =
        typeof data?.senderBalanceCents === "number"
          ? data.senderBalanceCents
          : typeof data?.senderBalance === "number"
            ? data.senderBalance * 100
            : balanceCents - Math.round(amountCents);

      onSuccess(nextBalance);
      onClose();
    } catch {
      setTransferError("Transfer failed.");
    } finally {
      setTransferring(false);
    }
  }

  const previewRecipient = matchedRecipient
    ? `${matchedRecipient.displayName}${matchedRecipient.username ? ` (@${matchedRecipient.username})` : ""}`
    : transferRecipient.trim() || "recipient";

  if (!open) return null;

  const recipientOptions = recipientDirectory.slice(0, 50);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-zinc-950/60 backdrop-blur-sm sm:items-center">
      <div className="flex h-[100dvh] w-full flex-col rounded-none bg-white shadow-2xl dark:bg-zinc-950 sm:h-auto sm:max-h-[calc(100vh-1rem)] sm:max-w-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-4 pt-4 pb-3 dark:border-white/10 sm:px-5 sm:pt-5 sm:pb-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-xl">
              Send credits
            </h3>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Send balance to a user or another admin using a user id or username.
              Special transfer types add company, event, and receipt details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/5 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
            aria-label="Close transfer modal"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Recipient user id or username
              </span>
              <input
                type="text"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="e.g. user_123 or janedoe"
                list="admin-transfer-recipient-list"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
              />
              <datalist id="admin-transfer-recipient-list">
                {recipientOptions.map((user) => (
                  <Fragment key={user.id || `${user.displayName}-${user.username}`}>
                    {user.id ? (
                      <option
                        value={user.id}
                        label={`${user.displayName}${user.username ? ` (@${user.username})` : ""}`}
                      />
                    ) : null}
                    {user.username ? (
                      <option
                        value={user.username}
                        label={`${user.displayName}${user.id ? ` (${user.id})` : ""}`}
                      />
                    ) : null}
                  </Fragment>
                ))}
              </datalist>
            </label>

            {matchedRecipient ? (
              <div className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                Resolved recipient:{" "}
                <span className="font-semibold text-zinc-950 dark:text-white">
                  {matchedRecipient.displayName}
                </span>{" "}
                <span className="text-zinc-500 dark:text-zinc-400">
                  {matchedRecipient.username ? `(@${matchedRecipient.username})` : ""}
                </span>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Transfer purpose
                </span>
                <select
                  value={transferPurpose}
                  onChange={(e) => setTransferPurpose(e.target.value as TransferPurpose)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:focus:border-white sm:text-sm"
                >
                  {TRANSFER_PURPOSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Amount in dollars
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={transferAmountDollars}
                  onChange={(e) => setTransferAmountDollars(formatDollarInput(e.target.value))}
                  placeholder="e.g. 250.00"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                />
              </label>
            </div>

            {specialPurpose ? (
              <div className="grid gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Special transfer details
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Company / sponsor
                    </span>
                    <input
                      type="text"
                      value={transferCompanyName}
                      onChange={(e) => setTransferCompanyName(e.target.value)}
                      placeholder="e.g. Credit Cache Awards"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Event name
                    </span>
                    <input
                      type="text"
                      value={transferEventName}
                      onChange={(e) => setTransferEventName(e.target.value)}
                      placeholder="e.g. Monthly Sweepstake"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Award title
                    </span>
                    <input
                      type="text"
                      value={transferAwardTitle}
                      onChange={(e) => setTransferAwardTitle(e.target.value)}
                      placeholder="e.g. Congratulations, winner"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                      Placement / rank
                    </span>
                    <input
                      type="text"
                      value={transferPlacement}
                      onChange={(e) => setTransferPlacement(e.target.value)}
                      placeholder="e.g. 3rd sweepstakes user this month"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Custom message
                  </span>
                  <textarea
                    value={transferCustomMessage}
                    onChange={(e) => setTransferCustomMessage(e.target.value)}
                    rows={4}
                    placeholder="e.g. Dear John, congratulations on becoming our 3rd sweepstakes user this month..."
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    Receipt title
                  </span>
                  <input
                    type="text"
                    value={transferReceiptTitle}
                    onChange={(e) => setTransferReceiptTitle(e.target.value)}
                    placeholder="e.g. Credit Cache receipt"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
                  />
                </label>
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Note
              </span>
              <textarea
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                placeholder="Optional note for audit trail"
                rows={4}
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white sm:text-sm"
              />
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            Preview:{" "}
            <span className="font-semibold">
              {isAmountValid ? formatCurrency(amountCents, currencyCode) : "—"}
            </span>{" "}
            to{" "}
            <span className="font-semibold">{previewRecipient}</span>{" "}
            as{" "}
            <span className="font-semibold">
              {TRANSFER_PURPOSES.find((item) => item.value === transferPurpose)?.label}
            </span>
          </div>

          {transferError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {transferError}
            </div>
          ) : null}
        </div>

        <div className="border-t border-black/5 p-4 dark:border-white/10 sm:px-5 sm:py-4">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 sm:w-auto dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSendTransfer}
              disabled={transferring}
              className="inline-flex w-full items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            >
              {transferring ? "Sending..." : "Send credits"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTransferModal;