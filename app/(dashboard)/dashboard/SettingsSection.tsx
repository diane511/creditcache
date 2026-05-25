import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SectionTitle } from "./dashboard-ui";

type SettingsRow = {
  label: string;
  value: string;
};

export function SettingsSection({ settingsRows }: { settingsRows: SettingsRow[] }) {
  return (
    <section
      id="settings"
      className="border-t border-zinc-200 px-5 py-6 dark:border-white/10 sm:px-6"
    >
      <SectionTitle
        title="Settings"
        description="Account preferences, privacy, notifications, and payment defaults."
        action={<Badge tone="primary">Editable</Badge>}
      />

      <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10">
        {settingsRows.map((row, index) => (
          <div
            key={row.label}
            className={[
              "flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
              index !== settingsRows.length - 1
                ? "border-b border-zinc-100 dark:border-white/5"
                : "",
            ].join(" ")}
          >
            <div>
              <div className="text-sm font-medium text-zinc-950 dark:text-white">
                {row.label}
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {row.value}
              </div>
            </div>

            <Link
              href="/settings"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}