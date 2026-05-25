"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/Badge";
import type { ApplicationRecord, Opportunity } from "@/lib/types";

export function ApplicationManager({
  opportunities,
  initialApplications
}: {
  opportunities: Opportunity[];
  initialApplications: ApplicationRecord[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    opportunitySlug: opportunities[0]?.slug ?? "",
    applicantName: "",
    email: "",
    deadline: opportunities[0]?.deadline ?? "",
    notes: ""
  });

  const selected = useMemo(
    () => opportunities.find((item) => item.slug === form.opportunitySlug) ?? opportunities[0],
    [form.opportunitySlug, opportunities]
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunitySlug: form.opportunitySlug,
          applicantName: form.applicantName,
          email: form.email,
          deadline: form.deadline,
          notes: form.notes
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to save application");
      setApplications((current) => [data.application, ...current]);
      setForm({
        opportunitySlug: opportunities[0]?.slug ?? "",
        applicantName: "",
        email: "",
        deadline: opportunities[0]?.deadline ?? "",
        notes: ""
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Track a new application</h3>
        <form onSubmit={onSubmit} className="timeline" style={{ marginTop: 16 }}>
          <select
            className="select"
            value={form.opportunitySlug}
            onChange={(e) => {
              const opportunitySlug = e.target.value;
              const opportunity = opportunities.find((item) => item.slug === opportunitySlug);
              setForm((current) => ({
                ...current,
                opportunitySlug,
                deadline: opportunity?.deadline ?? current.deadline
              }));
            }}
          >
            {opportunities.map((item) => (
              <option key={item.slug} value={item.slug}>{item.title}</option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Applicant / organization name"
            value={form.applicantName}
            onChange={(e) => setForm((current) => ({ ...current, applicantName: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
          />
          <input
            className="input"
            type="text"
            value={form.deadline}
            onChange={(e) => setForm((current) => ({ ...current, deadline: e.target.value }))}
          />
          <textarea
            className="textarea"
            placeholder="Notes, missing docs, or follow-up reminders"
            value={form.notes}
            onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
          />
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add application"}
          </button>
        </form>

        <div className="warning" style={{ marginTop: 16 }}>
          {selected ? `Selected opportunity: ${selected.title} · ${selected.amount}` : "Choose an opportunity to begin."}
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>Application log</h3>
          <Badge tone="primary">{applications.length} records</Badge>
        </div>
        <div className="timeline" style={{ marginTop: 16 }}>
          {applications.map((item) => (
            <div key={item.id} className="card muted-bg">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{item.opportunityTitle}</strong>
                <Badge tone="warn">{item.status}</Badge>
              </div>
              <div className="small">{item.applicantName} · {item.email}</div>
              <div className="small">Deadline: {item.deadline}</div>
              {item.notes ? <div className="small" style={{ marginTop: 8 }}>{item.notes}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
