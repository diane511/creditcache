"use client";

import Link from "next/link";
import type {
  AnnouncementItem,
  GrantOpportunity,
  HistoryItem,
  NotificationItem,
} from "./dashboard-types";
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
      className="flex items-center justify-between gap-3 border-b border-zinc-200/70 px-3 py-4 transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
    >
      <span className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
        {item.title}
      </span>

      {unread ? (
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500" />
      ) : null}
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
  return (
    <div className="space-y-10">

      {/* NOTIFICATIONS, LOGIN ACTIVITY, ACCOUNT STATUS & RECENT ACTIVITY */}
      <section className="space-y-7">

        {/* Main heading */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Notifications & Account Activity
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              Your notifications, security, account status and recent activity.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
            {mergedNotifications.length}
          </span>
        </div>

        {/* Notifications and Account Status */}
        <div className="grid gap-8 lg:grid-cols-2">

          {/* Notifications */}
          <div className="min-w-0 space-y-3">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Notifications
            </h3>

            <div>
              {mergedNotifications.length ? (
                mergedNotifications.slice(0, 4).map((item, index) => (
                  <SeedNotification
                    key={item.id ?? `${item.title}-${item.meta}-${index}`}
                    item={item}
                    unread={!item.read}
                  />
                ))
              ) : (
                <div className="py-6">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                    No notifications yet
                  </p>

                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Your notifications will appear here.
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/dashboard/notifications"
              className="inline-block pt-2 text-sm font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
            >
              View all notifications
            </Link>
          </div>

          {/* Account Status and Login Activity */}
          <div className="min-w-0 space-y-4">
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Account overview
            </h3>

            {/* Latest Login Activity */}
            <Link
              href="/dashboard/notifications"
              className="flex items-center justify-between gap-3 border-b border-zinc-200/70 px-3 py-4 transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Latest login activity
                </p>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Review your recent sign-in activity.
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                Live
              </span>
            </Link>

            {/* Account Status */}
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200/70 px-3 py-4 dark:border-white/10">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                  Account status
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {onboardingComplete
                    ? "Your profile is complete and your account is active."
                    : "Complete your onboarding to unlock all features."}
                </p>
              </div>

              <span
                className={[
                  "shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold",
                  onboardingComplete
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
                ].join(" ")}
              >
                {onboardingComplete ? "Verified" : "Profile pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
                Recent activity
              </h3>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Your latest transactions and account updates.
              </p>
            </div>

            <Link
              href="/dashboard/history"
              className="shrink-0 text-xs font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 dark:text-white dark:decoration-white/30"
            >
              View all
            </Link>
          </div>

          <div>
            {recentHistory.length ? (
              recentHistory.slice(0, 4).map((item, index) => (
                <div
                  key={item.id || `${item.title}-${index}`}
                  className="flex items-center justify-between gap-4 border-b border-zinc-200/70 px-3 py-4 dark:border-white/10"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                      {item.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                      {item.meta}
                    </p>
                  </div>

                  {typeof item.amount === "number" ? (
                    <div
                      className={`shrink-0 text-sm font-semibold ${toneClass(item.tone)}`}
                    >
                      {item.amount > 0 ? "+" : ""}
                      {formatMoney(
                        Math.abs(item.amount),
                        item.currency || currency
                      )}
                    </div>
                  ) : (
                    <div className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      —
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
                No recent activity yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              Announcements
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Platform updates and onboarding reminders.
            </p>
          </div>

          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
            {announcementFeed.length}
          </span>
        </div>

        <div>
          {announcementFeed.length ? (
            announcementFeed.slice(0, 4).map((item, index) => (
              <Link
                key={item.id ?? `${item.title}-${index}`}
                href={item.href || "/dashboard"}
                className="flex items-center justify-between gap-3 border-b border-zinc-200/70 px-3 py-4 transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                    {item.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                    {item.meta}
                  </p>
                </div>

                {item.label ? (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                    {item.label}
                  </span>
                ) : null}
              </Link>
            ))
          ) : (
            <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
              No announcements available.
            </p>
          )}
        </div>
      </section>

      {/* GRANT OPPORTUNITIES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              Grant opportunities
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Eligible opportunities tailored to your account.
            </p>
          </div>

          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
            {eligibleOpportunities.length}
          </span>
        </div>

        <div>
          {eligibleOpportunities.length ? (
            eligibleOpportunities.slice(0, 4).map((item, index) => (
              <div
                key={item.id || `${item.title}-${index}`}
                className="border-b border-zinc-200/70 px-3 py-5 dark:border-white/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.provider}
                      {item.deadline ? ` · ${item.deadline}` : ""}
                    </p>
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
                        className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-300"
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
                      Review opportunity
                    </Link>
                  </div>
                ) : null}
              </div>
            ))
          ) : (
            <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
              No eligible grant opportunities right now.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
