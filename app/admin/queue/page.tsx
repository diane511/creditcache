import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { AdminQueueSection } from "@/components/admin/AdminQueueSection";
import { getAdminDashboardData } from "@/lib/admin-data";

export default async function AdminQueuePage() {
  const { queueItems } = await getAdminDashboardData();

  return (
    <AdminSectionShell
      title="Queue"
      description="Review pending items."
    >
      <AdminQueueSection queueItems={queueItems} />
    </AdminSectionShell>
  );
}