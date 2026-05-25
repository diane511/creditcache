import { Badge } from "@/components/Badge";
import type { QueueItem } from "@/lib/admin-data";

type Props = {
  queueItems: QueueItem[];
};

export function AdminQueueSection({ queueItems }: Props) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
      <div className="flex items-end justify-between gap-3 border-b border-black/5 p-6 dark:border-white/10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Verification queue
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Track what needs review or escalation.
          </p>
        </div>
        <Badge tone="primary">{queueItems.length}</Badge>
      </div>

      <div className="grid divide-y divide-black/5 dark:divide-white/10 md:grid-cols-2 xl:grid-cols-4 md:divide-y-0 md:divide-x">
        {queueItems.length ? (
          queueItems.map((item) => (
            <div
              key={item.id}
              className="p-6 transition hover:bg-zinc-50/70 dark:hover:bg-white/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-medium text-zinc-950 dark:text-white">
                  {item.label}
                </div>
                <Badge tone={item.priority === "High priority" ? "danger" : "primary"}>
                  {item.count}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {item.status}
              </div>
              <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                {item.priority}
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
            Nothing in the queue right now.
          </div>
        )}
      </div>
    </section>
  );
}