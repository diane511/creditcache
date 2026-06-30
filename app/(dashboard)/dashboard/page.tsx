// main/app/(dashboard)/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardPage from "../../../components/dashboard-page";
import { getCurrentUser, emailPrefixToDisplayName } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{
  welcome?: string | string[];
}>;

type ActivityEventRecord = {
  id: string;
  title: string;
  meta: string | null;
  type: string | null;
  createdAt: Date;
};

const ONBOARDING_COOKIE = "cc_onboarding_pending";

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function isAuthEvent(event: ActivityEventRecord) {
  const text = `${event.title} ${event.meta ?? ""}`.toLowerCase();
  return (
    text.includes("welcome") ||
    text.includes("login") ||
    text.includes("sign in") ||
    text.includes("verification") ||
    text.includes("verified") ||
    text.includes("attempt") ||
    text.includes("locked") ||
    text.includes("password") ||
    text.includes("security")
  );
}

function isAnnouncementEvent(event: ActivityEventRecord) {
  const text = `${event.title} ${event.meta ?? ""}`.toLowerCase();
  return (
    text.includes("announcement") ||
    text.includes("update") ||
    text.includes("news") ||
    text.includes("onboarding") ||
    text.includes("platform")
  );
}

function isGrantEvent(event: ActivityEventRecord) {
  const text = `${event.title} ${event.meta ?? ""}`.toLowerCase();
  return text.includes("grant") || text.includes("opportunit");
}

function serializeDate(value?: string | Date | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function mapDashboardItem(event: ActivityEventRecord, href: string) {
  return {
    id: event.id,
    title: event.title,
    meta: event.meta ?? "",
    read: false,
    href,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

const sessionUser = await getCurrentUser();

if (!sessionUser) {
  redirect("/auth/signin?next=/dashboard");
}

const user = await prisma.user.findUnique({
  where: {
    id: sessionUser.id,
  },
  select: {
    id: true,
    email: true,
    username: true,
    displayName: true,
    legalName: true,
    dateOfBirth: true,
    onboardingComplete: true,
    creditBalance: true,
  },
});

if (!user) {
  redirect("/auth/signin?next=/dashboard");
}

  const cookieStore = await cookies();
  const onboardingCookie = cookieStore.get(ONBOARDING_COOKIE)?.value === "1";
  const firstLogin =
    firstValue(resolvedSearchParams.welcome) === "first-login" || onboardingCookie;

  const activityEvents = await prisma.activityEvent
    .findMany({
      where: {
        entityType: "USER",
        entityId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 24,
      select: {
        id: true,
        title: true,
        meta: true,
        type: true,
        createdAt: true,
      },
    })
    .catch(() => [] as ActivityEventRecord[]);

  const welcomeDisplayName =
    (user as typeof user & {
      displayName?: string | null;
      username?: string | null;
    }).displayName?.trim() || emailPrefixToDisplayName(user.email);

  const userProfile = user as typeof user & {
    legalName?: string | null;
    dateOfBirth?: string | Date | null;
    username?: string | null;
    onboardingComplete?: boolean | null;
  };

  const loginNotifications = activityEvents
    .filter(isAuthEvent)
    .slice(0, 6)
    .map((event) =>
      mapDashboardItem(
        event,
        event.title.toLowerCase().includes("grant")
          ? "/dashboard/opportunities"
          : "/dashboard/notifications",
      ),
    );

  const notifications = activityEvents
    .filter((event) => !isAuthEvent(event) && !isAnnouncementEvent(event))
    .slice(0, 6)
    .map((event) =>
      mapDashboardItem(
        event,
        isGrantEvent(event)
          ? "/dashboard/opportunities"
          : "/dashboard/notifications",
      ),
    );

  const announcements = activityEvents
    .filter(isAnnouncementEvent)
    .slice(0, 4)
    .map((event) => ({
      id: event.id,
      title: event.title,
      meta: event.meta ?? "",
      href: "/dashboard",
      label: "Update",
    }));

  const onboardingComplete = Boolean(userProfile.onboardingComplete ?? false);

  return (
    <DashboardPage
      balance={user.creditBalance ?? 0}
      currency="USD"
      balanceLabel="Available balance"
      savedCards={[]}
      paymentMethods={[]}
      recentHistory={[]}
      applications={[]}
      opportunities={[]}
      scamReports={[]}
      notifications={notifications}
      loginNotifications={loginNotifications}
      announcements={announcements}
      firstLogin={firstLogin}
      welcomeName={welcomeDisplayName}
      legalName={userProfile.legalName ?? ""}
      dateOfBirth={serializeDate(userProfile.dateOfBirth)}
      username={userProfile.username ?? ""}
      onboardingComplete={onboardingComplete}
      email={user.email}
    />
  );
}