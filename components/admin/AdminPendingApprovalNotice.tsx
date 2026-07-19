import Link from "next/link";

type AdminPendingApprovalNoticeProps = {
  email?: string | null;
  requestedPath?: string;
  title?: string;
  description?: string;
};

function ShieldClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M12 3 19 6v5c0 5-3.2 8.8-7 10-3.8-1.2-7-5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 20a8 8 0 1 1 0-16" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.9" />
    </svg>
  );
}

function InfoPill({
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
      <div className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">{value}</div>
    </div>
  );
}

export function AdminPendingApprovalNotice({
  email,
  requestedPath = "/admin",
  title = "Approval pending",
  description = "Your account is signed in, but it is still waiting for super admin approval.",
}: AdminPendingApprovalNoticeProps) {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white/90 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-emerald-500" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                <ShieldClockIcon />
                Pending approval
              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-base">
                {description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoPill
                  label="Signed in as"
                  value={email ? email : "Current account"}
                />
                <InfoPill
                  label="Requested path"
                  value={requestedPath}
                />
              </div>
            </div>

            <div className="shrink-0 rounded-[1.75rem] border border-black/5 bg-zinc-50 p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white text-zinc-950 shadow-sm dark:border-white/10 dark:bg-zinc-950 dark:text-white">
                  <ShieldClockIcon />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                    Waiting for review
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Super admin approval required
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  Your email is verified, but admin access has not been granted yet.
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-500" />
                  A super admin must approve the account before admin pages unlock.
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  Once approved, you will be able to open the full admin workspace.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-black/5 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 dark:bg-zinc-950/60">
              <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                1. Signed in
              </div>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Your session is active and recognized by the app.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-4 dark:bg-zinc-950/60">
              <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                2. Awaiting approval
              </div>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                A super admin still needs to approve your admin account.
              </p>
            </div>

            <div className="rounded-2xl bg-white/80 p-4 dark:bg-zinc-950/60">
              <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                3. Admin access unlocked
              </div>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                After approval, this section will open normally.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-zinc-950"
            >
              Go to dashboard
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}