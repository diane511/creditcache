import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_38%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.05),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_40%)]" />

      <section className="relative z-10 flex min-h-screen w-full items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
        <div className="surface-strong flex min-h-[calc(100vh-2rem)] w-full flex-col items-center justify-center rounded-[2rem] px-6 py-10 text-center sm:min-h-[calc(100vh-3rem)] sm:px-10 sm:py-12">
          <p
            aria-hidden="true"
            className="select-none text-[82px] font-black leading-none tracking-[-0.06em] text-black/5 dark:text-white/5 sm:text-[108px]"
          >
            404
          </p>

          <div className="mx-auto mb-5 flex h-36 w-36 items-center justify-center">
            <svg
              width="144"
              height="144"
              viewBox="0 0 180 180"
              aria-hidden="true"
              className="block h-full w-full text-indigo-500 dark:text-indigo-400"
            >
              <circle
                cx="90"
                cy="90"
                r="64"
                fill="currentColor"
                opacity="0.10"
              />
              <circle
                cx="90"
                cy="90"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <circle cx="90" cy="90" r="4" fill="currentColor" />
              <line
                x1="90"
                y1="90"
                x2="90"
                y2="66"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="90"
                y1="90"
                x2="111"
                y2="96"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
            error 404
          </span>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.03em] text-[var(--foreground)] sm:text-4xl">
            this page isn&apos;t in your records
          </h1>

          <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-[var(--muted)] sm:text-[1.02rem]">
            we searched the vault from top to bottom, but this route is missing.
            let&apos;s get you back to a safe place.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-w-44 items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              return to credit cache
            </Link>

            <Link
              href="/"
              className="inline-flex min-w-44 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] backdrop-blur-md transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              return home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}