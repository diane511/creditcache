"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";

export default function SettingsPage() {
  const [dark, setDark] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [language, setLanguage] = useState("English");

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Personalization"
        title="Settings"
        description="Adjust your alert cadence, display preferences, and access habits."
      />
      <div className="grid-2">
        <div className="card">
          <h3>Preferences</h3>
          <div className="timeline" style={{ marginTop: 16 }}>
            <label className="row" style={{ justifyContent: "space-between" }}>
              <span>Theme</span>
              <button className="btn ghost" type="button" onClick={() => setDark((v) => !v)}>
                {dark ? "Dark" : "Light"}
              </button>
            </label>
            <label className="row" style={{ justifyContent: "space-between" }}>
              <span>Priority alerts</span>
              <button className="btn ghost" type="button" onClick={() => setAlerts((v) => !v)}>
                {alerts ? "On" : "Off"}
              </button>
            </label>
            <label className="row" style={{ justifyContent: "space-between" }}>
              <span>Language</span>
              <select className="select" style={{ maxWidth: 220 }} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Arabic</option>
                <option>Portuguese</option>
              </select>
            </label>
          </div>
        </div>

        <div className="card">
          <h3>Account safety</h3>
          <div className="timeline" style={{ marginTop: 16 }}>
            <div className="timeline-item"><strong>Multi-factor authentication</strong><div className="small">Recommended for all users and required for admins.</div></div>
            <div className="timeline-item"><strong>Device alerts</strong><div className="small">Monitor new logins and sensitive record access.</div></div>
            <div className="timeline-item"><strong>Privacy</strong><div className="small">Keep personal details visible only when necessary for matching or submissions.</div></div>
            <div className="timeline-item"><strong>Subscription</strong><div className="small">Current plan: <Badge tone="primary">Free</Badge></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
