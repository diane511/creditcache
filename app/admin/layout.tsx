// main/app/admin/layout.tsx
"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { SiteHeader } from "@/components/SiteHeader";
import { adminPageSections } from "@/components/navigation-sections";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  const showAdminChrome = pathname === "/admin";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-900 dark:text-white">
      {showAdminChrome ? (
        <>
          <SiteHeader
            isLoggedIn
            onMenuClick={() => setMobileSidebarOpen((prev) => !prev)}
          />

          <Sidebar
            sections={adminPageSections}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        </>
      ) : null}

      <main className={showAdminChrome ? "min-h-screen w-full pt-16" : "min-h-screen w-full"}>
        {children}
      </main>
    </div>
  );
}