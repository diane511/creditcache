import { PageHeader } from "@/components/PageHeader";
import { OpportunityBrowser } from "@/components/OpportunityBrowser";
import { opportunities } from "@/lib/data";

export default function OpportunitiesPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Verified directory"
        title="Opportunities"
        description="Search grants, scholarships, aid programs, and transparent promotional campaigns with verification labels and timing details."
      />
      <OpportunityBrowser opportunities={opportunities} />
    </div>
  );
}
