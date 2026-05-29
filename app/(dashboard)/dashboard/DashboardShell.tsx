// app/dashboard/DashboardShell.tsx
"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { dashboardPageSections } from "@/components/navigation-sections";

export default function DashboardShell({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-zinc-50 text-zinc-950 dark:bg-zinc-900 dark:text-white">
      <SiteHeader
        isLoggedIn
        onMenuClick={() => setMobileSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        sections={dashboardPageSections}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main className="min-w-0 w-full pt-16 lg:pl-[300px]">
        <div className="mx-auto w-full max-w-full px-4 py-4 sm:px-6 lg:px-6 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}