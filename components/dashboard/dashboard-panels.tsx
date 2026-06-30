"use client";

import Link from "next/link";
import type {
  AnnouncementItem,
  GrantOpportunity,
  HistoryItem,
  NotificationItem,
} from "./dashboard-types";
import { SectionCard } from "./section-card";
import { formatMoney, toneClass } from "./dashboard-utils";

function SeedNotification({
  item,
  unread = false,
}: {
  item: NotificationItem;
  unread?: boolean;
}) {
  const href = item.href || "/dashboard/notifications";

  return (
    <Link
      href={href}
      className="flex items-start justify-between gap-3 rounded-3xl border border-black/5 bg-white p-4 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-white/5"
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
          {item.title}
        </div>
        <div className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.meta}</div>
      </div>
      {unread ? <span className="mt-2 h-2.5 w-2.5 rounded-full bg-rose-500" /> : null}
    </Link>
  );
}

export function DashboardPanels({
  mergedNotifications,
  announcementFeed,
  recentHistory,
  eligibleOpportunities,
  onboardingComplete,
  currency,
}: {
  mergedNotifications: NotificationItem[];
  announcementFeed: AnnouncementItem[];
  recentHistory: HistoryItem[];
  eligibleOpportunities: GrantOpportunity[];
  onboardingComplete: boolean;
  currency: string;
}) {
  const openReportsCount = 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <SectionCard
          title="Notifications"
          subtitle="Welcome notices, login activity, and account alerts"
          rightSlot={
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
              {mergedNotifications.length}
            </span>
          }
        >
          <div className="space-y-3">
            {mergedNotifications.slice(0, 4).map((item, index) => (
              <SeedNotification
                key={item.id ?? `${item.title}-${item.meta}-${index}`}
                item={item}
                unread={!item.read}
              />
            ))}
            {!mergedNotifications.length ? (
              <div className="rounded-[1.5rem] border border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-center dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  No notifications yet
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  Login alerts and welcome messages will appear here.
                </p>
              </div>
            ) : null}
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard/notifications"
              className="text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
            >
              View all notifications
            </Link>
          </div>
        </SectionCard>

        <SectionCard
          title="Latest login activity"
          subtitle="Your most recent secure session"
          rightSlot={
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
              Live
            </span>
          }
        >
          <div className="rounded-[1.5rem] border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-zinc-950">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5 text-zinc-950 dark:text-white">
                  <path
                    d="M12 3l7 3v5c0 5-3.5 8.8-7 10-3.5-1.2-7-5-7-10V6l7-3z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Sign-in and security activity
                </div>
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  Your latest secure sign-in and account activity are tracked in the notifications page.
                </p>
                <div className="mt-3">
                  <Link
                    href="/dashboard/notifications"
                    className="text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
                  >
                    Review activity
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <SectionCard
          title="Announcements"
          subtitle="Platform updates and onboarding reminders"
          rightSlot={
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
              {announcementFeed.length}
            </span>
          }
        >
          <div className="space-y-3">
            {announcementFeed.slice(0, 4).map((item, index) => (
              <Link
                key={item.id ?? `${item.title}-${index}`}
                href={item.href || "/dashboard"}
                className="block rounded-3xl border border-black/5 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                      {item.title}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {item.meta}
                    </div>
                  </div>
                  {item.label ? (
                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm dark:bg-zinc-950 dark:text-zinc-200">
                      {item.label}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Account status"
          subtitle="Security and onboarding state"
          rightSlot={
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                onboardingComplete
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
              ].join(" ")}
            >
              {onboardingComplete ? "Verified" : "Profile pending"}
            </span>
          }
        >
          <div className="space-y-3">
            <div className="rounded-[1.5rem] border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                {onboardingComplete ? "Account ready" : "Onboarding needed"}
              </div>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {onboardingComplete
                  ? "Your profile is complete and your account is active."
                  : "Finish onboarding to personalize your dashboard and unlock all features."}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                Recent activity
              </div>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                Your latest login and account activity appear in the notifications page.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Recent activity"
        subtitle="Your latest transactions and account updates"
        rightSlot={
          <Link
            href="/dashboard/history"
            className="text-xs font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
          >
            View all
          </Link>
        }
      >
        <div className="space-y-3">
          {recentHistory.length ? (
            recentHistory.slice(0, 4).map((item, index) => (
              <div
                key={item.id || `${item.title}-${index}`}
                className="flex items-center justify-between gap-4 rounded-3xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                    {item.title}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                    {item.meta}
                  </div>
                </div>

                {typeof item.amount === "number" ? (
                  <div className={`shrink-0 text-sm font-semibold ${toneClass(item.tone)}`}>
                    {item.amount > 0 ? "+" : ""}
                    {formatMoney(Math.abs(item.amount), item.currency || currency)}
                  </div>
                ) : (
                  <div className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    —
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              No recent activity yet.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Grant opportunities"
        subtitle="Eligible opportunities tailored to your account"
        rightSlot={
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
            {eligibleOpportunities.length}
          </span>
        }
      >
        <div className="space-y-3">
          {eligibleOpportunities.length ? (
            eligibleOpportunities.slice(0, 4).map((item, index) => (
              <div
                key={item.id || `${item.title}-${index}`}
                className="rounded-3xl border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.provider}
                      {item.deadline ? ` · ${item.deadline}` : ""}
                    </div>
                  </div>
                  {item.amount ? (
                    <div className="shrink-0 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.amount}
                    </div>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {item.description}
                </p>

                {item.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-zinc-700 shadow-sm dark:bg-zinc-950 dark:text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.href ? (
                  <div className="mt-4">
                    <Link
                      href={item.href}
                      className="text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
                    >
                      Review
                    </Link>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-zinc-200 bg-zinc-50 px-5 py-8 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              No eligible grant opportunities right now.
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}