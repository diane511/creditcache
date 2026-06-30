import { Badge } from "@/components/Badge";
import type { AdminGuidance } from "@/lib/admin-data";

type Props = {
  guidancePosts: AdminGuidance[];
};

export function AdminGuidanceSection({ guidancePosts }: Props) {
  const publishedCount = guidancePosts.filter(
    (item) => item.status === "Published",
  ).length;

  const draftCount = guidancePosts.length - publishedCount;

  return (
    <section className="space-y-4">
      <div className="border-b border-black/5 pb-3 dark:border-white/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Manage guidance
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Control the educational posts shown to users.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone="primary">{guidancePosts.length} total</Badge>
            <Badge tone="good">{publishedCount} published</Badge>
            <Badge>{draftCount} drafts</Badge>
          </div>
        </div>
      </div>

      {guidancePosts.length ? (
        <div className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:divide-white/10 dark:border-white/10 dark:bg-zinc-950/50">
          {guidancePosts.map((item) => (
            <article
              key={item.id}
              className="p-5 transition hover:bg-zinc-50/70 dark:hover:bg-white/5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{item.category}</Badge>
                    <Badge tone={item.status === "Published" ? "good" : "primary"}>
                      {item.status}
                    </Badge>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.readTime}
                    </span>
                  </div>

                  <h3 className="mt-3 text-base font-semibold tracking-tight text-zinc-950 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.excerpt}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10">
                    Edit
                  </button>
                  <button className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10">
                    Publish
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-6 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
          No guidance posts yet. Add a helpful article to fill this space.
        </div>
      )}
    </section>
  );
}