// main/app/(dashboard)/dashboard/SecuritySection.tsx
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { SectionTitle } from "./dashboard-ui";
import type { ScamReport } from "./dashboard-types";

export function SecuritySection({
  scamReports,
  openReportsCount,
}: {
  scamReports: ScamReport[];
  openReportsCount: number;
}) {
  return (
    <section
      id="security"
      className="grid gap-0 divide-y divide-zinc-200 border-t border-zinc-200 dark:divide-white/10 dark:border-white/10 lg:grid-cols-2 lg:divide-y-0 lg:divide-x"
    >
      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Security monitor"
          description="Track reported risks and unresolved items."
          action={<Badge tone="warn">{openReportsCount} open</Badge>}
        />

        <div className="mt-5">
          {scamReports.map((report) => {
            const status = report.status ?? "Open";
            const tone: "good" | "warn" =
              status === "Resolved" ? "good" : "warn";

            return (
              <div
                key={report.id}
                className="border-b border-zinc-100 py-4 last:border-b-0 dark:border-white/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-zinc-950 dark:text-white">
                      {report.topic}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {report.channel}
                    </div>
                  </div>
                  <Badge tone={tone}>{status}</Badge>
                </div>

                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {report.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6">
        <SectionTitle
          title="Security tools"
          description="Fast access to account safety controls."
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link
            href="/security/password"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="text-sm font-semibold text-zinc-950 dark:text-white">
              Change password
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Update your login credentials.
            </div>
          </Link>

          <Link
            href="/security/2fa"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10"
          >
            <div className="text-sm font-semibold text-zinc-950 dark:text-white">
              Two-factor auth
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Strengthen account protection.
            </div>
          </Link>

          <Link
            href="/security/devices"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10"
          >
            <div className="text-sm font-semibold text-zinc-950 dark:text-white">
              Trusted devices
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Review signed-in devices.
            </div>
          </Link>

          <Link
            href="/security/reports"
            className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-white/10 dark:hover:bg-white/10"
          >
            <div className="text-sm font-semibold text-zinc-950 dark:text-white">
              Report abuse
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Flag suspicious activity quickly.
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}