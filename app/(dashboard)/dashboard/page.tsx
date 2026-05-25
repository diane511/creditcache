"use client";

import { useEffect, useMemo, useState } from "react";

import { SignInForm } from "../../auth/sign-in/ign-in-form";
import { ProfileSection } from "../profile/ProfileSection";
import { PaymentsSection } from "./PaymentsSection";
import { HistorySection } from "./HistorySection";
import { SecuritySection } from "./SecuritySection";
import { SettingsSection } from "./SettingsSection";
import { ApplicationsSection } from "./ApplicationsSection";
import { ActionsSection } from "./ActionsSection";
import type { ProfileData } from "../profile/ProfileSection";

type DashboardSectionId =
  | "profile"
  | "payments"
  | "history"
  | "security"
  | "settings"
  | "applications"
  | "actions";

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

type ApplicationItem = Record<string, unknown>;
type OpportunityItem = Record<string, unknown>;
type ScamReportItem = {
  status?: string;
  [key: string]: unknown;
};

type DashboardPageProps = {
  isAuthenticated?: boolean;
  profile?: ProfileData | null;
  savedCards?: SavedCard[];
  paymentMethods?: PaymentMethod[];
  recentHistory?: HistoryItem[];
  settingsRows?: SettingRow[];
  applications?: ApplicationItem[];
  opportunities?: OpportunityItem[];
  scamReports?: ScamReportItem[];
};

function getActiveSectionFromHash(): DashboardSectionId {
  if (typeof window === "undefined") return "profile";

  const hash = window.location.hash.replace("#", "");
  const validSections: DashboardSectionId[] = [
    "profile",
    "payments",
    "history",
    "security",
    "settings",
    "applications",
    "actions",
  ];

  return validSections.includes(hash as DashboardSectionId)
    ? (hash as DashboardSectionId)
    : "profile";
}

export default function DashboardPage({
  isAuthenticated = false,
  profile = null,
  savedCards = [],
  paymentMethods = [],
  recentHistory = [],
  settingsRows = [],
  applications = [],
  opportunities = [],
  scamReports = [],
}: DashboardPageProps) {
  const [activeSection, setActiveSection] =
    useState<DashboardSectionId>("profile");

  useEffect(() => {
    const syncSection = () => setActiveSection(getActiveSectionFromHash());
    syncSection();
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  const deadlines = useMemo(() => opportunities.slice(0, 4), [opportunities]);

  const openReportsCount = useMemo(
    () => scamReports.filter((item) => item.status !== "Resolved").length,
    [scamReports]
  );

  function renderActiveSection() {
    switch (activeSection) {
      case "profile":
        return <ProfileSection profile={profile} />;

      case "payments":
        return (
          <PaymentsSection
            savedCards={savedCards}
            paymentMethods={paymentMethods}
          />
        );

      case "history":
        return (
          <HistorySection
            recentHistory={recentHistory}
            applicationsCount={applications.length}
            unresolvedReportsCount={openReportsCount}
          />
        );

      case "security":
        return (
          <SecuritySection
            scamReports={scamReports}
            openReportsCount={openReportsCount}
          />
        );

      case "settings":
        return <SettingsSection settingsRows={settingsRows} />;

      case "applications":
        return (
          <ApplicationsSection
            applications={applications}
            deadlines={deadlines}
          />
        );

      case "actions":
        return <ActionsSection />;

      default:
        return <ProfileSection profile={profile} />;
    }
  }

  return (
    <div className="-ml-6 w-[calc(100%+1.5rem)] min-w-0 max-w-none overflow-x-hidden sm:mx-0 sm:w-full sm:max-w-full">
      {!isAuthenticated ? (
        <SignInForm nextPath="/dashboard" variant="page" />
      ) : (
        renderActiveSection()
      )}
    </div>
  );
}