// main/app/admin/users/[userId]/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser, isAdminRole, isSuperAdminRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

type UserDetailPageProps = {
  params: Promise<{
    userId: string;
  }>;
};

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "—";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function valueOrDash(value: unknown) {
  if (value === null || value === undefined) return "—";
  const str = String(value).trim();
  return str.length ? str : "—";
}

function getDisplayUserRole(user: {
  role: string;
  isApproved: boolean;
}) {
  const role = String(user.role ?? "").toUpperCase();

  if (role === "SUPER_ADMIN") return "Super admin";
  if (role === "ADMIN") return user.isApproved ? "Admin" : "Pending admin";
  return "User";
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      ) : null}
    </div>
  );
}

function StatChip({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-lg font-bold text-zinc-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: UserDetailPageProps) {
  const sessionUser = await getCurrentUser();

  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    redirect("/dashboard");
  }

  const { userId } = await params;

  const user = await db.user.findFirst({
    where: isSuperAdminRole(sessionUser.role)
      ? { id: userId }
      : {
          id: userId,
          invitedByAdminId: sessionUser.id,
        },
    include: {
      approvedBy: true,
      approvedUsers: true,
      authAccounts: true,
      authSessions: true,
      verificationTokens: true,
      createdOpportunities: true,
      createdGuidancePosts: true,
      applications: true,
      reviewedApplications: true,
      winnerAssignmentsGiven: true,
      winnerAssignmentsReceived: true,
      reviewedQueueItems: true,
      auditLogs: true,
      settingsUpdated: true,
      metricSnapshots: true,
      activityEvents: true,
      socialLinks: true,
      workExperiences: true,
      pendingItems: true,
      savedCards: true,
      vaultItems: true,
      reportsFiled: true,
      reportsResolved: true,
      paymentMethodsUpdated: true,
      creditTopUps: true,
    },
  });

  if (!user) {
    notFound();
  }

  const displayName =
    user.displayName ||
    user.legalName ||
    user.username ||
    user.email ||
    "Unknown user";

  const displayRole = getDisplayUserRole(user);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          ← Back to users
        </Link>

        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
                User profile
              </div>
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                {displayName}
              </h1>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                {displayRole}
              </span>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  user.verified
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
                ].join(" ")}
              >
                {user.verified ? "Verified" : "Unverified"}
              </span>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  user.isApproved
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
                ].join(" ")}
              >
                {user.isApproved ? "Approved" : "Not approved"}
              </span>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  user.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : user.status === "PENDING"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
                ].join(" ")}
              >
                {user.status}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatChip label="Credit balance" value={user.creditBalance} />
          <StatChip label="Applications" value={user.applications.length} />
          <StatChip label="Active sessions" value={user.authSessions.length} />
          <StatChip label="Audit logs" value={user.auditLogs.length} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <SectionTitle title="Account details" />
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  ID
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {user.id}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Username
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.username)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Legal name
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.legalName)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Display name
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.displayName)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Raw role
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {user.role}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Normalized role
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {displayRole}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.phone)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Onboarding complete
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {user.onboardingComplete ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Created at
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Updated at
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <SectionTitle title="Verification" />
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Email verified
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {user.emailVerifiedAt ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Email verified at
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.emailVerifiedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Phone verified
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {user.phoneVerifiedAt ? "Yes" : "No"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Phone verified at
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.phoneVerifiedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Password updated
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.passwordUpdatedAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Last login
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.lastLoginAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Last active
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.lastActiveAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Locked until
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDateTime(user.lockedUntil)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Failed login attempts
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {user.failedLoginAttempts}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <SectionTitle title="Profile" />
            <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Bio
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.bio)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Location
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.location)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Occupation
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.occupation)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Company
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.company)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Date of birth
                </dt>
                <dd className="mt-1 text-sm text-zinc-950 dark:text-white">
                  {formatDate(user.dateOfBirth)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Avatar URL
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.avatarUrl)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Cover URL
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.coverUrl)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Website
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.website)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Portfolio
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.portfolioUrl)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  LinkedIn
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.linkedinUrl)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  X
                </dt>
                <dd className="mt-1 break-all text-sm text-zinc-950 dark:text-white">
                  {valueOrDash(user.xUrl)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <SectionTitle
              title="Related records"
              subtitle="Everything linked to this user."
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatChip label="Auth accounts" value={user.authAccounts.length} />
              <StatChip label="Auth sessions" value={user.authSessions.length} />
              <StatChip label="Verification tokens" value={user.verificationTokens.length} />
              <StatChip label="Approved users" value={user.approvedUsers.length} />
              <StatChip label="Created opportunities" value={user.createdOpportunities.length} />
              <StatChip label="Created guidance posts" value={user.createdGuidancePosts.length} />
              <StatChip label="Applications" value={user.applications.length} />
              <StatChip label="Reviewed applications" value={user.reviewedApplications.length} />
              <StatChip label="Winner assignments given" value={user.winnerAssignmentsGiven.length} />
              <StatChip label="Winner assignments received" value={user.winnerAssignmentsReceived.length} />
              <StatChip label="Reviewed queue items" value={user.reviewedQueueItems.length} />
              <StatChip label="Audit logs" value={user.auditLogs.length} />
              <StatChip label="Settings updated" value={user.settingsUpdated.length} />
              <StatChip label="Metric snapshots" value={user.metricSnapshots.length} />
              <StatChip label="Activity events" value={user.activityEvents.length} />
              <StatChip label="Social links" value={user.socialLinks.length} />
              <StatChip label="Work experiences" value={user.workExperiences.length} />
              <StatChip label="Pending items" value={user.pendingItems.length} />
              <StatChip label="Saved cards" value={user.savedCards.length} />
              <StatChip label="Vault items" value={user.vaultItems.length} />
              <StatChip label="Reports filed" value={user.reportsFiled.length} />
              <StatChip label="Reports resolved" value={user.reportsResolved.length} />
              <StatChip label="Payment methods" value={user.paymentMethodsUpdated.length} />
              <StatChip label="Credit top-ups" value={user.creditTopUps.length} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}