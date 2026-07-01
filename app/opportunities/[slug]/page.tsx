// main/app/opportunities/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import { getOpportunityBySlug, opportunities } from "@/lib/data";
import { OpportunityDetail } from "@/components/OpportunityDetail";

type OpportunityDetailProps = ComponentProps<typeof OpportunityDetail>;
type OpportunityDetailItem = OpportunityDetailProps["opportunity"];

export function generateStaticParams() {
  return opportunities.map((item) => ({ slug: item.slug }));
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const opportunity = getOpportunityBySlug(slug);

  if (!opportunity) notFound();

  return (
    <div className="page-shell">
      <OpportunityDetail
        opportunity={opportunity as unknown as OpportunityDetailItem}
      />
    </div>
  );
}