// main/lib/data.ts
import { db } from "@/lib/db";

export type Opportunity = {
  id: string;
  slug: string;
  title: string;
  amount: string;
  category: string;
  deadline: string;
  summary: string;
  verified: boolean;
};

export type AdminOpportunity = Opportunity & {
  status: string;
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

export type VaultRecord = {
  id: string;
  title: string;
  amount: string;
  category: string;
  status: string;
  summary: string;
  verified: boolean;
  createdAt: string;
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

function pickDelegate(...candidates: Array<unknown>): FindManyDelegate | undefined {
  return candidates.find((candidate): candidate is FindManyDelegate => {
    return Boolean(candidate) && typeof (candidate as FindManyDelegate).findMany === "function";
  });
}

async function safeFindMany(
  delegate: FindManyDelegate | undefined,
  args: any,
  label: string,
): Promise<RawRecord[]> {
  if (!delegate) {
    console.warn(`[admin-data] Missing Prisma delegate for ${label}. Returning empty array.`);
    return [];
  }

  try {
    return await delegate.findMany(args);
  } catch (error) {
    console.error(`[admin-data] Failed to load ${label}:`, error);
    return [];
  }
}

function toStringValue(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function toSlugValue(value: unknown, fallback = ""): string {
  const base = toStringValue(value, fallback).trim().toLowerCase();

  return (
    base
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "opportunity"
  );
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

function mapPublicOpportunity(record: RawRecord): Opportunity {
  const title = toStringValue(record.title ?? record.name, "Untitled opportunity");

  return {
    id: toStringValue(record.id),
    slug: toSlugValue(record.slug ?? record.handle ?? record.id ?? title, title),
    title,
    amount: toStringValue(
      record.amount ??
        record.prizeAmount ??
        record.value ??
        record.reward ??
        "—",
    ),
    category: toStringValue(record.category ?? record.type ?? "General"),
    deadline: formatDateValue(record.deadline ?? record.dueDate ?? record.closingDate),
    summary: toStringValue(record.summary ?? record.description ?? ""),
    verified: toBool(record.verified ?? record.isVerified ?? false),
  };
}

function mapAdminOpportunity(record: RawRecord): AdminOpportunity {
  const publicOpportunity = mapPublicOpportunity(record);

  const status = toStringValue(record.status ?? "Draft");
  const winnerName =
    record.winnerName ??
    record.winner?.name ??
    record.assignedWinner?.name ??
    null;

  return {
    ...publicOpportunity,
    status,
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
    joinedAt: formatDateValue(record.joinedAt ?? record.createdAt),
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

function mapVaultRecord(record: RawRecord): VaultRecord {
  return {
    id: toStringValue(record.id),
    title: toStringValue(record.title ?? record.name ?? "Untitled record"),
    amount: toStringValue(
      record.amount ??
        record.value ??
        record.balance ??
        record.total ??
        "—",
    ),
    category: toStringValue(record.category ?? record.type ?? "General"),
    status: toStringValue(record.status ?? "Pending"),
    summary: toStringValue(record.summary ?? record.description ?? ""),
    verified: toBool(record.verified ?? record.isVerified ?? false),
    createdAt: formatDateValue(record.createdAt ?? record.created_at ?? record.updatedAt),
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

function getViewerIdentity(viewer?: { id?: string; email?: string; role?: string }) {
  return {
    id: toStringValue(viewer?.id ?? ""),
    email: toStringValue(viewer?.email ?? ""),
    role: toStringValue(viewer?.role ?? "").toUpperCase(),
  };
}

function isSuperAdmin(viewer?: { id?: string; email?: string; role?: string }) {
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

function recordMatchesViewer(record: RawRecord, viewer?: { id?: string; email?: string; role?: string }) {
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

    const nestedEmailFields = [
      "createdBy",
      "admin",
      "owner",
      "user",
      "requestedBy",
      "sender",
      "recipient",
    ];

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

function filterRecordsForViewer(records: RawRecord[], viewer?: { id?: string; email?: string; role?: string }) {
  if (!viewer || isSuperAdmin(viewer)) return records;
  return records.filter((record) => recordMatchesViewer(record, viewer));
}

async function loadOpportunityRecords(): Promise<RawRecord[]> {
  const opportunityDelegate = pickDelegate((db as any).opportunity, (db as any).opportunities);

  return safeFindMany(
    opportunityDelegate,
    { orderBy: { createdAt: "desc" } },
    "opportunities",
  );
}

async function loadGuidanceRecords(): Promise<RawRecord[]> {
  const guidanceDelegate = pickDelegate(
    (db as any).guidancePost,
    (db as any).guidancePosts,
    (db as any).guidance,
  );

  return safeFindMany(
    guidanceDelegate,
    { orderBy: { createdAt: "desc" } },
    "guidance posts",
  );
}

async function loadUserRecords(): Promise<RawRecord[]> {
  const userDelegate = pickDelegate((db as any).user, (db as any).users);

  return safeFindMany(
    userDelegate,
    { orderBy: { createdAt: "desc" } },
    "users",
  );
}

async function loadQueueRecords(): Promise<RawRecord[]> {
  const queueDelegate = pickDelegate(
    (db as any).reviewQueueItem,
    (db as any).reviewQueueItems,
    (db as any).queueItem,
    (db as any).queueItems,
    (db as any).verificationQueueItem,
    (db as any).verificationQueueItems,
  );

  return safeFindMany(
    queueDelegate,
    { orderBy: { createdAt: "desc" } },
    "queue items",
  );
}

async function loadVaultRecords(): Promise<RawRecord[]> {
  const vaultDelegate = pickDelegate(
    (db as any).vaultRecord,
    (db as any).vaultRecords,
    (db as any).vaultItem,
    (db as any).vaultItems,
  );

  return safeFindMany(
    vaultDelegate,
    { orderBy: { createdAt: "desc" } },
    "vault records",
  );
}

async function loadCreditTopUpRecords(): Promise<RawRecord[]> {
  const creditTopUpDelegate = pickDelegate((db as any).creditTopUp, (db as any).creditTopUps);

  return safeFindMany(
    creditTopUpDelegate,
    { orderBy: { createdAt: "desc" } },
    "credit top-ups",
  );
}

async function loadCreditTransferRecords(): Promise<RawRecord[]> {
  const creditTransferDelegate = pickDelegate(
    (db as any).creditTransfer,
    (db as any).creditTransfers,
    (db as any).transfer,
    (db as any).transfers,
  );

  return safeFindMany(
    creditTransferDelegate,
    { orderBy: { createdAt: "desc" } },
    "credit transfers",
  );
}

async function loadGenericRecords(delegateNames: string[], label: string): Promise<RawRecord[]> {
  const delegate = pickDelegate(...delegateNames.map((name) => (db as any)[name]));

  return safeFindMany(
    delegate,
    { orderBy: { createdAt: "desc" } },
    label,
  );
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const records = await loadOpportunityRecords();
  return records.map(mapPublicOpportunity);
}

export async function getScamReports(): Promise<VaultRecord[]> {
  const records = await loadVaultRecords();
  return records.map(mapVaultRecord);
}

export async function getApplications(): Promise<RawRecord[]> {
  return loadGenericRecords(
    ["application", "applications", "applicationRecord", "applicationRecords"],
    "applications",
  );
}

export async function getBlogPosts(): Promise<RawRecord[]> {
  return loadGenericRecords(["blogPost", "blogPosts", "post", "posts"], "blog posts");
}

export async function getPartnerPackages(): Promise<RawRecord[]> {
  return loadGenericRecords(
    ["partnerPackage", "partnerPackages", "package", "packages"],
    "partner packages",
  );
}

export async function getVaultRecords(): Promise<VaultRecord[]> {
  const records = await loadVaultRecords();
  return records.map(mapVaultRecord);
}

export async function getOpportunityBySlug(slug: string): Promise<Opportunity | undefined> {
  const opportunities = await getOpportunities();
  const target = toSlugValue(slug);

  return opportunities.find((opportunity) => {
    return toSlugValue(opportunity.slug) === target || toSlugValue(opportunity.id) === target;
  });
}

export async function relatedOpportunities(slug: string, limit = 3): Promise<Opportunity[]> {
  const opportunities = await getOpportunities();
  const current = opportunities.find(
    (opportunity) => toSlugValue(opportunity.slug) === toSlugValue(slug),
  );

  const ordered = opportunities.filter(
    (opportunity) => toSlugValue(opportunity.slug) !== toSlugValue(slug),
  );

  if (current) {
    const sameCategory = ordered.filter((opportunity) => opportunity.category === current.category);
    const otherCategory = ordered.filter((opportunity) => opportunity.category !== current.category);

    return [...sameCategory, ...otherCategory].slice(0, limit);
  }

  return ordered.slice(0, limit);
}

export async function getAdminDashboardData(viewer?: { id?: string; email?: string; role?: string }): Promise<AdminDashboardData> {
  const [
    opportunitiesRaw,
    guidanceRaw,
    usersRaw,
    queueRaw,
    creditTopUpsRaw,
    creditTransfersRaw,
  ] = await Promise.all([
    loadOpportunityRecords(),
    loadGuidanceRecords(),
    loadUserRecords(),
    loadQueueRecords(),
    loadCreditTopUpRecords(),
    loadCreditTransferRecords(),
  ]);

  const opportunities = opportunitiesRaw.map(mapAdminOpportunity);
  const guidancePosts = guidanceRaw.map(mapGuidance);
  const users = filterRecordsForViewer(usersRaw, viewer).map(mapUser);
  const queueItems = queueRaw.map(mapQueueItem);
  const creditTopUps = filterRecordsForViewer(creditTopUpsRaw, viewer).map(mapCreditTopUp);
  const creditTransfers = filterRecordsForViewer(creditTransfersRaw, viewer).map(mapCreditTransfer);

  return {
    opportunities,
    guidancePosts,
    users,
    queueItems,
    creditTopUps,
    creditTransfers,
  };
}