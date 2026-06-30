import { NotificationsSection } from "@/components/notifications-section";
import { buildAdminNotifications } from "@/lib/admin-notifications";
import { getAdminDashboardData } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const dashboardData = await getAdminDashboardData();
  const notifications = buildAdminNotifications(dashboardData);

  return (
    <NotificationsSection
      notifications={notifications}
      welcomeNotice="Click any notification to open its full detail view."
    />
  );
}