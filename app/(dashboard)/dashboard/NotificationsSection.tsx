import Link from "next/link";

export type NotificationItem = {
  id?: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  href?: string;
};

type NotificationsSectionProps = {
  notifications?: NotificationItem[];
};

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 17H9m8-6a5 5 0 10-10 0c0 5-2 6-2 6h14s-2-1-2-6Zm-3.5 8a2 2 0 01-3 0" />
    </svg>
  );
}

export function NotificationsSection({
  notifications = [],
}: NotificationsSectionProps) {
  return (
    <div className="-ml-6 w-[calc(100%+1.5rem)] min-w-0 max-w-none overflow-x-hidden sm:mx-0 sm:w-full sm:max-w-full">
      <div className="mx-auto max-w-md space-y-5 pb-6">
        <div className="flex items-center justify-between px-1 pt-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              Notifications
            </div>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Updates & alerts
            </h1>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
            <BellIcon />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          {notifications.length ? (
            <div className="divide-y divide-black/5 dark:divide-white/10">
              {notifications.map((notification, index) => (
                <Link
                  key={notification.id ?? `${notification.title}-${index}`}
                  href={notification.href ?? "/dashboard/notifications"}
                  className="flex items-start gap-4 px-5 py-5 transition hover:bg-zinc-50 dark:hover:bg-white/5"
                >
                  <div className="relative mt-1 shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 dark:text-white">
                      <BellIcon />
                    </div>

                    {!notification.read ? (
                      <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-zinc-950" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                          {notification.title}
                        </div>

                        <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          {notification.message}
                        </p>
                      </div>

                      <div className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {notification.time}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-white/10 dark:text-white">
                <BellIcon />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-zinc-950 dark:text-white">
                No notifications yet
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Updates about your account activity, grants, and transactions
                will appear here.
              </p>

              <Link
                href="/dashboard"
                className="mt-6 rounded-2xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Back to dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsSection;