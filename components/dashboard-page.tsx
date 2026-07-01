// main/components/dashboard-page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardOnboarding } from "./dashboard/dashboard-onboarding";
import { DashboardOverview } from "./dashboard/dashboard-overview";
import { DashboardPanels } from "./dashboard/dashboard-panels";
import type {
  DashboardPageProps,
  NotificationItem,
  AnnouncementItem,
  ProfileFormData,
  SubmitProfileResult,
  GrantOpportunity,
} from "./dashboard/dashboard-types";
import {
  firstNameOf,
  formatMoneyFromCents,
  generateUsernameSuggestions,
  uniqBy,
} from "./dashboard/dashboard-utils";

export default function DashboardPage({
  balance = 0,
  currency = "USD",
  balanceLabel = "Available balance",
  recentHistory = [],
  applications = [],
  opportunities = [],
  scamReports = [],
  notifications = [],
  loginNotifications = [],
  announcements = [],
  firstLogin = false,
  welcomeName = "there",
  legalName = "",
  dateOfBirth = "",
  username = "",
  onboardingComplete = true,
  email = "",
}: DashboardPageProps) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(!onboardingComplete);
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    legalName: legalName || "",
    dateOfBirth: dateOfBirth ? dateOfBirth.slice(0, 10) : "",
    username: username || "",
  });

  useEffect(() => {
    setShowOnboarding(!onboardingComplete);
  }, [onboardingComplete]);

  const openReportsCount = scamReports.filter(
    (item) => item.status !== "Resolved",
  ).length;

  const eligibleOpportunities = (opportunities as GrantOpportunity[]).filter(
    (item) => item.eligibility !== "ineligible" && item.eligibility !== "closed",
  );

  const balanceFormatted = formatMoneyFromCents(balance, currency);
  const firstName =
    firstNameOf(profileForm.legalName || welcomeName || legalName || email || "there") ||
    "there";

  const suggestedUsernames = useMemo(
    () =>
      generateUsernameSuggestions(
        profileForm.legalName || welcomeName || firstName || "Credit Cache",
        email,
        profileForm.username,
      ),
    [profileForm.legalName, profileForm.username, welcomeName, email, firstName],
  );

  useEffect(() => {
    setProfileForm((current) => {
      if (current.username.trim()) return current;
      return {
        ...current,
        username: suggestedUsernames[0] || current.username,
      };
    });
  }, [suggestedUsernames]);

  const mergedNotifications: NotificationItem[] = useMemo(
    () =>
      uniqBy(
        [
          ...loginNotifications,
          ...notifications,
          ...(notifications.length === 0 && loginNotifications.length === 0
            ? [
                {
                  id: "welcome-credit-cache",
                  title: "Welcome to Credit Cache",
                  meta: "Your account is ready. Complete your profile to unlock the full dashboard.",
                  read: false,
                  href: "/dashboard/notifications",
                },
                {
                  id: "secured-account",
                  title: "Your account was successfully secured",
                  meta: "Your login activity has been recorded and protected.",
                  read: false,
                  href: "/dashboard/notifications",
                },
                {
                  id: "new-grants",
                  title: "New grants available",
                  meta: "Fresh opportunities matched your profile.",
                  read: false,
                  href: "/dashboard/opportunities",
                },
              ]
            : []),
        ],
        (item) => item.id ?? `${item.title}-${item.meta}`,
      ),
    [loginNotifications, notifications],
  );

  const announcementFeed: AnnouncementItem[] =
    announcements.length > 0
      ? announcements
      : [
          {
            id: "announce-1",
            title: "Complete your profile",
            meta: "Add your legal name, date of birth, and username to finish onboarding.",
            href: "/dashboard",
            label: "Onboarding",
          },
          {
            id: "announce-2",
            title: "Explore opportunities",
            meta: "Check the latest grants and save the ones you want to review later.",
            href: "/dashboard/opportunities",
            label: "Explore",
          },
        ];

  async function submitProfile(data: ProfileFormData): Promise<SubmitProfileResult> {
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || json?.success === false) {
        return {
          success: false,
          message: json?.message ?? "Could not save your profile.",
          code: json?.code,
          suggestions: Array.isArray(json?.suggestions) ? json.suggestions : undefined,
        };
      }

      return {
        success: true,
        message: json?.message ?? "Onboarding complete.",
      };
    } catch {
      return {
        success: false,
        message: "Could not save your profile.",
      };
    }
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        <DashboardOnboarding
          firstName={firstName}
          initialLegalName={profileForm.legalName}
          initialDateOfBirth={profileForm.dateOfBirth}
          initialUsername={profileForm.username}
          suggestedUsernames={suggestedUsernames}
          onSubmit={submitProfile}
          onComplete={() => {
            setShowOnboarding(false);
            router.replace("/dashboard");
            router.refresh();
          }}
          onCancel={() => {
            setShowOnboarding(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 px-4 py-5 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col space-y-5 pb-6">
        <DashboardOverview
          firstName={firstName}
          balanceLabel={balanceLabel}
          balanceFormatted={balanceFormatted}
          savedCardsCount={0}
          paymentMethodsCount={0}
          applicationsCount={applications.length}
          openReportsCount={openReportsCount}
          unreadNotifications={mergedNotifications.some((item) => !item.read)}
        />

        <DashboardPanels
          mergedNotifications={mergedNotifications}
          announcementFeed={announcementFeed}
          recentHistory={recentHistory}
          eligibleOpportunities={eligibleOpportunities}
          onboardingComplete={onboardingComplete}
          currency={currency}
        />
      </div>
    </div>
  );
}