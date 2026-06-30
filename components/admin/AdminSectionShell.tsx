"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type AdminSectionShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  badge?: string;
};

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M10 19 3 12l7-7M4 12h17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminSectionShell({
  title,
  description,
  children,
  actions,
  backHref = "/admin",
  backLabel = "Back to admin",
  badge = "Admin",
}: AdminSectionShellProps) {
  return (
    <section className="space-y-6 pb-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-950/60 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <span className="inline-flex w-fit rounded-full border border-black/5 bg-zinc-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              {badge}
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
              >
                <ArrowLeftIcon />
                {backLabel}
              </Link>

              <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                {title}
              </h1>
            </div>

            {description ? (
              <p className="max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>

          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </header>

      <div className="min-w-0">{children}</div>
    </section>
  );
}