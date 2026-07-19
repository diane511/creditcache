import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { AdminPendingApprovalNotice } from "@/components/admin/AdminPendingApprovalNotice";

function BareAdminNotFound() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.10),transparent_38%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.05),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_38%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.04),transparent_40%)]" />

      <section className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-8 sm:px-8">
        <div className="w-full max-w-3xl">
          <p
            aria-hidden="true"
            className="select-none text-[88px] font-black leading-none tracking-[-0.08em] text-black/5 dark:text-white/5 sm:text-[128px]"
          >
            404
          </p>

          <div className="mt-2 h-px w-24 bg-[var(--border)]" />

          <span className="mt-6 inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
            admin route missing
          </span>

          <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl">
            this admin page does not exist
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--muted)] sm:text-[1.05rem]">
            the admin workspace could not find the page you requested.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin"
              className="inline-flex min-w-44 items-center justify-center rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              go to admin overview
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

export default async function AdminNotFound() {
  const user = await getCurrentUser();

  if (user?.role === "PENDING_ADMIN" || user?.isApproved === false) {
    return (
      <main className="min-h-screen w-full bg-[var(--background)] px-4 py-5 text-[var(--foreground)] sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-7xl items-center">
          <AdminPendingApprovalNotice
            email={user.email ?? null}
            requestedPath="/admin"
            title="your admin access is waiting for approval"
            description="you are already signed in, but a super admin still needs to approve your account before admin pages open."
          />
        </div>
      </main>
    );
  }

  return <BareAdminNotFound />;
}