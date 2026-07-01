// main/app/opportunities/page.tsx
import type { ComponentProps } from "react";
import { PageHeader } from "@/components/PageHeader";
import { OpportunityBrowser } from "@/components/OpportunityBrowser";
import { opportunities } from "@/lib/data";

type OpportunityBrowserProps = ComponentProps<typeof OpportunityBrowser>;

export default function OpportunitiesPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Verified directory"
        title="Opportunities"
        description="Search grants, scholarships, aid programs, and transparent promotional campaigns with verification labels and timing details."
      />
      <OpportunityBrowser
        opportunities={opportunities as unknown as OpportunityBrowserProps["opportunities"]}
      />
    </div>
  );
}