import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { getOpportunityBySlug, getOpportunities } from "@/lib/data";
import { OpportunityDetail } from "@/components/OpportunityDetail";

type OpportunityDetailProps = ComponentProps<typeof OpportunityDetail>;
type OpportunityDetailItem = OpportunityDetailProps["opportunity"];

export async function generateStaticParams() {
  const opportunities = await getOpportunities();
  return opportunities.map((item) => ({ slug: item.slug }));
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = await getOpportunityBySlug(slug);

  if (!opportunity) notFound();

  return (
    <div className="page-shell">
      <OpportunityDetail
        opportunity={opportunity as unknown as OpportunityDetailItem}
      />
    </div>
  );
}