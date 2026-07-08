import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { getPartnerPackages } from "@/lib/data";

type PartnerPackage = {
  name: string;
  price: string;
  details: string[];
};

export default async function PartnerPage() {
  const packages = (await getPartnerPackages()) as unknown as PartnerPackage[];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Verified partner tools"
        title="Partner portal"
        description="For foundations, nonprofits, schools, and service providers that need trusted distribution and clear reporting."
      />
      <div className="grid-3">
        {packages.map((pkg) => (
          <div key={pkg.name} className="card strong">
            <div className="row" style={{ justifyContent: "space-between" }}>
              <Badge tone="primary">{pkg.name}</Badge>
              <strong>{pkg.price}</strong>
            </div>
            <ul>
              {pkg.details.map((detail) => (
                <li key={detail} className="small">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <section className="section grid-2">
        <div className="card">
          <h3>Partner onboarding</h3>
          <div className="timeline">
            <div className="timeline-item">
              <strong>1. Verify source</strong>
              <div className="small">
                Share your official organization details and public opportunity pages.
              </div>
            </div>
            <div className="timeline-item">
              <strong>2. Create listings</strong>
              <div className="small">
                Submit structured opportunities with eligibility and deadline fields.
              </div>
            </div>
            <div className="timeline-item">
              <strong>3. Monitor performance</strong>
              <div className="small">
                Review traffic, saves, application starts, and completion patterns.
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Benefits</h3>
          <div className="timeline">
            <div className="timeline-item">
              <strong>Audience trust</strong>
              <div className="small">
                Your opportunity gets a verification badge and source label.
              </div>
            </div>
            <div className="timeline-item">
              <strong>Cleaner applicant flow</strong>
              <div className="small">
                Applicants can see deadlines, documents, and next steps before clicking through.
              </div>
            </div>
            <div className="timeline-item">
              <strong>Reporting</strong>
              <div className="small">
                Access performance summaries and improve campaign quality over time.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}