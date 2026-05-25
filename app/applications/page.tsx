import { PageHeader } from "@/components/PageHeader";
import { ApplicationManager } from "@/components/ApplicationManager";
import { opportunities, applications } from "@/lib/data";

export default function ApplicationsPage() {
  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Workflow"
        title="Application tracker"
        description="Track drafts, submissions, follow-ups, and missing documents without losing your place."
      />
      <ApplicationManager
        opportunities={opportunities}
        initialApplications={applications}
      />
    </div>
  );
}