import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { AdminOpportunitiesSection } from "@/components/admin/AdminOpportunitiesSection";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminOpportunitiesPage() {
  const { opportunities } = await getAdminDashboardData();

  return (
    <AdminSectionShell
      title="Opportunities"
      description="Manage all opportunities."
    >
      <AdminOpportunitiesSection opportunities={opportunities} />
    </AdminSectionShell>
  );
}