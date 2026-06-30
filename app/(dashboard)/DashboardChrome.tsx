// main/app/(dashboard)/DashboardChrome.tsx
"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { dashboardPageSections } from "@/components/navigation-sections";

type DashboardChromeProps = {
  children: ReactNode;
};

export default function DashboardChrome({
  children,
}: DashboardChromeProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <SiteHeader
        isLoggedIn
        onMenuClick={() => setMobileSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        sections={dashboardPageSections}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main
        className="
          w-full
          min-w-0
          pt-16
          transition-all
          duration-300
          lg:pl-[300px]
        "
      >
        <div
          className="
            w-full
            min-w-0
            px-4
            py-4
            sm:px-6
            lg:px-8
            lg:py-6
          "
        >
          {children}
        </div>
      </main>
    </div>
  );
}