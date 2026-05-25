"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { Badge } from "@/components/Badge";

const categories = ["All", "Grant", "Scholarship", "Aid", "Promotion", "Resource"] as const;

export function OpportunityBrowser({ opportunities }: { opportunities: Opportunity[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [region, setRegion] = useState("All");
  const [verified, setVerified] = useState("All");

  const regions = useMemo(() => {
    const values = new Set(opportunities.map((item) => item.region));
    return ["All", ...Array.from(values)];
  }, [opportunities]);

  const filtered = useMemo(() => {
    return opportunities.filter((item) => {
      const text = `${item.title} ${item.summary} ${item.tags.join(" ")} ${item.region} ${item.source}`.toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesCategory = category === "All" || item.category === category;
      const matchesRegion = region === "All" || item.region === region;
      const matchesVerified = verified === "All" || (verified === "Verified" ? item.verified : !item.verified);
      return matchesQuery && matchesCategory && matchesRegion && matchesVerified;
    });
  }, [opportunities, query, category, region, verified]);

  return (
    <div className="section">
      <div className="card">
        <div className="filters">
          <input className="input" placeholder="Search by keyword, source, or tag" value={query} onChange={(e) => setQuery(e.target.value)} />
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
            {regions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className="select" value={verified} onChange={(e) => setVerified(e.target.value)}>
            <option>All</option>
            <option>Verified</option>
            <option>Unverified</option>
          </select>
        </div>
      </div>

      <div className="opportunity-list" style={{ marginTop: 16 }}>
        {filtered.length ? filtered.map((item) => (
          <article key={item.slug} className="card opportunity">
            <div>
              <div className="title-row">
                <div className="row">
                  <h3>{item.title}</h3>
                  {item.featured ? <Badge tone="primary">Featured</Badge> : null}
                  <Badge tone={item.verified ? "good" : "warn"}>{item.verified ? "Verified" : "Review"}</Badge>
                </div>
                <Badge>{item.category}</Badge>
              </div>

              <p className="summary">{item.summary}</p>

              <div className="chips">
                <span className="chip">Amount: {item.amount}</span>
                <span className="chip">Deadline: {item.deadline}</span>
                <span className="chip">Region: {item.region}</span>
                <span className="chip">Source: {item.sourceLabel}</span>
              </div>

              <div className="chips">
                {item.tags.map((tag) => <span key={tag} className="chip good">{tag}</span>)}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="small">Last checked {item.lastChecked}</div>
              <Link className="btn primary" href={`/opportunities/${item.slug}`}>{item.ctaText}</Link>
            </div>
          </article>
        )) : (
          <div className="card">
            <h3>No matches yet</h3>
            <p>Try a wider search or remove a filter to see more opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}
