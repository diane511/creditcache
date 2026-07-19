// main/app/admin/super-admin/page.tsx
import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DashboardUser = {
  id: string;
  displayName: string;
  legalName: string | null;
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "PENDING_ADMIN" | string;
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | string;
  verified: boolean;
  isApproved: boolean;
  approvedById: string | null;
  invitedByAdminId: string | null;
  createdAt: Date;
  lastActiveAt: Date | null;
};

function formatDate(value: Date | null) {
  if (!value) return "—";
  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function displayName(user: DashboardUser) {
  return user.legalName || user.displayName || user.username;
}

async function approveAdmin(formData: FormData) {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    throw new Error("Missing userId");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isApproved: true,
    },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (targetUser.role !== "PENDING_ADMIN") {
    throw new Error("Only pending admins can be approved");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "ADMIN",
      status: "ACTIVE",
      isApproved: true,
      approvedById: currentUser.id,
    },
  });

  revalidatePath("/admin/super-admin");
}

async function promoteToSuperAdmin(formData: FormData) {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    throw new Error("Missing userId");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isApproved: true,
    },
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (targetUser.role === "SUPER_ADMIN") {
    throw new Error("User is already a super admin");
  }

  if (!targetUser.isApproved || targetUser.role !== "ADMIN") {
    throw new Error("Only approved admins can be promoted to super admin");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      isApproved: true,
      approvedById: currentUser.id,
    },
  });

  revalidatePath("/admin/super-admin");
}

async function demoteSuperAdmin(formData: FormData) {
  "use server";

  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized");
  }

  const userId = String(formData.get("userId") ?? "").trim();

  if (!userId) {
    throw new Error("Missing userId");
  }

  if (userId === currentUser.id) {
    throw new Error("You cannot demote yourself");
  }

  const [targetUser, superAdminCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    }),
    prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    }),
  ]);

  if (!targetUser) {
    throw new Error("User not found");
  }

  if (targetUser.role !== "SUPER_ADMIN") {
    throw new Error("Only super admins can be demoted");
  }

  if (superAdminCount <= 1) {
    throw new Error("You cannot demote the last super admin");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: "ADMIN",
      status: "ACTIVE",
      isApproved: true,
      approvedById: currentUser.id,
    },
  });

  revalidatePath("/admin/super-admin");
}

export default async function SuperAdminPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return (
      <AdminSectionShell
        title="Super admin"
        description="Approve access, review security, and manage system-wide settings."
        badge="Super admin"
      >
        <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            You do not have permission to view this page.
          </p>
        </div>
      </AdminSectionShell>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      displayName: true,
      legalName: true,
      username: true,
      email: true,
      role: true,
      status: true,
      verified: true,
      isApproved: true,
      approvedById: true,
      invitedByAdminId: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });

  const typedUsers = users as DashboardUser[];

  const pendingAdmins = typedUsers.filter(
    (user) => user.role === "PENDING_ADMIN" && !user.isApproved,
  );

  const activeAdmins = typedUsers.filter(
    (user) => user.role === "ADMIN" && user.isApproved,
  );

  const superAdmins = typedUsers.filter((user) => user.role === "SUPER_ADMIN");

  const promotedCandidates = activeAdmins.filter((user) => user.id !== currentUser.id);
  const demotableSuperAdmins = superAdmins.filter((user) => user.id !== currentUser.id);

  return (
    <AdminSectionShell
      title="Super admin"
      description="Approve access, review security, assign super admins, and manage system-wide settings."
      badge="Super admin"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 lg:col-span-2">
          <h3 className="text-sm font-semibold tracking-tight text-amber-950 dark:text-amber-100">
            Important warning
          </h3>
          <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">
            Super admins can approve admins, promote admins to super admin, and
            demote other super admins back to admin. Only promote people you
            trust. Once someone becomes a super admin, they can change your
            privileges too.
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/60 lg:col-span-2">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
            Pending admin approvals
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            New admin accounts stay here until you approve them. Approving one
            promotes the account from pending admin to admin.
          </p>

          <div className="mt-4 space-y-3">
            {pendingAdmins.length > 0 ? (
              pendingAdmins.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-zinc-50 px-4 py-4 text-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950 dark:text-white">
                      {displayName(user)}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Joined {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                      Pending
                    </span>

                    <form action={approveAdmin}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-zinc-950"
                      >
                        Approve admin
                      </button>
                    </form>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No pending admin approvals right now.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
            Role management
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Track active admins, pending accounts, and super admin coverage.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Active admins
              </div>
              <div className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">
                {activeAdmins.length}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Pending
              </div>
              <div className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">
                {pendingAdmins.length}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Super admins
              </div>
              <div className="mt-1 text-xl font-semibold text-zinc-950 dark:text-white">
                {superAdmins.length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
            Promote admin to super admin
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Choose an approved admin and grant full super-admin control.
          </p>

          <div className="mt-4 space-y-3">
            {promotedCandidates.length > 0 ? (
              promotedCandidates.slice(0, 10).map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-zinc-50 px-4 py-4 text-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950 dark:text-white">
                      {displayName(user)}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Approved admin
                    </p>
                  </div>

                  <form action={promoteToSuperAdmin}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-200"
                    >
                      Make super admin
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No approved admins available for super-admin promotion.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
            Existing super admins
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Current super admins can be demoted by another super admin. You
            cannot demote yourself, and the last super admin cannot be removed.
          </p>

          <div className="mt-4 space-y-3">
            {superAdmins.length > 0 ? (
              superAdmins.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-zinc-50 px-4 py-4 text-sm dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-950 dark:text-white">
                      {displayName(user)}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {user.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {user.id === currentUser.id ? "You" : "Super admin"}
                    </p>
                  </div>

                  {user.id === currentUser.id ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Current account
                    </span>
                  ) : (
                    <form action={demoteSuperAdmin}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200"
                      >
                        Demote to admin
                      </button>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No super admins found.
              </p>
            )}
          </div>

          <p className="mt-4 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Super admins can always change each other&apos;s roles, so make sure
            every account you promote is trusted.
          </p>
        </div>

        <div className="rounded-3xl border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950/60">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
            Audit and security
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Use this space for login history, critical actions, and unusual access checks.
          </p>

          <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center justify-between gap-3">
              <span>Login monitoring</span>
              <span className="font-medium text-zinc-950 dark:text-white">Enabled</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Admin action logs</span>
              <span className="font-medium text-zinc-950 dark:text-white">Enabled</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Critical approval trail</span>
              <span className="font-medium text-zinc-950 dark:text-white">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </AdminSectionShell>
  );
}