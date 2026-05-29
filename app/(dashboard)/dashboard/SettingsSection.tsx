import Link from "next/link";
import { SectionTitle } from "./dashboard-ui";

type SettingsRow = {
  label: string;
  value: string;
};

type SettingsGroup = {
  title: string;
  description: string;
  href: string;
  rows: SettingsRow[];
};

const settingsGroups: SettingsGroup[] = [
  {
    title: "Account",
    description: "Profile, email, password, and login details.",
    href: "/settings/account",
    rows: [
      { label: "Profile", value: "Name and photo" },
      { label: "Email", value: "Primary address" },
      { label: "Password", value: "Last updated recently" },
    ],
  },
  {
    title: "Preferences",
    description: "Display, language, and regional options.",
    href: "/settings/preferences",
    rows: [
      { label: "Language", value: "English" },
      { label: "Timezone", value: "Europe/Athens" },
      { label: "Theme", value: "System default" },
    ],
  },
  {
    title: "Notifications",
    description: "Email, push, and product alerts.",
    href: "/settings/notifications",
    rows: [
      { label: "Email alerts", value: "On" },
      { label: "Push notifications", value: "On" },
      { label: "Marketing", value: "Off" },
    ],
  },
  {
    title: "Billing",
    description: "Plan, payment method, and invoices.",
    href: "/settings/billing",
    rows: [
      { label: "Plan", value: "Pro" },
      { label: "Payment method", value: "Visa ending in 4242" },
      { label: "Invoices", value: "Download history" },
    ],
  },
];

export function SettingsSection() {
  return (
    <section
      id="settings"
      className="border-t border-zinc-200 bg-zinc-50 px-4 py-6 dark:border-white/10 dark:bg-black/20 sm:px-6"
    >
      <div className="mx-auto max-w-2xl">
        <SectionTitle
          title="Settings"
          description="Manage your account, preferences, and notifications."
        />

        <div className="mt-5 space-y-4">
          {settingsGroups.map((group) => (
            <div
              key={group.title}
              className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <div className="border-b border-zinc-100 px-4 py-4 dark:border-white/5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold text-zinc-950 dark:text-white">
                      {group.title}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {group.description}
                    </div>
                  </div>

                  <Link
                    href={group.href}
                    className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:hover:bg-white/15"
                  >
                    Open
                  </Link>
                </div>
              </div>

              <div>
                {group.rows.map((row, index) => (
                  <Link
                    key={row.label}
                    href={group.href}
                    className={[
                      "flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-zinc-50 dark:hover:bg-white/5",
                      index !== group.rows.length - 1
                        ? "border-b border-zinc-100 dark:border-white/5"
                        : "",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-950 dark:text-white">
                        {row.label}
                      </div>
                      <div className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                        {row.value}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-zinc-400 dark:text-zinc-500">
                        Edit
                      </span>
                      <span className="text-zinc-300 dark:text-zinc-600">›</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}