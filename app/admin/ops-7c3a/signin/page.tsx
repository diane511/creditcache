// main/app/admin/ops-7c3a/signin/page.tsx
import { AdminAuthForm } from "@/components/admin/admin-auth-form";
import { AdminPendingApprovalNotice } from "@/components/admin/AdminPendingApprovalNotice";

export default function AdminSigninPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Admin sign in</h1>
        <p className="text-sm text-muted-foreground">
          Verified admins who are still waiting on super admin approval will see a hold message after sign-in.
        </p>
      </div>

      <AdminAuthForm mode="signin" />

      <div className="mt-6">
        <AdminPendingApprovalNotice />
      </div>
    </main>
  );
}