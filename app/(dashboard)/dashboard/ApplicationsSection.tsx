import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SectionTitle } from "./dashboard-ui";

type ApplicationItem = {
  id: string | number;
  opportunityTitle: string;
  applicantName: string;
  status: string;
  deadline: string;
};

type DeadlineItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  amount: string;
  deadline: string;
};

export function ApplicationsSection({
  applications,
  deadlines,
}: {
  applications: ApplicationItem[];
  deadlines: DeadlineItem[];
}) {
  return (
    <section className="grid gap-0 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-white/10 dark:border-white/10 lg:grid-cols-2 lg:divide-y-0 lg:divide-x">
      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Current applications"
          description="A quick view of what is active and what needs attention."
          action={<Badge tone="primary">{applications.length} total</Badge>}
        />

        <div className="mt-5 space-y-4">
          {applications.map((item) => (
            <div
              key={item.id}
              className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0 dark:border-white/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-zinc-950 dark:text-white">
                    {item.opportunityTitle}
                  </div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {item.applicantName}
                  </div>
                </div>
                <Badge tone="warn">{item.status}</Badge>
              </div>

              <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Due {item.deadline}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Link
            href="/applications"
            className="inline-flex items-center text-sm font-medium text-zinc-950 underline underline-offset-4 transition hover:text-zinc-700 dark:text-white dark:hover:text-zinc-300"
          >
            Open all applications
          </Link>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Upcoming deadlines"
          description="These are the items most likely to need your attention first."
          action={<Badge tone="primary">{deadlines.length} shown</Badge>}
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.5fr_0.7fr] gap-0 bg-zinc-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
            <div>Opportunity</div>
            <div>Category</div>
            <div>Amount</div>
            <div>Deadline</div>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-white/10">
            {deadlines.map((item) => (
              <div
                key={item.slug}
                className="grid grid-cols-1 gap-3 px-4 py-4 sm:grid-cols-[1.4fr_0.7fr_0.5fr_0.7fr] sm:items-center"
              >
                <div>
                  <div className="font-semibold text-zinc-950 dark:text-white">
                    {item.title}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.summary}
                  </div>
                </div>
                <div>
                  <Badge tone="primary">{item.category}</Badge>
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                  {item.amount}
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300">
                  {item.deadline}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}