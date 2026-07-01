// main/app/(dashboard)/dashboard/[section]/page.tsx
import { notFound } from "next/navigation";

import { PaymentsSection } from "../PaymentsSection";
import { HistorySection } from "../HistorySection";
import { SecuritySection } from "../SecuritySection";
import { SettingsSection } from "../SettingsSection";
import { ApplicationsSection } from "../ApplicationsSection";
import { ActionsSection } from "../ActionsSection";
import { NotificationsSection } from "../NotificationsSection";

import type {
  ApplicationItem,
  DeadlineItem,
  HistoryItem,
  NotificationItem,
  PaymentMethod,
  SavedCard,
  ScamReport,
  SettingRow,
} from "../dashboard-types";

type DashboardSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
  savedCards?: SavedCard[];
  paymentMethods?: PaymentMethod[];
  recentHistory?: HistoryItem[];
  settingsRows?: SettingRow[];
  applications?: ApplicationItem[];
  opportunities?: DeadlineItem[];
  scamReports?: ScamReport[];
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