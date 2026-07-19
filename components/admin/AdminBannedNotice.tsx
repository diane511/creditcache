import { AdminAccessNotice } from "@/components/admin/AdminAccessNotice";

type AdminBannedNoticeProps = {
  email?: string | null;
  requestedPath?: string;
  title?: string;
  description?: string;
};

export function AdminBannedNotice({
  email,
  requestedPath = "/admin",
  title = "This admin account is banned",
  description = "This account is not allowed to access admin pages.",
}: AdminBannedNoticeProps) {
  return (
    <AdminAccessNotice
      variant="banned"
      email={email}
      requestedPath={requestedPath}
      title={title}
      description={description}
      primaryHref="/"
      primaryLabel="Back home"
      secondaryHref="/dashboard"
      secondaryLabel="Go to dashboard"
    />
  );
}