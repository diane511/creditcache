"use client";

import { useState, type FormEvent } from "react";
import type { ScamReport } from "@/lib/types";
import { Badge } from "@/components/Badge";

export function ScamCenterClient({ initialReports }: { initialReports: ScamReport[] }) {
  const [reports, setReports] = useState(initialReports);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ topic: "", channel: "Email", description: "" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/scam-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to submit report");
      setReports((current) => [data.report, ...current]);
      setForm({ topic: "", channel: "Email", description: "" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Report a suspicious offer</h3>
        <form onSubmit={submit} className="timeline" style={{ marginTop: 16 }}>
          <input className="input" placeholder="What happened?" value={form.topic} onChange={(e) => setForm((c) => ({ ...c, topic: e.target.value }))} />
          <select className="select" value={form.channel} onChange={(e) => setForm((c) => ({ ...c, channel: e.target.value }))}>
            <option>Email</option>
            <option>SMS</option>
            <option>Instagram DM</option>
            <option>Facebook</option>
            <option>Website</option>
            <option>Phone call</option>
          </select>
          <textarea className="textarea" placeholder="Describe the message, fee request, or impersonation detail" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
          <button className="btn primary" type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit report"}</button>
        </form>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>Active reports</h3>
          <Badge tone="primary">{reports.length} cases</Badge>
        </div>
        <div className="timeline" style={{ marginTop: 16 }}>
          {reports.map((report) => (
            <div key={report.id} className="card muted-bg">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{report.topic}</strong>
                <Badge tone={report.status === "Resolved" ? "good" : "warn"}>{report.status}</Badge>
              </div>
              <div className="small">{report.channel} · {report.createdAt.slice(0, 10)}</div>
              <div className="small">{report.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
