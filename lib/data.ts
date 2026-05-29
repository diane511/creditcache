import { db } from "@/lib/db";

export type Opportunity = {
  id: string;
  title: string;
  amount: string;
  category: string;
  deadline: string;
  summary: string;
  verified: boolean;
};

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
  email: string;
  role: string;
  verified: boolean;
  applications: number;
  joinedAt: string;
  lastActiveAt: string | null;
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

function mapPublicOpportunity(record: RawRecord): Opportunity {
  return {
    id: toStringValue(record.id),
    title: toStringValue(record.title ?? record.name, "Untitled opportunity"),
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
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name ?? record.fullName ?? "Unknown user"),
    email: toStringValue(record.email ?? ""),
    role: toStringValue(record.role ?? "User"),
    verified: toBool(record.verified ?? record.isVerified ?? false),
    applications: toNumber(record.applications ?? record.applicationCount ?? 0),
    joinedAt: formatDateValue(record.joinedAt ?? record.createdAt),
    lastActiveAt: record.lastActiveAt ? formatDateValue(record.lastActiveAt) : null,
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

async function loadOpportunityRecords(): Promise<RawRecord[]> {
  const opportunityDelegate = pickDelegate(
    (db as any).opportunity,
    (db as any).opportunities,
  );

  return safeFindMany(
    opportunityDelegate,
    {
      orderBy: { createdAt: "desc" },
    },
    "opportunities",
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
    {
      orderBy: { createdAt: "desc" },
    },
    "vault records",
  );
}

export const opportunities: Opportunity[] = (await loadOpportunityRecords()).map(
  mapPublicOpportunity,
);

export const vaultRecords: VaultRecord[] = (await loadVaultRecords()).map(
  mapVaultRecord,
);

export async function getAdminDashboardData() {
  const opportunityDelegate = pickDelegate(
    (db as any).opportunity,
    (db as any).opportunities,
  );

  const guidanceDelegate = pickDelegate(
    (db as any).guidancePost,
    (db as any).guidancePosts,
    (db as any).guidance,
  );

  const userDelegate = pickDelegate(
    (db as any).user,
    (db as any).users,
  );

  const queueDelegate = pickDelegate(
    (db as any).queueItem,
    (db as any).queueItems,
    (db as any).verificationQueueItem,
    (db as any).verificationQueueItems,
  );

  const vaultDelegate = pickDelegate(
    (db as any).vaultRecord,
    (db as any).vaultRecords,
    (db as any).vaultItem,
    (db as any).vaultItems,
  );

  const [opportunitiesRaw, guidanceRaw, usersRaw, queueRaw, vaultRaw] =
    await Promise.all([
      safeFindMany(
        opportunityDelegate,
        {
          orderBy: { createdAt: "desc" },
        },
        "opportunities",
      ),
      safeFindMany(
        guidanceDelegate,
        {
          orderBy: { createdAt: "desc" },
        },
        "guidance posts",
      ),
      safeFindMany(
        userDelegate,
        {
          orderBy: { createdAt: "desc" },
        },
        "users",
      ),
      safeFindMany(
        queueDelegate,
        {
          orderBy: { createdAt: "desc" },
        },
        "queue items",
      ),
      safeFindMany(
        vaultDelegate,
        {
          orderBy: { createdAt: "desc" },
        },
        "vault records",
      ),
    ]);

  const adminOpportunities = opportunitiesRaw.map(mapAdminOpportunity);
  const guidancePosts = guidanceRaw.map(mapGuidance);
  const users = usersRaw.map(mapUser);
  const queueItems = queueRaw.map(mapQueueItem);
  const vaultRecordsMapped = vaultRaw.map(mapVaultRecord);

  return {
    opportunities: adminOpportunities,
    guidancePosts,
    users,
    queueItems,
    vaultRecords: vaultRecordsMapped,
  };
}