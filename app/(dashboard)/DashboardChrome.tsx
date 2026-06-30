// main/app/(dashboard)/DashboardChrome.tsx
"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { SiteHeader } from "@/components/SiteHeader";

type DashboardChromeProps = {
  children: ReactNode;
};

export default function DashboardChrome({ children }: DashboardChromeProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const hideChrome =
    pathname === "/dashboard/notifications" ||
    pathname === "/dashboard/profile";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      {!hideChrome && (
        <>
          <SiteHeader
            isLoggedIn
            onMenuClick={() => setMobileSidebarOpen((prev) => !prev)}
          />

          <Sidebar
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        </>
      )}

      <main
        className={[
          "w-full min-w-0 transition-all duration-300",
          hideChrome ? "" : "pt-16 lg:pl-[300px]",
        ].join(" ")}
      >
        <div
          className={[
            "w-full min-w-0",
            hideChrome ? "px-0 py-0" : "px-4 py-4 sm:px-6 lg:px-8 lg:py-6",
          ].join(" ")}
        >
          {children}
        </div>
      </main>
    </div>
  );
}