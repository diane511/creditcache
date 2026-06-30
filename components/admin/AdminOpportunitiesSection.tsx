import { Badge } from "@/components/Badge";
import type { AdminOpportunity } from "@/lib/admin-data";

type Props = {
  opportunities: AdminOpportunity[];
};

export function AdminOpportunitiesSection({ opportunities }: Props) {
  const publishedCount = opportunities.filter(
    (item) => item.status === "Published",
  ).length;

  const archivedCount = opportunities.filter(
    (item) => item.status === "Archived",
  ).length;

  const draftCount = opportunities.length - publishedCount - archivedCount;

  return (
    <section className="space-y-4">
      <div className="border-b border-black/5 pb-3 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Manage opportunities
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Review, publish, archive, and track winner assignment.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone="primary">{opportunities.length} total</Badge>
            <Badge tone="good">{publishedCount} published</Badge>
            <Badge>{draftCount} drafts</Badge>
            <Badge tone="warn">{archivedCount} archived</Badge>
          </div>
        </div>
      </div>

      {opportunities.length ? (
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-zinc-950/50">
          <div className="grid grid-cols-12 gap-3 border-b border-black/5 bg-zinc-50 px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
            <div className="col-span-12 lg:col-span-4">Title</div>
            <div className="col-span-6 lg:col-span-2">Category</div>
            <div className="col-span-6 lg:col-span-2">Deadline</div>
            <div className="col-span-6 lg:col-span-1">Status</div>
            <div className="col-span-6 lg:col-span-3">Actions</div>
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/10">
            {opportunities.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 gap-3 px-5 py-4 text-sm transition hover:bg-zinc-50/70 dark:hover:bg-white/5"
              >
                <div className="col-span-12 lg:col-span-4">
                  <div className="font-medium text-zinc-950 dark:text-white">
                    {item.title}
                  </div>
                  <div className="mt-1 text-zinc-600 dark:text-zinc-400">
                    {item.amount}
                  </div>
                </div>

                <div className="col-span-6 lg:col-span-2">
                  <div className="text-zinc-700 dark:text-zinc-300">
                    {item.category}
                  </div>
                </div>

                <div className="col-span-6 lg:col-span-2">
                  <div className="text-zinc-700 dark:text-zinc-300">
                    {item.deadline}
                  </div>
                </div>

                <div className="col-span-6 lg:col-span-1">
                  <Badge
                    tone={
                      item.status === "Published"
                        ? "good"
                        : item.status === "Archived"
                          ? "warn"
                          : "primary"
                    }
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="col-span-6 lg:col-span-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10">
                      Edit
                    </button>
                    <button className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10">
                      Publish
                    </button>
                    <button className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10">
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-6 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
          No opportunities yet. Create the first one above.
        </div>
      )}
    </section>
  );
}