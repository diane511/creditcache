import Link from "next/link";
import { SectionTitle } from "./dashboard-ui";

const quickActions = [
  {
    href: "/opportunities",
    title: "Browse opportunities",
    note: "Find new verified offers.",
  },
  {
    href: "/vault",
    title: "Open vault",
    note: "Keep records and files secure.",
  },
  {
    href: "/resources",
    title: "Read resources",
    note: "Learn the next best steps.",
  },
  {
    href: "/partner",
    title: "Partner area",
    note: "Collaborate and refer others.",
  },
];

export function ActionsSection() {
  return (
    <section
      id="actions"
      className="border-t border-zinc-200 px-5 py-6 dark:border-white/10 sm:px-6"
    >
      <SectionTitle
        title="Quick actions"
        description="Shortcuts to the areas people visit most."
      />

      <div className="mt-5 grid gap-0 overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "border-zinc-200 p-4 transition hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-white/5",
              index < 2 ? "border-b lg:border-b-0" : "",
              index % 2 === 0 ? "sm:border-r" : "",
              index % 4 !== 3 ? "lg:border-r" : "",
            ].join(" ")}
          >
            <div className="text-sm font-semibold text-zinc-950 dark:text-white">
              {item.title}
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {item.note}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}