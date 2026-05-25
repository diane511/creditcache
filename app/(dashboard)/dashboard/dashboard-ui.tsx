import type { ReactNode } from "react";
import { Badge } from "@/components/Badge";

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-200 pb-5 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function ProfileAvatar() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-950 text-base font-semibold text-white dark:border-white/10 dark:bg-white dark:text-zinc-950">
      CC
    </div>
  );
}

export function StatLine({
  label,
  value,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  tone?: "primary" | "good" | "warn";
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-3 last:border-b-0 dark:border-white/5">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

export function HistoryItem({
  title,
  meta,
  tone = "primary",
}: {
  title: string;
  meta: string;
  tone?: "primary" | "good" | "warn";
}) {
  return (
    <div className="border-b border-zinc-100 py-4 last:border-b-0 dark:border-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-zinc-950 dark:text-white">
            {title}
          </div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {meta}
          </div>
        </div>
        <Badge tone={tone}>New</Badge>
      </div>
    </div>
  );
}