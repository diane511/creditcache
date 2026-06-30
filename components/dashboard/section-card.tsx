import type { ReactNode } from "react";

export function SectionCard({
  title,
  subtitle,
  rightSlot,
  children,
}: {
  title: string;
  subtitle: string;
  rightSlot?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.5rem] border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </div>
        {rightSlot}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}