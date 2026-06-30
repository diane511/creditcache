// main/app/admin/users/page.tsx
import { redirect } from "next/navigation";

import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { AdminUsersSection } from "@/components/admin/AdminUsersSection";
import { getAdminDashboardData } from "@/lib/admin-data";
import { getCurrentUser, isAdminRole } from "@/lib/auth";

export default async function AdminUsersPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser || !isAdminRole(sessionUser.role)) {
    redirect("/dashboard");
  }

  const { users } = await getAdminDashboardData(sessionUser);

  return (
    <AdminSectionShell title="Users" description="Manage users.">
      <AdminUsersSection users={users} />
    </AdminSectionShell>
  );
}