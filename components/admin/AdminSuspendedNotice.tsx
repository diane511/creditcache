import { AdminAccessNotice } from "@/components/admin/AdminAccessNotice";

type AdminSuspendedNoticeProps = {
  email?: string | null;
  requestedPath?: string;
  title?: string;
  description?: string;
};

export function AdminSuspendedNotice({
  email,
  requestedPath = "/admin",
  title = "This admin account is suspended",
  description = "Your account is currently suspended, so admin tabs are not available right now.",
}: AdminSuspendedNoticeProps) {
  return (
    <AdminAccessNotice
      variant="suspended"
      email={email}
      requestedPath={requestedPath}
      title={title}
      description={description}
      primaryHref="/dashboard"
      primaryLabel="Go to dashboard"
      secondaryHref="/"
      secondaryLabel="Back home"
    />
  );
}