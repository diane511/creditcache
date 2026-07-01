// main/app/admin/winner/AdminWinnerClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminWinnerSection } from "@/components/admin/AdminWinnerSection";
import type { getAdminDashboardData } from "@/lib/admin-data";

type AdminDashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;
type AdminOpportunity = AdminDashboardData["opportunities"][number];
type AdminUser = AdminDashboardData["users"][number];

type AdminWinnerClientProps = {
  opportunities: AdminOpportunity[];
  users: AdminUser[];
};

export function AdminWinnerClient({ opportunities, users }: AdminWinnerClientProps) {
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>(
    opportunities[0]?.id ?? ""
  );

  useEffect(() => {
    if (!opportunities.length) {
      setSelectedOpportunityId("");
      return;
    }

    const stillExists = opportunities.some((item) => item.id === selectedOpportunityId);
    if (!stillExists) {
      setSelectedOpportunityId(opportunities[0].id ?? "");
    }
  }, [opportunities, selectedOpportunityId]);

  const selectedOpportunity = useMemo<AdminOpportunity | undefined>(() => {
    if (!selectedOpportunityId) return undefined;
    return opportunities.find((item) => item.id === selectedOpportunityId);
  }, [opportunities, selectedOpportunityId]);

  return (
    <AdminWinnerSection
      opportunities={opportunities}
      users={users}
      selectedOpportunity={selectedOpportunity}
      selectedOpportunityId={selectedOpportunityId}
      setSelectedOpportunityId={setSelectedOpportunityId}
    />
  );
}