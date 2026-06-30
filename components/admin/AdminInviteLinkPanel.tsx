"use client";

import { useMemo, useState } from "react";

type InviteLink = {
  id: string;
  token: string;
  label: string | null;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  signupUrl: string;
};

type Props = {
  initialLinks: InviteLink[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusTone(active: boolean) {
  return active
    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200"
    : "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300";
}

function LinkShell({ url }: { url: string }) {
  return (
    <div className="truncate font-mono text-[13px] leading-6 tracking-[-0.01em] text-zinc-700 dark:text-zinc-200">
      {url}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="border-t border-black/5 pt-4 dark:border-white/10">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white">
        {value}
      </div>
    </div>
  );
}

export function AdminInviteLinkPanel({ initialLinks }: Props) {
  const [links, setLinks] = useState<InviteLink[]>(initialLinks);
  const [creating, setCreating] = useState(false);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const primaryLink = links[0] ?? null;

  const stats = useMemo(() => {
    const total = links.length;
    const active = links.filter((link) => link.active).length;
    const totalUses = links.reduce((sum, link) => sum + link.usedCount, 0);

    return { total, active, totalUses };
  }, [links]);

  async function copyLink(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopyingId(id);
      setMessage("Invite link copied.");
      setError(null);
      window.setTimeout(() => setCopyingId(null), 1200);
    } catch {
      setError("Could not copy the link.");
      setMessage(null);
    }
  }

  async function createNewLink() {
    setCreating(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/signup-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          label: "Admin invite link",
          active: true,
          maxUses: 1,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "Could not create invite link.");
      }

      const created = data?.link as InviteLink | undefined;

      if (!created) {
        throw new Error("Could not create invite link.");
      }

      setLinks((current) => [created, ...current]);
      setMessage("New invite link created.");
      await copyLink(created.signupUrl, created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create invite link.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-black/5 pb-6 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-zinc-400">
            Invite hub
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Private signup links
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Create, copy, and monitor invite links in a dedicated workspace.
          </p>
        </div>

        <button
          type="button"
          onClick={createNewLink}
          disabled={creating}
          className="inline-flex items-center justify-center rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
        >
          {creating ? "Creating..." : "Create invite link"}
        </button>
      </header>

      <dl className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total links" value={stats.total} />
        <Stat label="Active" value={stats.active} />
        <Stat label="Total uses" value={stats.totalUses} />
      </dl>

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {primaryLink ? (
        <article className="space-y-4 border-b border-black/5 pb-6 dark:border-white/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold text-zinc-950 dark:text-white">
                  {primaryLink.label || "Primary invite link"}
                </div>
                <span
                  className={[
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                    statusTone(primaryLink.active),
                  ].join(" ")}
                >
                  {primaryLink.active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-3 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <LinkShell url={primaryLink.signupUrl} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                  Uses: {primaryLink.usedCount}
                  {primaryLink.maxUses ? ` / ${primaryLink.maxUses}` : ""}
                </span>
                <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                  Created: {formatDate(primaryLink.createdAt)}
                </span>
                {primaryLink.lastUsedAt ? (
                  <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                    Last used: {formatDate(primaryLink.lastUsedAt)}
                  </span>
                ) : null}
                {primaryLink.expiresAt ? (
                  <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                    Expires: {formatDate(primaryLink.expiresAt)}
                  </span>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyLink(primaryLink.signupUrl, primaryLink.id)}
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              {copyingId === primaryLink.id ? "Copied" : "Copy link"}
            </button>
          </div>
        </article>
      ) : (
        <div className="rounded-2xl border border-dashed border-black/10 px-5 py-8 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          <div className="text-base font-semibold text-zinc-950 dark:text-white">
            No invite links yet
          </div>
          <p className="mt-2 max-w-xl leading-6">
            Create your first invite link to generate a private signup URL for your account.
          </p>
        </div>
      )}

      {links.length > 1 ? (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
            Link history
          </div>

          <div className="divide-y divide-black/5 dark:divide-white/10">
            {links.slice(1).map((link) => (
              <article key={link.id} className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                      {link.label || "Invite link"}
                    </div>
                    <span
                      className={[
                        "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                        statusTone(link.active),
                      ].join(" ")}
                    >
                      {link.active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-3 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <LinkShell url={link.signupUrl} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                      Uses: {link.usedCount}
                      {link.maxUses ? ` / ${link.maxUses}` : ""}
                    </span>
                    <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                      Created: {formatDate(link.createdAt)}
                    </span>
                    {link.lastUsedAt ? (
                      <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                        Last used: {formatDate(link.lastUsedAt)}
                      </span>
                    ) : null}
                    {link.expiresAt ? (
                      <span className="rounded-full border border-black/5 bg-white px-3 py-1 dark:border-white/10 dark:bg-white/5">
                        Expires: {formatDate(link.expiresAt)}
                      </span>
                    ) : null}
                  </div>

                  {link.maxUses ? (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-zinc-950 dark:bg-white"
                        style={{
                          width: `${Math.min((link.usedCount / link.maxUses) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => copyLink(link.signupUrl, link.id)}
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                >
                  {copyingId === link.id ? "Copied" : "Copy"}
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AdminInviteLinkPanel;