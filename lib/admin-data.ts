// main/lib/admin-data.ts
import { db } from "@/lib/db";
import { buildManagedUserWhere, type AdminScopeViewer } from "@/lib/auth";

export type AdminOpportunity = {
  id: string;
  title: string;
  amount: string;
  category: string;
  deadline: string;
  status: string;
  summary: string;
  verified: boolean;
  winnerName: string | null;
};

export type AdminGuidance = {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  status: string;
};

export type AdminUser = {
  id: string;
  name: string;
  displayName: string;
  legalName: string;
  username: string;
  email: string;
  role: string;
  status: string;
  verified: boolean;
  applications: number;
  joinedAt: string;
  lastActiveAt: string | null;
  invitedByAdminId: string | null;
};

export type QueueItem = {
  id: string;
  label: string;
  count: number;
  status: string;
  priority: string;
};

export type CreditTopUpHistory = {
  id: string;
  txRef: string;
  email: string;
  label: string;
  mode: string;
  amountNgn: number;
  creditedUsdCents: number;
  creditedUsd: number;
  currency: string;
  status: string;
  providerStatus: string | null;
  verifiedAt: string | null;
  creditedAt: string | null;
  createdAt: string;
};

export type CreditTransferHistory = {
  id: string;
  txRef: string;
  senderLookup: string;
  recipientLookup: string;
  purpose: string;
  amountCents: number;
  status: string;
  createdAt: string;
  note?: string | null;
};

export type AdminDashboardData = {
  opportunities: AdminOpportunity[];
  guidancePosts: AdminGuidance[];
  users: AdminUser[];
  queueItems: QueueItem[];
  creditTopUps: CreditTopUpHistory[];
  creditTransfers: CreditTransferHistory[];
};

type RawRecord = Record<string, any>;

type FindManyDelegate = {
  findMany: (args?: any) => Promise<RawRecord[]>;
};

const loggedQueryIssues = new Set<string>();

const IS_BUILD =
  process.env.NEXT_PHASE === "phase-production-build" || process.env.VERCEL === "1";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
const IS_LIVE_LIBSQL = /^libsql:\/\//i.test(DATABASE_URL);
const HAS_TURSO_AUTH = Boolean(process.env.TURSO_AUTH_TOKEN);

function shouldSkipDbAccess() {
  return IS_BUILD && IS_LIVE_LIBSQL && !HAS_TURSO_AUTH;
}

function emptyDashboardData(): AdminDashboardData {
  return {
    opportunities: [],
    guidancePosts: [],
    users: [],
    queueItems: [],
    creditTopUps: [],
    creditTransfers: [],
  };
}

function pickDelegate(...candidates: Array<unknown>): FindManyDelegate | undefined {
  return candidates.find((candidate): candidate is FindManyDelegate => {
    return Boolean(candidate) && typeof (candidate as FindManyDelegate).findMany === "function";
  });
}

function logQueryIssue(label: string, error: unknown) {
  if (loggedQueryIssues.has(label)) return;
  loggedQueryIssues.add(label);

  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : String(error);

  if (
    /no such table|Unknown argument|Unknown field|401|fetch failed|expected non-null body source/i.test(
      message,
    )
  ) {
    console.warn(`[admin-data] ${label} unavailable (${message}). Returning empty array.`);
    return;
  }

  console.error(`[admin-data] Failed to load ${label}:`, error);
}

async function safeFindMany(
  delegate: FindManyDelegate | undefined,
  args: any,
  label: string,
): Promise<RawRecord[]> {
  if (shouldSkipDbAccess()) {
    console.warn(`[admin-data] Skipping ${label} during build because Turso auth is unavailable.`);
    return [];
  }

  if (!delegate) {
    console.warn(`[admin-data] Missing Prisma delegate for ${label}. Returning empty array.`);
    return [];
  }

  try {
    return await delegate.findMany(args);
  } catch (error) {
    logQueryIssue(label, error);
    return [];
  }
}

function toStringValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function formatDateValue(value: unknown): string {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return toStringValue(value, "—");

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toBool(value: unknown): boolean {
  return Boolean(value);
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getDisplayUserRole(record: RawRecord): string {
  const rawRole = toStringValue(record.role ?? "").toUpperCase();
  const approved = toBool(record.isApproved ?? false);

  if (rawRole === "SUPER_ADMIN") return "Super admin";
  if (rawRole === "ADMIN") return approved ? "Admin" : "Pending admin";
  if (rawRole === "PENDING_ADMIN") return "Pending admin";
  if (rawRole === "USER") return "User";
  return "User";
}

function getDisplayUserStatus(record: RawRecord): string {
  const raw = toStringValue(record.status ?? "").toUpperCase();

  if (raw === "ACTIVE") return "Active";
  if (raw === "PENDING") return "Pending";
  if (raw === "SUSPENDED") return "Suspended";

  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : "Pending";
}

function getTimestampValue(value: unknown): number | null {
  if (!value) return null;

  if (value instanceof Date) {
    const ts = value.getTime();
    return Number.isNaN(ts) ? null : ts;
  }

  if (typeof value === "number" && Number.isFinite(value)) return value;

  const parsed = new Date(String(value)).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function getRecordTimestamp(record: RawRecord, fields: string[]): number | null {
  for (const field of fields) {
    const ts = getTimestampValue(record[field]);
    if (ts !== null) return ts;
  }
  return null;
}

function sortRecordsByDate(
  records: RawRecord[],
  fields: string[],
  direction: "asc" | "desc" = "desc",
): RawRecord[] {
  const sorted = [...records];

  sorted.sort((a, b) => {
    const aTs = getRecordTimestamp(a, fields);
    const bTs = getRecordTimestamp(b, fields);

    if (aTs === null && bTs === null) return 0;
    if (aTs === null) return 1;
    if (bTs === null) return -1;

    return direction === "desc" ? bTs - aTs : aTs - bTs;
  });

  return sorted;
}

function mapOpportunity(record: RawRecord): AdminOpportunity {
  const title = toStringValue(record.title ?? record.name, "Untitled opportunity");
  const amount = toStringValue(
    record.amount ?? record.prizeAmount ?? record.value ?? record.reward ?? "—",
  );
  const category = toStringValue(record.category ?? record.type ?? "General");
  const deadline = formatDateValue(record.deadline ?? record.dueDate ?? record.closingDate);
  const status = toStringValue(record.status ?? "Draft");
  const summary = toStringValue(record.summary ?? record.description ?? "");
  const verified = toBool(record.verified ?? record.isVerified ?? false);

  const winnerName = record.winnerName ?? record.winner?.name ?? record.assignedWinner?.name ?? null;

  return {
    id: toStringValue(record.id),
    title,
    amount,
    category,
    deadline,
    status,
    summary,
    verified,
    winnerName: winnerName ? toStringValue(winnerName) : null,
  };
}

function mapGuidance(record: RawRecord): AdminGuidance {
  return {
    id: toStringValue(record.id),
    title: toStringValue(record.title ?? "Untitled guidance"),
    category: toStringValue(record.category ?? record.topic ?? "General"),
    excerpt: toStringValue(record.excerpt ?? record.summary ?? record.description ?? ""),
    readTime: toStringValue(record.readTime ?? record.read_time ?? "—"),
    status: toStringValue(record.status ?? "Draft"),
  };
}

function mapUser(record: RawRecord): AdminUser {
  const displayName = toStringValue(
    record.displayName ?? record.legalName ?? record.username ?? record.email ?? "Unknown user",
  );

  return {
    id: toStringValue(record.id),
    name: displayName,
    displayName: toStringValue(record.displayName ?? ""),
    legalName: toStringValue(record.legalName ?? ""),
    username: toStringValue(record.username ?? ""),
    email: toStringValue(record.email ?? ""),
    role: getDisplayUserRole(record),
    status: getDisplayUserStatus(record),
    verified: toBool(record.verified ?? record.isVerified ?? false),
    applications: toNumber(record.applications ?? record.applicationCount ?? 0),
    joinedAt: formatDateValue(record.createdAt ?? record.joinedAt),
    lastActiveAt: record.lastActiveAt ? formatDateValue(record.lastActiveAt) : null,
    invitedByAdminId: record.invitedByAdminId ? toStringValue(record.invitedByAdminId) : null,
  };
}

function mapQueueItem(record: RawRecord): QueueItem {
  return {
    id: toStringValue(record.id),
    label: toStringValue(record.label ?? record.name ?? "Queue item"),
    count: toNumber(record.count ?? record.total ?? 0),
    status: toStringValue(record.status ?? "Pending review"),
    priority: toStringValue(record.priority ?? "Normal"),
  };
}

function mapCreditTopUp(record: RawRecord): CreditTopUpHistory {
  const creditedUsdCents = toNumber(record.creditedUsdCents ?? record.creditedUsd ?? 0);

  return {
    id: toStringValue(record.id),
    txRef: toStringValue(record.txRef ?? record.reference ?? ""),
    email: toStringValue(record.email ?? ""),
    label: toStringValue(record.label ?? "Top up"),
    mode: toStringValue(record.mode ?? "pack"),
    amountNgn: toNumber(record.amountNgn ?? 0),
    creditedUsdCents,
    creditedUsd: creditedUsdCents,
    currency: toStringValue(record.currency ?? "NGN"),
    status: toStringValue(record.status ?? "pending"),
    providerStatus: record.providerStatus ? toStringValue(record.providerStatus) : null,
    verifiedAt: record.verifiedAt ? formatDateValue(record.verifiedAt) : null,
    creditedAt: record.creditedAt ? formatDateValue(record.creditedAt) : null,
    createdAt: formatDateValue(record.createdAt),
  };
}

function mapCreditTransfer(record: RawRecord): CreditTransferHistory {
  return {
    id: toStringValue(record.id),
    txRef: toStringValue(record.txRef ?? record.reference ?? ""),
    senderLookup: toStringValue(
      record.senderLookup ??
        record.senderName ??
        record.senderEmail ??
        record.sender?.name ??
        record.sender?.email ??
        "Unknown sender",
    ),
    recipientLookup: toStringValue(
      record.recipientLookup ??
        record.recipientName ??
        record.recipientEmail ??
        record.recipient?.name ??
        record.recipient?.email ??
        "Unknown recipient",
    ),
    purpose: toStringValue(record.purpose ?? "general"),
    amountCents: toNumber(record.amountCents ?? record.amount ?? 0),
    status: toStringValue(record.status ?? "pending"),
    createdAt: formatDateValue(record.createdAt),
    note: record.note ? toStringValue(record.note) : null,
  };
}

function getViewerIdentity(viewer?: AdminScopeViewer) {
  const viewerRecord = (viewer ?? {}) as RawRecord;

  return {
    id: toStringValue(viewerRecord.id ?? ""),
    email: toStringValue(viewerRecord.email ?? ""),
    role: toStringValue(viewerRecord.role ?? "").toUpperCase(),
  };
}

function isSuperAdmin(viewer?: AdminScopeViewer) {
  return getViewerIdentity(viewer).role === "SUPER_ADMIN";
}

function valueMatches(target: string, candidate: unknown, caseInsensitive = false) {
  if (!target) return false;
  const normalizedCandidate = toStringValue(candidate);
  if (!normalizedCandidate) return false;

  return caseInsensitive
    ? normalizedCandidate.toLowerCase() === target.toLowerCase()
    : normalizedCandidate === target;
}

function recordMatchesViewer(record: RawRecord, viewer?: AdminScopeViewer) {
  if (!viewer || isSuperAdmin(viewer)) return true;

  const { id, email } = getViewerIdentity(viewer);

  if (id) {
    const directIdFields = [
      "createdById",
      "adminId",
      "ownerId",
      "userId",
      "authorId",
      "initiatedById",
      "processedById",
      "verifiedById",
      "actorId",
      "performedById",
      "requestedById",
      "createdByAdminId",
      "handledById",
      "submittedById",
      "updatedById",
      "senderId",
      "recipientId",
    ];

    if (directIdFields.some((field) => valueMatches(id, record[field]))) {
      return true;
    }

    const nestedIdFields = [
      "createdBy",
      "admin",
      "owner",
      "user",
      "author",
      "initiatedBy",
      "processedBy",
      "verifiedBy",
      "actor",
      "performedBy",
      "requestedBy",
      "sender",
      "recipient",
    ];

    for (const field of nestedIdFields) {
      const nested = record[field];
      if (nested && typeof nested === "object") {
        const nestedId = (nested as RawRecord).id;
        if (valueMatches(id, nestedId)) return true;
      }
    }
  }

  if (email) {
    const emailFields = [
      "email",
      "adminEmail",
      "ownerEmail",
      "userEmail",
      "createdByEmail",
      "requestedByEmail",
      "senderEmail",
      "recipientEmail",
    ];

    if (emailFields.some((field) => valueMatches(email, record[field], true))) {
      return true;
    }

    const nestedEmailFields = ["createdBy", "admin", "owner", "user", "requestedBy", "sender", "recipient"];

    for (const field of nestedEmailFields) {
      const nested = record[field];
      if (nested && typeof nested === "object") {
        const nestedEmail = (nested as RawRecord).email;
        if (valueMatches(email, nestedEmail, true)) return true;
      }
    }
  }

  return false;
}

function filterRecordsForViewer(records: RawRecord[], viewer?: AdminScopeViewer) {
  if (!viewer || isSuperAdmin(viewer)) return records;
  return records.filter((record) => recordMatchesViewer(record, viewer));
}

export async function getAdminDashboardData(viewer?: AdminScopeViewer): Promise<AdminDashboardData> {
  if (shouldSkipDbAccess()) {
    return emptyDashboardData();
  }

  const opportunityDelegate = pickDelegate((db as any).opportunity, (db as any).opportunities);

  const guidanceDelegate = pickDelegate(
    (db as any).guidancePost,
    (db as any).guidancePosts,
    (db as any).guidance,
  );

  const userDelegate = pickDelegate((db as any).user, (db as any).users);

  const queueDelegate = pickDelegate(
    (db as any).reviewQueueItem,
    (db as any).reviewQueueItems,
    (db as any).queueItem,
    (db as any).queueItems,
    (db as any).verificationQueueItem,
    (db as any).verificationQueueItems,
  );

  const creditTopUpDelegate = pickDelegate((db as any).creditTopUp, (db as any).creditTopUps);

  const creditTransferDelegate = pickDelegate(
    (db as any).creditTransfer,
    (db as any).creditTransfers,
    (db as any).transfer,
    (db as any).transfers,
  );

  const userWhere = buildManagedUserWhere(viewer);

  const [opportunitiesRaw, guidanceRaw, usersRaw, queueRaw, creditTopUpsRaw, creditTransfersRaw] =
    await Promise.all([
      safeFindMany(opportunityDelegate, {}, "opportunities"),
      safeFindMany(guidanceDelegate, {}, "guidance posts"),
      safeFindMany(userDelegate, { where: userWhere }, "users"),
      safeFindMany(queueDelegate, {}, "queue items"),
      safeFindMany(creditTopUpDelegate, {}, "credit top-ups"),
      safeFindMany(creditTransferDelegate, {}, "credit transfers"),
    ]);

  const opportunities = sortRecordsByDate(opportunitiesRaw, [
    "createdAt",
    "updatedAt",
    "publishedAt",
    "deadline",
  ]).map(mapOpportunity);

  const guidancePosts = sortRecordsByDate(guidanceRaw, ["createdAt", "updatedAt", "publishedAt"]).map(
    mapGuidance,
  );

  const users = sortRecordsByDate(usersRaw, ["createdAt", "joinedAt", "updatedAt"]).map(mapUser);

  const queueItems = sortRecordsByDate(queueRaw, ["createdAt", "submittedAt", "updatedAt"]).map(
    mapQueueItem,
  );

  const creditTopUps = filterRecordsForViewer(
    sortRecordsByDate(creditTopUpsRaw, ["createdAt", "verifiedAt", "creditedAt", "updatedAt"]),
    viewer,
  ).map(mapCreditTopUp);

  const creditTransfers = filterRecordsForViewer(
    sortRecordsByDate(creditTransfersRaw, ["createdAt", "updatedAt"]),
    viewer,
  ).map(mapCreditTransfer);

  return {
    opportunities,
    guidancePosts,
    users,
    queueItems,
    creditTopUps,
    creditTransfers,
  };
}