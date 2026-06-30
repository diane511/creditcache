import { AdminSectionShell } from "@/components/admin/AdminSectionShell";
import { AdminPublishPanels } from "@/components/admin/AdminPublishPanels";

export default function AdminPublishPage() {
  return (
    <AdminSectionShell
      title="Publish"
      description="Create and manage content from this standalone page."
    >
      <AdminPublishPanels />
    </AdminSectionShell>
  );
}