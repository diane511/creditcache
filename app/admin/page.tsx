import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/admin-data";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/admin/login?next=/admin");
  }

  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-black/5 bg-white px-5 py-6 shadow-sm dark:border-white/10 dark:bg-zinc-950/60 sm:px-6 sm:py-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Manage metrics, posts, and content sections from one place.
          </p>
        </div>
      </section>

      <AdminDashboard {...data} />
    </div>
  );
}