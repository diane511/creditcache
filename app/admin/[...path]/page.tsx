import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPendingApprovalNotice } from "@/components/admin/AdminPendingApprovalNotice";

export default async function AdminFallbackPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/auth/signin?next=/admin");
  }

  if (sessionUser.role === "PENDING_ADMIN" || sessionUser.isApproved === false) {
    return (
      <main className="min-h-screen w-full bg-background px-4 py-5 text-foreground sm:px-6 lg:px-8">
        <AdminPendingApprovalNotice
          email={sessionUser.email ?? null}
          requestedPath="/admin"
          title="This admin page is locked until approval"
          description="You are already signed in, but your admin account is still waiting for super admin approval."
        />
      </main>
    );
  }

  if (sessionUser.role === "ADMIN" || sessionUser.role === "SUPER_ADMIN") {
    notFound();
  }

  redirect("/dashboard");
}