// main/app/(dashboard)/dashboard/dashboard-types.ts
export type SavedCard = {
  brand: string;
  last4: string;
  type: string;
  expiry: string;
  status: string;
};

export type PaymentMethod = {
  name: string;
  note: string;
  status: string;
};

export type HistoryItem = {
  title: string;
  meta: string;
  tone: "primary" | "good" | "warn";
};

export type SettingRow = {
  label: string;
  value: string;
};

export type NotificationItem = {
  title: string;
  message: string;
  time: string;
  read?: boolean;
  href?: string;
};

export type ApplicationItem = {
  id: string | number;
  opportunityTitle: string;
  applicantName: string;
  status: string;
  deadline: string;
};

export type DeadlineItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  amount: string;
  deadline: string;
};

export type ScamReport = {
  id: string | number;
  topic: string;
  channel: string;
  description: string;
  status?: string;
};