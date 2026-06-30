import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { AdminGuidanceSection } from "@/components/admin/AdminGuidanceSection";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminGuidancePage() {
  const { guidancePosts } = await getAdminDashboardData();

  return (
    <AdminSectionShell
      title="Guidance"
      description="Manage guidance articles."
    >
      <AdminGuidanceSection guidancePosts={guidancePosts} />
    </AdminSectionShell>
  );
}