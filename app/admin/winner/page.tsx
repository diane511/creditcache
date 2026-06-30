import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { AdminWinnerSection } from "@/components/admin/AdminWinnerSection";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminWinnerPage() {
  const { opportunities, users } = await getAdminDashboardData();

  return (
    <AdminSectionShell
      title="Winner Selection"
      description="Select and manage winners."
    >
      <AdminWinnerSection
        opportunities={opportunities}
        users={users}
      />
    </AdminSectionShell>
  );
}