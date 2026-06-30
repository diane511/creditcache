import type {
  AdminGuidance,
  AdminOpportunity,
  AdminUser,
  CreditTopUpHistory,
  QueueItem,
} from "@/lib/admin-data";

export type NotificationDetail = {
  label: string;
  value: string;
};

export type AdminNotificationType =
  | "security"
  | "grant"
  | "announcement"
  | "account";

export type AdminNotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  type: AdminNotificationType;
  href: string;
  label?: string;
  details: NotificationDetail[];
};

type DashboardData = {
  opportunities: AdminOpportunity[];
  guidancePosts: AdminGuidance[];
  users: AdminUser[];
  queueItems: QueueItem[];
  creditTopUps: CreditTopUpHistory[];
};

function text(value: unknown, fallback = "—"): string {
  if (value === null || value === undefined) return fallback;
  const str = String(value).trim();
  return str.length ? str : fallback;
}

function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "NGN" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

function rankTime(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildDetails(entries: Array<[string, unknown]>): NotificationDetail[] {
  return entries
    .map(([label, value]) => ({
      label,
      value: text(value),
    }))
    .filter((item) => item.value !== "—");
}

export function buildAdminNotifications(data: DashboardData): AdminNotificationItem[] {
  const items: AdminNotificationItem[] = [];

  for (const topUp of data.creditTopUps) {
    const id = `credit-topup-${topUp.id}`;

    items.push({
      id,
      title: `${text(topUp.label, "Top up")} ${text(topUp.status).toLowerCase()}`,
      message: `${text(topUp.email, "A user")} topped up ${formatMoney(topUp.amountNgn, topUp.currency)}.`,
      time: text(topUp.createdAt, "Recently"),
      type: "account",
      href: `/admin/notifications/${id}`,
      label: "Credit top-up",
      details: buildDetails([
        ["Transaction reference", topUp.txRef],
        ["Email", topUp.email],
        ["Label", topUp.label],
        ["Mode", topUp.mode],
        ["Amount (NGN)", formatMoney(topUp.amountNgn, "NGN")],
        ["Credited (USD)", topUp.creditedUsd],
        ["Currency", topUp.currency],
        ["Status", topUp.status],
        ["Provider status", topUp.providerStatus],
        ["Verified at", topUp.verifiedAt],
        ["Credited at", topUp.creditedAt],
        ["Created at", topUp.createdAt],
      ]),
    });
  }

  for (const user of data.users) {
    const id = `user-${user.id}`;

    items.push({
      id,
      title: `${text(user.name, "New user")} joined`,
      message: `${text(user.email, "A user")} joined on ${text(user.joinedAt, "recently")}.`,
      time: text(user.joinedAt, "Recently"),
      type: "account",
      href: `/admin/notifications/${id}`,
      label: "User",
      details: buildDetails([
        ["Name", user.name],
        ["Email", user.email],
        ["Role", user.role],
        ["Verified", user.verified ? "Yes" : "No"],
        ["Applications", user.applications],
        ["Joined at", user.joinedAt],
        ["Last active at", user.lastActiveAt],
      ]),
    });
  }

  for (const opportunity of data.opportunities) {
    const id = `opportunity-${opportunity.id}`;

    items.push({
      id,
      title: text(opportunity.title, "Untitled opportunity"),
      message: `${text(opportunity.category, "General")} opportunity closes on ${text(opportunity.deadline, "soon")}.`,
      time: text(opportunity.deadline, "Recent"),
      type: "grant",
      href: `/admin/notifications/${id}`,
      label: "Opportunity",
      details: buildDetails([
        ["Title", opportunity.title],
        ["Amount", opportunity.amount],
        ["Category", opportunity.category],
        ["Deadline", opportunity.deadline],
        ["Status", opportunity.status],
        ["Summary", opportunity.summary],
        ["Verified", opportunity.verified ? "Yes" : "No"],
        ["Winner", opportunity.winnerName],
      ]),
    });
  }

  for (const guidance of data.guidancePosts) {
    const id = `guidance-${guidance.id}`;

    items.push({
      id,
      title: text(guidance.title, "Untitled guidance"),
      message: `${text(guidance.category, "General")} guidance is ${text(guidance.status, "draft").toLowerCase()}.`,
      time: "Recent",
      type: "announcement",
      href: `/admin/notifications/${id}`,
      label: "Guidance",
      details: buildDetails([
        ["Title", guidance.title],
        ["Category", guidance.category],
        ["Excerpt", guidance.excerpt],
        ["Read time", guidance.readTime],
        ["Status", guidance.status],
      ]),
    });
  }

  for (const queueItem of data.queueItems) {
    const id = `queue-${queueItem.id}`;

    items.push({
      id,
      title: text(queueItem.label, "Queue item"),
      message: `${text(queueItem.status, "Pending review")} · ${text(queueItem.priority, "Normal")} priority.`,
      time: "Recent",
      type: "security",
      href: `/admin/notifications/${id}`,
      label: "Queue",
      details: buildDetails([
        ["Label", queueItem.label],
        ["Count", queueItem.count],
        ["Status", queueItem.status],
        ["Priority", queueItem.priority],
      ]),
    });
  }

  return items.sort((a, b) => rankTime(b.time) - rankTime(a.time));
}