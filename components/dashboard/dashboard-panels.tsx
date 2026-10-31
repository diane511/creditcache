"use client";

import Link from "next/link";
import type {
  AnnouncementItem,
  GrantOpportunity,
  HistoryItem,
  NotificationItem,
} from "./dashboard-types";
import { formatMoney, toneClass } from "./dashboard-utils";

type IconName =
  | "bell"
  | "clock"
  | "shield"
  | "activity"
  | "megaphone"
  | "gift"
  | "check";

function DashboardIcon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const commonProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...commonProps}
    >
      {name === "bell" && (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </>
      )}

      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}

      {name === "shield" && (
        <>
          <path d="M12 3 20 6v5c0 5-3.5 8.8-8 10-4.5-1.2-8-5-8-10V6l8-3z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}

      {name === "activity" && (
        <>
          <path d="M3 12h4l3-8 4 16 3-8h4" />
        </>
      )}

      {name === "megaphone" && (
        <>
          <path d="m3 11 18-5v12L3 13v-2z" />
          <path d="m7 14 2 6h4l-2-5" />
          <path d="M21 10v4" />
        </>
      )}

      {name === "gift" && (
        <>
          <rect x="3" y="9" width="18" height="12" rx="2" />
          <path d="M12 9v12M2 9h20V6H2v3z" />
          <path d="M12 6c-4-7-9-2-5 0m5 0c4-7 9-2 5 0" />
        </>
      )}

      {name === "check" && (
        <path d="m5 12 4 4L19 6" />
      )}
    </svg>
  );
}

function SectionIcon({
  name,
}: {
  name: IconName;
}) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-300 sm:h-10 sm:w-10">
      <DashboardIcon
        name={name}
        className="h-4 w-4 sm:h-5 sm:w-5"
      />
    </span>
  );
}

/* NOTIFICATION PREVIEW */
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
      className="group flex min-w-0 items-center justify-between gap-3 border-b border-zinc-200/70 px-2 py-3 transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5 sm:px-3 sm:py-4"
    >
      <span
        className={[
          "min-w-0 truncate transition-colors",
          unread
            ? "text-sm font-semibold text-zinc-950 dark:text-white sm:text-[15px]"
            : "text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm",
        ].join(" ")}
      >
        {item.title}
      </span>

      {unread ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-rose-500 sm:h-2.5 sm:w-2.5"
          aria-label="Unread notification"
          title="Unread"
        />
      ) : (
        <DashboardIcon
          name="check"
          className="h-3.5 w-3.5 shrink-0 text-zinc-400 dark:text-zinc-600 sm:h-4 sm:w-4"
        />
      )}
    </Link>
  );
}

