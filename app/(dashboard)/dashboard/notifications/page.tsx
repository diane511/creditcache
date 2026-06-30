import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, emailPrefixToDisplayName } from "@/lib/auth";
import NotificationsSection, {
  type NotificationItem,
} from "../NotificationsSection";

type SearchParams = Promise<{
  welcome?: string | string[];
}>;

type ActivityEventRecord = {
  id: string;
  title: string;
  meta: string | null;
  type: string | null;
  metadata: unknown;
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

function isTransferEvent(event: ActivityEventRecord) {
  const meta = event.metadata as Record<string, unknown> | null;
  const text = `${event.title} ${event.meta ?? ""} ${String(meta?.purpose ?? "")}`.toLowerCase();
  return (
    text.includes("winning") ||
    text.includes("sweepstake") ||
    text.includes("scholarship") ||
    text.includes("sponsorship") ||
    text.includes("funding") ||
    text.includes("transfer")
  );
}

function isReceiptEvent(event: ActivityEventRecord) {
  const meta = event.metadata as Record<string, unknown> | null;
  const text = `${event.title} ${event.meta ?? ""} ${String(meta?.kind ?? "")}`.toLowerCase();
  return text.includes("receipt") || text.includes("credit_receipt");
}

function formatTimeLabel(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))} min ago`;
  if (diffMs < day) return `${Math.max(1, Math.floor(diffMs / hour))} h ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function toType(event: ActivityEventRecord): NotificationItem["type"] {
  if (isReceiptEvent(event)) return "receipt";
  if (isTransferEvent(event)) return "transfer";
  if (isAnnouncementEvent(event)) return "announcement";
  if (isAuthEvent(event)) return "security";
  return "account";
}

function getPreviewMessage(event: ActivityEventRecord, type: NotificationItem["type"]) {
  if (type === "receipt") {
    return "A PDF receipt is available for download.";
  }

  if (type === "transfer") {
    return "A PDF transfer notice is available for download.";
  }

  return event.meta ?? "";
}

function mapNotification(event: ActivityEventRecord): NotificationItem {
  const type = toType(event);

  const attachmentUrl =
    type === "receipt" || type === "transfer"
      ? `/dashboard/notifications/${event.id}/receipt/pdf`
      : undefined;

  return {
    id: event.id,
    title: event.title,
    message: getPreviewMessage(event, type),
    time: formatTimeLabel(event.createdAt),
    read: false,
    type,
    href:
      type === "transfer" || type === "receipt"
        ? `/dashboard/notifications/${event.id}`
        : type === "announcement"
          ? "/dashboard"
          : "/dashboard/notifications",
    attachmentUrl,
    attachmentLabel: type === "receipt" ? "PDF receipt" : "PDF attachment",
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/signin?next=/dashboard/notifications");
  }

  const userProfile = user as typeof user & {
    onboardingComplete?: boolean | null;
    displayName?: string | null;
  };

  if (!userProfile.onboardingComplete) {
    redirect("/dashboard?welcome=first-login");
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
      take: 40,
      select: {
        id: true,
        title: true,
        meta: true,
        type: true,
        metadata: true,
        createdAt: true,
      },
    })
    .catch(() => [] as ActivityEventRecord[]);

  const displayName =
    userProfile.displayName?.trim() || emailPrefixToDisplayName(user.email);

  const loginNotifications: NotificationItem[] = activityEvents
    .filter(isAuthEvent)
    .map(mapNotification);

  const notifications: NotificationItem[] = activityEvents
    .filter((event) => !isAuthEvent(event) && !isAnnouncementEvent(event))
    .map(mapNotification);

  const announcements: NotificationItem[] = activityEvents
    .filter(isAnnouncementEvent)
    .map((event) => ({
      ...mapNotification(event),
      type: "announcement",
      message: event.meta ?? "",
    }));

  const fallbackNotifications: NotificationItem[] =
    activityEvents.length > 0
      ? []
      : [
          {
            id: "welcome-credit-cache",
            title: "Welcome to Credit Cache",
            message: `Welcome to Credit Cache, ${displayName}.`,
            time: "Just now",
            read: false,
            type: "account",
            href: "/dashboard",
          },
          {
            id: "secured-account",
            title: "Your account was successfully secured",
            message: "Your login activity has been recorded and protected.",
            time: "5 min ago",
            read: false,
            type: "security",
            href: "/dashboard/notifications",
          },
          {
            id: "new-grants",
            title: "New grants available",
            message: "Fresh opportunities matched your profile.",
            time: "18 min ago",
            read: false,
            type: "grant",
            href: "/dashboard/opportunities",
          },
        ];

  return (
    <NotificationsSection
      notifications={notifications.length ? notifications : fallbackNotifications}
      loginNotifications={
        loginNotifications.length
          ? loginNotifications
          : fallbackNotifications.filter((item) => item.type === "security")
      }
      announcements={
        announcements.length
          ? announcements
          : [
              {
                id: "announce-complete-profile",
                title: "Complete your profile",
                message: "Add your legal name, date of birth, and username to finish onboarding.",
                time: "Today",
                label: firstLogin ? "Onboarding" : "Update",
                href: "/dashboard",
                type: "announcement",
              },
              {
                id: "announce-explore-opportunities",
                title: "Explore opportunities",
                message: "Open the grants board to review new matches for your account.",
                time: "Today",
                label: "Grants",
                href: "/dashboard/opportunities",
                type: "announcement",
              },
            ]
      }
      welcomeNotice={null}
    />
  );
}