import Link from "next/link";
import { SectionTitle, HistoryItem } from "./dashboard-ui";

type RecentHistoryItem = {
  title: string;
  meta: string;
  tone: "primary" | "good" | "warn";
};

export function HistorySection({
  recentHistory,
  applicationsCount,
  unresolvedReportsCount,
}: {
  recentHistory: RecentHistoryItem[];
  applicationsCount: number;
  unresolvedReportsCount: number;
}) {
  return (
    <section
      id="history"
      className="border-t border-zinc-200 bg-zinc-50 px-4 py-6 dark:border-white/10 dark:bg-black/20 sm:px-6"
    >
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-zinc-100 px-4 py-4 dark:border-white/5">
            <SectionTitle
              title="Recent history"
              description="A clear timeline of the latest actions on the account."
            />
          </div>

          <div className="p-2 sm:p-3">
            {recentHistory.length > 0 ? (
              <div className="space-y-2">
                {recentHistory.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <HistoryItem
                      title={item.title}
                      meta={item.meta}
                      tone={item.tone}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                No recent activity yet.
              </div>
            )}

            <div className="px-1 pt-4">
              <Link
                href="/history"
                className="inline-flex items-center rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
              >
                View full history
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-zinc-100 px-4 py-4 dark:border-white/5">
            <SectionTitle
              title="Activity summary"
              description="Recent activity grouped by account area."
            />
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-medium text-zinc-950 dark:text-white">
                Applications
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {applicationsCount}
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                In progress
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-medium text-zinc-950 dark:text-white">
                Reports
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                {unresolvedReportsCount}
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Unresolved
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-medium text-zinc-950 dark:text-white">
                Documents
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Vault
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Saved securely
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-medium text-zinc-950 dark:text-white">
                Security
              </div>
              <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                2FA
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Enabled
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}