/* MAIN DASHBOARD PANELS */
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
  const unreadCount = mergedNotifications.filter(
    (item) => !item.read
  ).length;

  return (
    <div className="w-full min-w-0 space-y-8 sm:space-y-10">

      {/* ================================================== */}
      {/* NOTIFICATIONS & ACCOUNT ACTIVITY */}
      {/* ================================================== */}

      <section
        aria-labelledby="account-activity-heading"
        className="min-w-0 space-y-6 sm:space-y-8"
      >
        {/* Main heading */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SectionIcon name="bell" />

            <div className="min-w-0">
              <h2
                id="account-activity-heading"
                className="text-base font-bold tracking-tight text-zinc-950 dark:text-white sm:text-xl"
              >
                Notifications & Account Activity
              </h2>

              <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Your notifications, security and account updates.
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200 sm:text-xs">
            {unreadCount} unread
          </span>
        </div>

        {/* Responsive notifications and account overview */}
        <div className="grid min-w-0 grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-10">

          {/* NOTIFICATIONS */}
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <DashboardIcon
                name="bell"
                className="h-4 w-4 text-zinc-500 dark:text-zinc-400 sm:h-5 sm:w-5"
              />

              <h3 className="text-sm font-bold text-zinc-950 dark:text-white sm:text-base">
                Notifications
              </h3>
            </div>

            <div className="min-w-0">
              {mergedNotifications.length > 0 ? (
                mergedNotifications.slice(0, 5).map((item, index) => (
                  <SeedNotification
                    key={
                      item.id ??
                      `${item.title}-${item.meta}-${index}`
                    }
                    item={item}
                    unread={!item.read}
                  />
                ))
              ) : (
                <div className="py-6">
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    No notifications yet.
                  </p>
                </div>
              )}
            </div>

            <Link
              href="/dashboard/notifications"
              className="inline-flex items-center gap-2 pt-2 text-xs font-semibold text-zinc-800 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-500 dark:text-zinc-200 dark:decoration-white/30 dark:hover:text-white sm:text-sm"
            >
              View all notifications

              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* ACCOUNT OVERVIEW */}
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <DashboardIcon
                name="shield"
                className="h-4 w-4 text-zinc-500 dark:text-zinc-400 sm:h-5 sm:w-5"
              />

              <h3 className="text-sm font-bold text-zinc-950 dark:text-white sm:text-base">
                Account activity
              </h3>
            </div>

            {/* LAST LOGIN - ALWAYS VISIBLE */}
            <Link
              href="/dashboard/notifications"
              className="flex items-center justify-between gap-3 border-b border-zinc-200/70 px-2 py-4 transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5 sm:px-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <DashboardIcon
                    name="clock"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                    Last login
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm">
                    Review your recent sign-in and security activity.
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 sm:px-3 sm:text-[11px]">
                Live
              </span>
            </Link>

            {/* ACCOUNT STATUS - ONLY SHOW WHEN PENDING */}
            {!onboardingComplete && (
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200/70 px-2 py-4 dark:border-white/10 sm:px-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                    <DashboardIcon
                      name="shield"
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                      Account status
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm">
                      Complete your profile onboarding to unlock all features.
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200 sm:px-3 sm:text-[11px]">
                  Pending
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="min-w-0 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <SectionIcon name="activity" />

              <div className="min-w-0">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white sm:text-base">
                  Recent activity
                </h3>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                  Your latest transactions and account updates.
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/history"
              className="shrink-0 text-xs font-semibold text-zinc-800 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-500 dark:text-zinc-200 dark:decoration-white/30 dark:hover:text-white sm:text-sm"
            >
              View all
            </Link>
          </div>

          <div className="min-w-0">
            {recentHistory.length > 0 ? (
              recentHistory.slice(0, 4).map((item, index) => (
                <div
                  key={item.id || `${item.title}-${index}`}
                  className="flex min-w-0 items-center justify-between gap-3 border-b border-zinc-200/70 px-2 py-4 dark:border-white/10 sm:gap-4 sm:px-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-950 dark:text-white sm:text-sm">
                      {item.title}
                    </p>

                    <p className="mt-1 truncate text-[11px] leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm">
                      {item.meta}
                    </p>
                  </div>

                  {typeof item.amount === "number" ? (
                    <div
                      className={`shrink-0 text-xs font-semibold sm:text-sm ${toneClass(
                        item.tone
                      )}`}
                    >
                      {item.amount > 0 ? "+" : ""}
                      {formatMoney(
                        Math.abs(item.amount),
                        item.currency || currency
                      )}
                    </div>
                  ) : (
                    <span className="shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                      —
                    </span>
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

      {/* ================================================== */}
      {/* ANNOUNCEMENTS */}
      {/* ================================================== */}

      <section className="min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SectionIcon name="megaphone" />

            <div className="min-w-0">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white sm:text-lg">
                Announcements
              </h2>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Platform updates and onboarding reminders.
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200 sm:text-xs">
            {announcementFeed.length}
          </span>
        </div>

        <div className="min-w-0">
          {announcementFeed.length > 0 ? (
            announcementFeed.slice(0, 4).map((item, index) => (
              <Link
                key={item.id ?? `${item.title}-${index}`}
                href={item.href || "/dashboard"}
                className="flex min-w-0 items-center justify-between gap-3 border-b border-zinc-200/70 px-2 py-4 transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5 sm:px-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400 sm:text-sm">
                    {item.meta}
                  </p>
                </div>

                {item.label && (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200 sm:text-[11px]">
                    {item.label}
                  </span>
                )}
              </Link>
            ))
          ) : (
            <p className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
              No announcements available.
            </p>
          )}
        </div>
      </section>

      {/* ================================================== */}
      {/* GRANT OPPORTUNITIES */}
      {/* ================================================== */}

      <section className="min-w-0 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SectionIcon name="gift" />

            <div className="min-w-0">
              <h2 className="text-base font-bold text-zinc-950 dark:text-white sm:text-lg">
                Grant opportunities
              </h2>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Eligible opportunities tailored to your account.
              </p>
            </div>
          </div>

          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200 sm:text-xs">
            {eligibleOpportunities.length}
          </span>
        </div>

        <div className="min-w-0">
          {eligibleOpportunities.length > 0 ? (
            eligibleOpportunities.slice(0, 4).map((item, index) => (
              <div
                key={item.id || `${item.title}-${index}`}
                className="min-w-0 border-b border-zinc-200/70 px-2 py-5 dark:border-white/10 sm:px-3"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-sm font-semibold text-zinc-950 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.provider}
                      {item.deadline ? ` · ${item.deadline}` : ""}
                    </p>
                  </div>

                  {item.amount && (
                    <div className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 sm:text-sm">
                      {item.amount}
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs leading-6 text-zinc-600 dark:text-zinc-300 sm:text-sm">
                  {item.description}
                </p>

                {item.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-300 sm:text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {item.href && (
                  <div className="mt-4">
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-950 underline decoration-zinc-300 underline-offset-4 transition hover:text-zinc-500 dark:text-white dark:decoration-white/30 dark:hover:text-zinc-300 sm:text-sm"
                    >
                      Review opportunity
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                )}
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
