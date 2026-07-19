// main/app/admin/ops-7c3a/signup/page.tsx
import { AdminAuthForm } from "@/components/admin/admin-auth-form";
import { AdminPendingApprovalNotice } from "@/components/admin/AdminPendingApprovalNotice";

export default function AdminSignupPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-6 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Admin sign up</h1>
        <p className="text-sm text-muted-foreground">
          New admin accounts must verify their email first. After that, non-super-admin accounts may still wait for approval.
        </p>
      </div>

      <AdminAuthForm mode="signup" />

      <div className="mt-6">
        <AdminPendingApprovalNotice />
      </div>
    </main>
  );
}