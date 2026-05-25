"use client";

import { useState, type FormEvent } from "react";
import type { VaultRecord } from "@/lib/types";
import { Badge } from "@/components/Badge";

export function VaultManager({ initialVault }: { initialVault: VaultRecord[] }) {
  const [vault, setVault] = useState(initialVault);
  const [form, setForm] = useState({
    label: "",
    type: "General",
    notes: ""
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to save document");
      setVault((current) => [data.document, ...current]);
      setForm({ label: "", type: "General", notes: "" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <h3>Add to your record vault</h3>
        <form onSubmit={submit} className="timeline" style={{ marginTop: 16 }}>
          <input
            className="input"
            placeholder="Document label"
            value={form.label}
            onChange={(e) => setForm((current) => ({ ...current, label: e.target.value }))}
          />
          <select className="select" value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}>
            <option>General</option>
            <option>Tax</option>
            <option>Education</option>
            <option>Business</option>
            <option>Identity</option>
            <option>Receipts</option>
          </select>
          <textarea
            className="textarea"
            placeholder="Notes or context"
            value={form.notes}
            onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))}
          />
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save record"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3>Vault records</h3>
          <Badge tone="primary">{vault.length} items</Badge>
        </div>
        <div className="timeline" style={{ marginTop: 16 }}>
          {vault.map((item) => (
            <div key={item.id} className="card muted-bg">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{item.label}</strong>
                <Badge>{item.type}</Badge>
              </div>
              <div className="small">Added {item.dateAdded}</div>
              <div className="small">{item.notes}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
