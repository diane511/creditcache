export type SavedCard = {
  id?: string;
  brand: string;
  last4: string;
  type: string;
  expiry: string;
  status: string;
};

export type PaymentMethod = {
  id?: string;
  name: string;
  note: string;
  status: string;
};

export type HistoryItem = {
  id?: string;
  title: string;
  meta: string;
  amount?: number;
  currency?: string;
  tone?: "primary" | "good" | "warn" | "danger";
  href?: string;
};

export type GrantOpportunity = {
  id?: string;
  title: string;
  provider: string;
  amount?: string;
  deadline?: string;
  description: string;
  eligibility?: "eligible" | "review" | "closed" | "ineligible";
  href?: string;
  tags?: string[];
};

export type NotificationItem = {
  id?: string;
  title: string;
  meta: string;
  read?: boolean;
  href?: string;
};

export type AnnouncementItem = {
  id?: string;
  title: string;
  meta: string;
  href?: string;
  label?: string;
};

export type ScamReportItem = {
  status?: string;
  [key: string]: unknown;
};

export type DashboardPageProps = {
  balance?: number;
  currency?: string;
  balanceLabel?: string;
  savedCards?: SavedCard[];
  paymentMethods?: PaymentMethod[];
  recentHistory?: HistoryItem[];
  applications?: unknown[];
  opportunities?: GrantOpportunity[];
  scamReports?: ScamReportItem[];
  notifications?: NotificationItem[];
  loginNotifications?: NotificationItem[];
  announcements?: AnnouncementItem[];
  firstLogin?: boolean;
  welcomeName?: string;
  legalName?: string;
  dateOfBirth?: string;
  username?: string;
  onboardingComplete?: boolean;
  email?: string;
};

export type ProfileFormData = {
  legalName: string;
  dateOfBirth: string;
  username: string;
};

export type SubmitProfileResult = {
  success?: boolean;
  message?: string;
  code?: string;
  suggestions?: string[];
};