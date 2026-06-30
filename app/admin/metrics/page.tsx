import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { AdminMetrics } from "@/components/admin/AdminMetrics";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminMetricsPage() {
  const {
    opportunities,
    guidancePosts,
    users,
    queueItems,
  } = await getAdminDashboardData();

  const metrics = [
    {
      label: "Opportunities",
      value: opportunities.length,
    },
    {
      label: "Guidance Posts",
      value: guidancePosts.length,
    },
    {
      label: "Users",
      value: users.length,
    },
    {
      label: "Queue Items",
      value: queueItems.length,
    },
  ];

  return (
    <AdminSectionShell
      title="Metrics"
      description="Track the key numbers for your admin workspace."
    >
      <AdminMetrics metrics={metrics} />
    </AdminSectionShell>
  );
}