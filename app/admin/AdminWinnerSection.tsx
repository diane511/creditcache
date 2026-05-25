import { Badge } from "@/components/Badge";
import type { AdminOpportunity, AdminUser } from "@/lib/admin-data";

type Props = {
  opportunities: AdminOpportunity[];
  users: AdminUser[];
  selectedOpportunity: AdminOpportunity | undefined;
  selectedOpportunityId: string;
  setSelectedOpportunityId: (value: string) => void;
};

export function AdminWinnerSection({
  opportunities,
  users,
  selectedOpportunity,
  selectedOpportunityId,
  setSelectedOpportunityId,
}: Props) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-3xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
        <div className="flex items-end justify-between gap-3 border-b border-black/5 p-6 dark:border-white/10">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
              Assign winner
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Choose an opportunity and connect it to a registered user.
            </p>
          </div>
          <Badge tone="primary">Action</Badge>
        </div>

        <div className="space-y-4 p-6">
          <select
            className="w-full border-b border-black/10 bg-transparent px-0 py-3 text-sm outline-none transition dark:border-white/10 dark:text-white"
            value={selectedOpportunityId}
            onChange={(e) => setSelectedOpportunityId(e.target.value)}
          >
            {opportunities.length === 0 ? (
              <option value="">No opportunities available</option>
            ) : (
              opportunities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))
            )}
          </select>

          <select className="w-full border-b border-black/10 bg-transparent px-0 py-3 text-sm outline-none transition dark:border-white/10 dark:text-white">
            {users.length === 0 ? (
              <option value="">No users available</option>
            ) : (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} — {user.email}
                </option>
              ))
            )}
          </select>

          <button className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100">
            Save winner
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
        <div className="border-b border-black/5 p-6 dark:border-white/10">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
            Selected opportunity details
          </h2>
        </div>

        {selectedOpportunity ? (
          <div className="space-y-4 p-6">
            <div className="text-sm font-medium text-zinc-950 dark:text-white">
              {selectedOpportunity.title}
            </div>
            <div className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {selectedOpportunity.summary}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Badge>{selectedOpportunity.category}</Badge>
              <Badge tone={selectedOpportunity.verified ? "good" : "warn"}>
                {selectedOpportunity.verified ? "Verified" : "Review"}
              </Badge>
              <Badge>{selectedOpportunity.status}</Badge>
            </div>

            <div className="border-t border-black/5 pt-4 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
              Winner: {selectedOpportunity.winnerName ?? "Not assigned"}
            </div>
          </div>
        ) : (
          <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
            No opportunity selected.
          </div>
        )}
      </div>
    </section>
  );
}