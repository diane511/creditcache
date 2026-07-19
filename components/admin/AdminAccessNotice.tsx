import Link from "next/link";
import type { ReactNode } from "react";

export type AdminAccessVariant = "pending" | "suspended" | "banned";

type AdminAccessNoticeProps = {
  variant: AdminAccessVariant;
  title: string;
  description: string;
  email?: string | null;
  requestedPath?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

const VARIANT_META: Record<
  AdminAccessVariant,
  {
    badge: string;
    accent: string;
    ring: string;
    dot: string;
    bullets: string[];
  }
> = {
  pending: {
    badge: "pending approval",
    accent: "text-amber-600 dark:text-amber-300",
    ring: "ring-amber-500/15",
    dot: "bg-amber-500",
    bullets: [
      "Your email is verified, but super admin approval is still required.",
      "Once approved, admin tabs will open normally.",
      "You are already signed in, so no new login is needed.",
    ],
  },
  suspended: {
    badge: "account suspended",
    accent: "text-rose-600 dark:text-rose-300",
    ring: "ring-rose-500/15",
    dot: "bg-rose-500",
    bullets: [
      "This account is temporarily blocked from admin access.",
      "A super admin must lift the suspension before access returns.",
      "Your session can remain active, but admin pages stay locked.",
    ],
  },
  banned: {
    badge: "account banned",
    accent: "text-zinc-600 dark:text-zinc-300",
    ring: "ring-zinc-500/15",
    dot: "bg-zinc-500",
    bullets: [
      "This account is not allowed to access admin pages.",
      "Only a super admin can change this state.",
      "The account stays blocked until the ban is removed.",
    ],
  },
};

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function StatusDot({
  className,
}: {
  className: string;
}) {
  return <span className={`h-2.5 w-2.5 rounded-full ${className}`} />;
}

export function AdminAccessNotice({
  variant,
  title,
  description,
  email,
  requestedPath = "/admin",
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: AdminAccessNoticeProps) {
  const meta = VARIANT_META[variant];

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_38%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.05),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_40%)]" />

      <section className="relative z-10 flex min-h-screen w-full items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <p
            aria-hidden="true"
            className="select-none text-[72px] font-black leading-none tracking-[-0.08em] text-black/5 dark:text-white/5 sm:text-[112px]"
          >
            admin
          </p>

          <div className="mt-2 h-px w-24 bg-[var(--border)]" />

          <span
            className={[
              "mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
              meta.accent,
              meta.ring,
              "border-black/5 bg-white/60 dark:border-white/10 dark:bg-white/5",
            ].join(" ")}
          >
            <StatusDot className={meta.dot} />
            {meta.badge}
          </span>

          <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
            {title}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-[1.05rem]">
            {description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <InfoField label="Signed in as" value={email ? email : "Current account"} />
            <InfoField label="Requested path" value={requestedPath} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex min-w-44 items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              {primaryLabel}
            </Link>

            {secondaryHref ? (
              <Link
                href={secondaryHref}
                className="inline-flex min-w-44 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] backdrop-blur-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {secondaryLabel ?? "Back"}
              </Link>
            ) : null}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {meta.bullets.map((bullet) => (
              <div
                key={bullet}
                className="rounded-2xl border border-black/5 bg-white/50 px-4 py-4 text-sm leading-6 text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              >
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}