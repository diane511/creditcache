import { redirect, notFound } from "next/navigation";
import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { AdminPendingApprovalNotice } from "@/components/admin/AdminPendingApprovalNotice";
import { AdminSuspendedNotice } from "@/components/admin/AdminSuspendedNotice";
import { AdminBannedNotice } from "@/components/admin/AdminBannedNotice";

type Params = {
  path?: string[];
};

type AdminAccessState = "pending" | "suspended" | "banned" | "none";

function getAdminAccessState(user: {
  role?: string | null;
  status?: string | null;
  isApproved?: boolean | null;
}): AdminAccessState {
  const role = (user.role ?? "").toUpperCase();
  const status = (user.status ?? "").toUpperCase();

  if (role === "PENDING_ADMIN" || user.isApproved === false) {
    return "pending";
  }

  if (status === "SUSPENDED") {
    return "suspended";
  }

  if (status === "BANNED" || role === "BANNED") {
    return "banned";
  }

  return "none";
}

export default async function AdminCatchAllPage({
  params,
}: {
  params: Params;
}) {
  const sessionUser = await getCurrentUser();
  const requestedPath = `/admin/${(params.path ?? []).join("/")}`.replace(/\/$/, "");

  if (!sessionUser) {
    redirect("/auth/signin?next=/admin");
  }

  const accessState = getAdminAccessState(sessionUser);

  if (accessState === "pending") {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <AdminPendingApprovalNotice
          email={sessionUser.email ?? null}
          requestedPath={requestedPath}
          title="Your admin account is waiting for approval"
          description="You are signed in, but a super admin still needs to approve your account before this admin page opens."
        />
      </main>
    );
  }

  if (accessState === "suspended") {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <AdminSuspendedNotice
          email={sessionUser.email ?? null}
          requestedPath={requestedPath}
          title="This admin account is suspended"
          description="Your account is currently suspended, so this admin page is unavailable."
        />
      </main>
    );
  }

  if (accessState === "banned") {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <AdminBannedNotice
          email={sessionUser.email ?? null}
          requestedPath={requestedPath}
          title="This admin account is banned"
          description="This account is not allowed to access admin pages."
        />
      </main>
    );
  }

  if (isAdminRole(sessionUser.role)) {
    notFound();
  }

  redirect("/dashboard");
}