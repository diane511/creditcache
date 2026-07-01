// main/app/admin/winner/page.tsx
import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { getAdminDashboardData } from "@/lib/admin-data";
import { AdminWinnerClient } from "./AdminWinnerClient";

export default async function AdminWinnerPage() {
  const { opportunities, users } = await getAdminDashboardData();

  return (
    <AdminSectionShell
      title="Winner Selection"
      description="Select and manage winners."
    >
      <AdminWinnerClient opportunities={opportunities} users={users} />
    </AdminSectionShell>
  );
}