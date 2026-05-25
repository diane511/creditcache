import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { Badge } from "@/components/Badge";
import { relatedOpportunities } from "@/lib/data";

export function OpportunityDetail({ opportunity }: { opportunity: Opportunity }) {
  const related = relatedOpportunities(opportunity.slug);

  return (
    <div className="split">
      <div className="card strong">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="row">
            <Badge tone="primary">{opportunity.category}</Badge>
            <Badge tone={opportunity.verified ? "good" : "warn"}>{opportunity.verified ? "Verified source" : "Review needed"}</Badge>
          </div>
          <span className="small">Last checked {opportunity.lastChecked}</span>
        </div>

        <h1 style={{ marginTop: 12, marginBottom: 8, fontSize: "2.4rem", letterSpacing: "-0.04em" }}>{opportunity.title}</h1>
        <p style={{ fontSize: "1.08rem" }}>{opportunity.summary}</p>

        <div className="chips">
          <span className="chip">Amount: {opportunity.amount}</span>
          <span className="chip">Deadline: {opportunity.deadline}</span>
          <span className="chip">Region: {opportunity.region}</span>
          <span className="chip">Source: {opportunity.source}</span>
        </div>

        <div className="notice" style={{ marginTop: 16 }}>
          Credit Cache never guarantees approval, selection, winnings, or reimbursement. Always review official rules and eligibility directly on the source page.
        </div>

        <div className="section">
          <h3>Eligibility snapshot</h3>
          <ul>
            {opportunity.eligibility.map((item) => <li key={item} className="small">{item}</li>)}
          </ul>
        </div>

        <div className="section">
          <h3>Typical documents</h3>
          <ul>
            {opportunity.documents.map((item) => <li key={item} className="small">{item}</li>)}
          </ul>
        </div>

        <div className="hero-cta">
          <a className="btn primary" href={`https://${opportunity.source}`} target="_blank" rel="noreferrer">{opportunity.ctaText}</a>
          <Link className="btn ghost" href="/applications">Track an application</Link>
        </div>
      </div>

      <aside className="card">
        <h3>Next best actions</h3>
        <div className="timeline">
          <div className="timeline-item">
            <strong>Save the opportunity</strong>
            <div className="small">Bookmark it, then copy the deadline and document list into your checklist.</div>
          </div>
          <div className="timeline-item">
            <strong>Prepare the vault</strong>
            <div className="small">Collect transcripts, tax documents, IDs, and notes in one secure place.</div>
          </div>
          <div className="timeline-item">
            <strong>Submit on the official source</strong>
            <div className="small">Use the original listing link and keep your confirmation record.</div>
          </div>
        </div>

        <div className="section">
          <h3>Related opportunities</h3>
          <div className="timeline">
            {related.map((item) => (
              <Link key={item.slug} className="card muted-bg" href={`/opportunities/${item.slug}`} style={{ display: "block" }}>
                <strong>{item.title}</strong>
                <div className="small">{item.amount} · {item.deadline}</div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
