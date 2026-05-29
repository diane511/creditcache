"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminMetrics } from "./AdminMetrics";
import { AdminPublishPanels } from "./AdminPublishPanels";
import { AdminOpportunitiesSection } from "./AdminOpportunitiesSection";
import { AdminGuidanceSection } from "./AdminGuidanceSection";
import { AdminUsersSection } from "./AdminUsersSection";
import { AdminWinnerSection } from "./AdminWinnerSection";
import { AdminQueueSection } from "./AdminQueueSection";
import type {
  AdminOpportunity,
  AdminGuidance,
  AdminUser,
  QueueItem,
} from "@/lib/admin-data";

type AdminRole = "admin" | "super-admin";

type AdminUserWithStatus = AdminUser & {
  status?: "pending" | "active" | "suspended";
};

type Props = {
  role: AdminRole;
  opportunities: AdminOpportunity[];
  guidancePosts: AdminGuidance[];
  users: AdminUserWithStatus[];
  queueItems: QueueItem[];
};

type ViewKey =
  | "overview"
  | "metrics"
  | "publish"
  | "opportunities"
  | "guidance"
  | "users"
  | "winner"
  | "queue"
  | "super-admin";

const viewKeys = new Set<ViewKey>([
  "overview",
  "metrics",
  "publish",
  "opportunities",
  "guidance",
  "users",
  "winner",
  "queue",
  "super-admin",
]);

function getViewFromHash(hash: string): ViewKey {
  const clean = hash.replace("#", "") as ViewKey;
  return viewKeys.has(clean) ? clean : "overview";
}

function getInitialView(): ViewKey {
  if (typeof window === "undefined") return "overview";
  return getViewFromHash(window.location.hash);
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M7 17L17 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 7h8v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OverviewStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex-1 min-w-0 px-4 py-3">
      <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function JumpLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center justify-between rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-black/10 hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
    >
      <span>{label}</span>
      <ArrowIcon className="ml-3 h-4 w-4 shrink-0 text-zinc-400" />
    </a>
  );
}

function SuperAdminCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/50">
      <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function AdminDashboard({
  role,
  opportunities,
  guidancePosts,
  users,
  queueItems,
}: Props) {
  const [userSearch, setUserSearch] = useState("");
  const [selectedOpportunityId, setSelectedOpportunityId] = useState(
    opportunities[0]?.id ?? "",
  );
  const [activeView, setActiveView] = useState<ViewKey>(getInitialView);

  const selectedOpportunity = opportunities.find(
    (item) => item.id === selectedOpportunityId,
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.role,
        user.status ?? "",
        user.id,
        user.joinedAt,
        user.lastActiveAt ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [users, userSearch]);

  const pendingAdmins = useMemo(
    () => users.filter((user) => user.status === "pending"),
    [users],
  );

  const activeAdmins = useMemo(
    () => users.filter((user) => user.status !== "pending" && user.status !== "suspended"),
    [users],
  );

  const superAdminCount = useMemo(
    () => users.filter((user) => user.role === "super-admin").length,
    [users],
  );

  const metrics = [
    { label: "Opportunities", value: opportunities.length },
    { label: "Guidance posts", value: guidancePosts.length },
    { label: "Registered users", value: users.length },
    { label: "Queue items", value: queueItems.length },
    ...(role === "super-admin"
      ? [{ label: "Pending admins", value: pendingAdmins.length }]
      : []),
  ];

  const underReviewCount = queueItems.reduce((sum, item) => sum + item.count, 0);

  useEffect(() => {
    const syncFromHash = () => {
      setActiveView(getViewFromHash(window.location.hash));
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [activeView]);

  return (
    <div className="w-full min-w-0 space-y-6">
      <header className="border-b border-black/5 pb-3 dark:border-white/10">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-black/5 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              {role === "super-admin" ? "Super admin dashboard" : "Admin dashboard"}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {opportunities.length + guidancePosts.length} live ·{" "}
              {underReviewCount} under review
            </span>
          </div>

          <h1 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-xl">
            Manage content, users, reviews, and platform access from one place.
          </h1>
        </div>
      </header>

      {activeView === "overview" ? (
        <section id="overview" className="space-y-4 scroll-mt-24">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Overview
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                A quick snapshot of the workspace and a fast way to jump into key
                areas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <JumpLink href="#metrics" label="Metrics" />
              <JumpLink href="#publish" label="Publish" />
              <JumpLink href="#users" label="Users" />
              <JumpLink href="#queue" label="Queue" />
              {role === "super-admin" ? (
                <JumpLink href="#super-admin" label="Super admin" />
              ) : null}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-zinc-950/50">
            <div className="flex flex-col divide-y divide-black/5 dark:divide-white/10 sm:flex-row sm:divide-y-0 sm:divide-x">
              <OverviewStat
                label="Live items"
                value={opportunities.length + guidancePosts.length}
              />
              <OverviewStat label="Users" value={users.length} />
              <OverviewStat label="Queue" value={queueItems.length} />
              <OverviewStat
                label="Selected opportunity"
                value={selectedOpportunity?.id || "None"}
              />
              {role === "super-admin" ? (
                <OverviewStat label="Pending admins" value={pendingAdmins.length} />
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/50">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Quick actions
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Jump anywhere
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <JumpLink href="#opportunities" label="Open opportunities" />
                <JumpLink href="#guidance" label="Open guidance" />
                <JumpLink href="#winner" label="Review winners" />
                <JumpLink href="#metrics" label="View metrics" />
                {role === "super-admin" ? (
                  <>
                    <JumpLink href="#super-admin" label="Super admin tools" />
                    <JumpLink href="#users" label="Review admin users" />
                  </>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/50">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                  Workspace focus
                </h3>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Now
                </span>
              </div>

              <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between gap-3">
                  <span>Pending review</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    {underReviewCount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Guidance posts</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    {guidancePosts.length}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Registered users</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    {users.length}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Opportunity selected</span>
                  <span className="truncate font-medium text-zinc-950 dark:text-white">
                    {selectedOpportunity?.id || "None"}
                  </span>
                </div>
                {role === "super-admin" ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span>Pending admins</span>
                      <span className="font-medium text-zinc-950 dark:text-white">
                        {pendingAdmins.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>Super admins</span>
                      <span className="font-medium text-zinc-950 dark:text-white">
                        {superAdminCount}
                      </span>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {activeView === "metrics" ? <AdminMetrics metrics={metrics} /> : null}

      {activeView === "publish" ? <AdminPublishPanels /> : null}

      {activeView === "opportunities" ? (
        <AdminOpportunitiesSection opportunities={opportunities} />
      ) : null}

      {activeView === "guidance" ? (
        <AdminGuidanceSection guidancePosts={guidancePosts} />
      ) : null}

      {activeView === "users" ? (
        <AdminUsersSection
          users={filteredUsers}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
        />
      ) : null}

      {activeView === "winner" ? (
        <AdminWinnerSection
          opportunities={opportunities}
          users={users}
          selectedOpportunity={selectedOpportunity}
          selectedOpportunityId={selectedOpportunityId}
          setSelectedOpportunityId={setSelectedOpportunityId}
        />
      ) : null}

      {activeView === "queue" ? <AdminQueueSection queueItems={queueItems} /> : null}

      {role === "super-admin" ? (
        <section id="super-admin" className="space-y-4 scroll-mt-24">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white">
                Super admin
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Control admin access, approve pending accounts, and manage
                platform-wide settings.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <JumpLink href="#users" label="Review users" />
              <JumpLink href="#queue" label="Review queue" />
              <JumpLink href="#metrics" label="System metrics" />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SuperAdminCard
              title="Pending admin approvals"
              description="New admin accounts can stay pending until you approve them."
            >
              {pendingAdmins.length > 0 ? (
                <div className="space-y-3">
                  {pendingAdmins.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-zinc-50 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-950 dark:text-white">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {user.email}
                        </p>
                      </div>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                        Pending
                      </span>
                    </div>
                  ))}
                  <a
                    href="#users"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Open the users section
                    <ArrowIcon className="h-4 w-4" />
                  </a>
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  No pending admin approvals right now.
                </p>
              )}
            </SuperAdminCard>

            <SuperAdminCard
              title="Role management"
              description="Track who is active, who is pending, and how many super admins exist."
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-black/5 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Active admins
                  </div>
                  <div className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">
                    {activeAdmins.length}
                  </div>
                </div>
                <div className="rounded-xl border border-black/5 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Pending
                  </div>
                  <div className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">
                    {pendingAdmins.length}
                  </div>
                </div>
                <div className="rounded-xl border border-black/5 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Super admins
                  </div>
                  <div className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">
                    {superAdminCount}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <JumpLink href="#users" label="Edit access in users" />
                <JumpLink href="#queue" label="Check review queue" />
              </div>
            </SuperAdminCard>

            <SuperAdminCard
              title="Audit and security"
              description="Use this area for login history, critical actions, and unusual access checks."
            >
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between gap-3">
                  <span>Login monitoring</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Admin action logs</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Critical approval trail</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    Enabled
                  </span>
                </div>
              </div>
            </SuperAdminCard>

            <SuperAdminCard
              title="System settings"
              description="Keep global moderation and publishing rules under super-admin control."
            >
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-between gap-3">
                  <span>New admin creation</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    Pending approval
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Content publishing</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    Admin managed
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Role escalation</span>
                  <span className="font-medium text-zinc-950 dark:text-white">
                    Super admin only
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <JumpLink href="#publish" label="Publishing tools" />
                <JumpLink href="#metrics" label="System metrics" />
              </div>
            </SuperAdminCard>
          </div>
        </section>
      ) : null}
    </div>
  );
}