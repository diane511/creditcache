import Link from "next/link";
import { Badge } from "@/components/Badge";
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
      className="grid gap-0 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-white/10 dark:border-white/10 lg:grid-cols-2 lg:divide-y-0 lg:divide-x"
    >
      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Recent history"
          description="A clear timeline of the latest actions on the account."
        />

        <div className="mt-5">
          {recentHistory.map((item) => (
            <HistoryItem
              key={item.title}
              title={item.title}
              meta={item.meta}
              tone={item.tone}
            />
          ))}

          <div className="pt-2">
            <Link
              href="/history"
              className="inline-flex items-center text-sm font-medium text-zinc-950 underline underline-offset-4 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
            >
              View full history
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Activity summary"
          description="Recent activity grouped by account area."
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              Applications
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {applicationsCount} in progress
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              Reports
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {unresolvedReportsCount} unresolved
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              Documents
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Saved in vault
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              Security
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              2FA enabled
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}