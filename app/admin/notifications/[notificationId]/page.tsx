import Link from "next/link";
import { notFound } from "next/navigation";

import { NotificationReadMarker } from "@/components/notification-read-marker";
import { buildAdminNotifications } from "@/lib/admin-notifications";
import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type NotificationPageProps = {
  params: Promise<{
    notificationId: string;
  }>;
};

export default async function NotificationDetailPage({
  params,
}: NotificationPageProps) {
  const { notificationId } = await params;

  const dashboardData = await getAdminDashboardData();
  const notifications = buildAdminNotifications(dashboardData);
  const notification = notifications.find((item) => item.id === notificationId);

  if (!notification) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <NotificationReadMarker notificationId={notification.id} />

      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Link
          href="/admin/notifications"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Back to notifications
        </Link>

        <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
            <span>{notification.label || "Notification"}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span>{notification.time}</span>
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
            {notification.title}
          </h1>

          <p className="mt-4 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            {notification.message}
          </p>
        </article>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Details
          </h2>

          {notification.details.length ? (
            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {notification.details.map((detail) => (
                <div
                  key={`${detail.label}-${detail.value}`}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    {detail.label}
                  </dt>
                  <dd className="mt-2 text-sm leading-6 text-zinc-950 dark:text-white">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
              No extra details are available for this notification.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}