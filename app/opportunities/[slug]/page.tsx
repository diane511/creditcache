import { notFound } from "next/navigation";
import { getOpportunityBySlug, opportunities } from "@/lib/data";
import { OpportunityDetail } from "@/components/OpportunityDetail";

export function generateStaticParams() {
  return opportunities.map((item) => ({ slug: item.slug }));
}

export default function OpportunityPage({ params }: { params: { slug: string } }) {
  const opportunity = getOpportunityBySlug(params.slug);
  if (!opportunity) notFound();

  return (
    <div className="page-shell">
      <OpportunityDetail opportunity={opportunity} />
    </div>
  );
}
