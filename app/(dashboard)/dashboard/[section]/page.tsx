import { notFound } from "next/navigation";

import { PaymentsSection } from "../PaymentsSection";
import { HistorySection } from "../HistorySection";
import { SecuritySection } from "../SecuritySection";
import { SettingsSection } from "../SettingsSection";
import { ApplicationsSection } from "../ApplicationsSection";
import { ActionsSection } from "../ActionsSection";
import { NotificationsSection } from "../NotificationsSection";

type SavedCard = {
  brand: string;
  last4: string;
  type: string;
  expiry: string;
  status: string;
};

type PaymentMethod = {
  name: string;
  note: string;
  status: string;
};

type HistoryItem = {
  title: string;
  meta: string;
  tone: "primary" | "good" | "warn";
};

type SettingRow = {
  label: string;
  value: string;
};

type NotificationItem = {
  title: string;
  message: string;
  time: string;
  read?: boolean;
  href?: string;
};

type ApplicationItem = Record<string, unknown>;
type OpportunityItem = Record<string, unknown>;
type ScamReportItem = {
  status?: string;
  [key: string]: unknown;
};

type DashboardSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
  savedCards?: SavedCard[];
  paymentMethods?: PaymentMethod[];
  recentHistory?: HistoryItem[];
  settingsRows?: SettingRow[];
  applications?: ApplicationItem[];
  opportunities?: OpportunityItem[];
  scamReports?: ScamReportItem[];
  notifications?: NotificationItem[];
};

const VALID_SECTIONS = [
  "payments",
  "history",
  "security",
  "settings",
  "applications",
  "actions",
  "notifications",
] as const;

type ValidSection = (typeof VALID_SECTIONS)[number];

function isValidSection(value: string): value is ValidSection {
  return (VALID_SECTIONS as readonly string[]).includes(value);
}

export default async function DashboardSectionPage({
  params,
  savedCards = [],
  paymentMethods = [],
  recentHistory = [],
  settingsRows = [],
  applications = [],
  opportunities = [],
  scamReports = [],
  notifications = [],
}: DashboardSectionPageProps) {
  const resolvedParams = await params;
  const section = resolvedParams.section;

  if (!isValidSection(section)) {
    notFound();
  }

  const deadlines = opportunities.slice(0, 4);
  const openReportsCount = scamReports.filter(
    (item) => item.status !== "Resolved"
  ).length;

  return (
    <div className="-ml-6 w-[calc(100%+1.5rem)] min-w-0 max-w-none overflow-x-hidden sm:mx-0 sm:w-full sm:max-w-full">
      {section === "payments" ? (
        <PaymentsSection
          savedCards={savedCards}
          paymentMethods={paymentMethods}
        />
      ) : null}

      {section === "history" ? (
        <HistorySection
          recentHistory={recentHistory}
          applicationsCount={applications.length}
          unresolvedReportsCount={openReportsCount}
        />
      ) : null}

      {section === "security" ? (
        <SecuritySection
          scamReports={scamReports}
          openReportsCount={openReportsCount}
        />
      ) : null}

      {section === "settings" ? (
        <SettingsSection settingsRows={settingsRows} />
      ) : null}

      {section === "applications" ? (
        <ApplicationsSection
          applications={applications}
          deadlines={deadlines}
        />
      ) : null}

      {section === "actions" ? <ActionsSection /> : null}

      {section === "notifications" ? (
        <NotificationsSection notifications={notifications} />
      ) : null}
    </div>
  );
}