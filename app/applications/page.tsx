// main/app/applications/page.tsx

import { PageHeader } from "@/components/PageHeader";
import { ApplicationManager } from "@/components/ApplicationManager";
import { getApplications, getOpportunities } from "@/lib/data";
import type { ApplicationRecord, Opportunity } from "@/lib/types";

export default async function ApplicationsPage() {
  const [opportunities, applications] = await Promise.all([
    getOpportunities(),
    getApplications(),
  ]);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Workflow"
        title="Application tracker"
        description="Track drafts, submissions, follow-ups, and missing documents without losing your place."
      />

      <ApplicationManager
        opportunities={opportunities as unknown as Opportunity[]}
        initialApplications={
          applications as unknown as ApplicationRecord[]
        }
      />
    </div>
  );
}