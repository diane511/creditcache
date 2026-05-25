"use client";

import { useState, type FormEvent } from "react";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState("saving");
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    setEmail("");
    setState("done");
    setTimeout(() => setState("idle"), 3000);
  }

  return (
    <form onSubmit={submit} className="card row" style={{ justifyContent: "space-between", gap: 14, alignItems: "center" }}>
      <div>
        <strong>Get new opportunities and safety updates</strong>
        <div className="small">Weekly summaries with verified listings, deadline reminders, and scam alerts.</div>
      </div>
      <div className="row" style={{ flex: 1, justifyContent: "flex-end" }}>
        <input className="input" style={{ minWidth: 280 }} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn primary" type="submit">{state === "done" ? "Subscribed" : state === "saving" ? "Saving..." : "Subscribe"}</button>
      </div>
    </form>
  );
}
