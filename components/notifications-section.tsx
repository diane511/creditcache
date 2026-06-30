"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type NotificationItem = {
  id?: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  count?: number;
  type?: "security" | "grant" | "announcement" | "account" | "transfer" | "receipt";
  href?: string;
  label?: string;
  attachmentUrl?: string;
  attachmentLabel?: string;
  details?: Array<{ label: string; value: string }>;
};

type AnnouncementItem = NotificationItem;

type NotificationsSectionProps = {
  notifications?: NotificationItem[];
  loginNotifications?: NotificationItem[];
  announcements?: AnnouncementItem[];
  welcomeNotice?: string | null;
};

type CombinedItem = {
  key: string;
  id?: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  count?: number;
  type: "security" | "grant" | "announcement" | "account" | "transfer" | "receipt";
  href: string;
  label?: string;
  attachmentUrl?: string;
  attachmentLabel?: string;
  details: Array<{ label: string; value: string }>;
};

type NotificationTypeFilter = "all" | CombinedItem["type"];

const STORAGE_KEY = "admin-notifications-read-v1";

function loadStoredReadKeys(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set<string>();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set<string>();

    return new Set(parsed.map(String));
  } catch {
    return new Set<string>();
  }
}

function persistReadKeys(keys: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...keys]));
  } catch {
    // ignore storage failures
  }
}

function makeKey(item: NotificationItem) {
  return (
    item.id?.trim() ||
    [item.title, item.message, item.time, item.type ?? "", item.label ?? ""].join("|")
  );
}

function normalizeCombinedItems(
  notifications: NotificationItem[],
  loginNotifications: NotificationItem[],
  announcements: AnnouncementItem[],
): CombinedItem[] {
  const combined: CombinedItem[] = [
    ...loginNotifications.map((item) => ({
      key: makeKey(item),
      id: item.id,
      title: item.title,
      message: item.message,
      time: item.time,
      read: item.read,
      count: item.count,
      type: item.type || "security",
      href:
        item.href || (item.id ? `/dashboard/notifications/${item.id}` : "/dashboard/notifications"),
      label: item.label,
      attachmentUrl: item.attachmentUrl,
      attachmentLabel: item.attachmentLabel,
      details: item.details || [],
    })),
    ...notifications.map((item) => ({
      key: makeKey(item),
      id: item.id,
      title: item.title,
      message: item.message,
      time: item.time,
      read: item.read,
      count: item.count,
      type: item.type || "account",
      href:
        item.href || (item.id ? `/dashboard/notifications/${item.id}` : "/dashboard/notifications"),
      label: item.label,
      attachmentUrl: item.attachmentUrl,
      attachmentLabel: item.attachmentLabel,
      details: item.details || [],
    })),
    ...announcements.map((item) => ({
      key: makeKey(item),
      id: item.id,
      title: item.title,
      message: item.message,
      time: item.time || "Recent",
      read: item.read,
      count: item.count,
      type: item.type || "announcement",
      href:
        item.href || (item.id ? `/dashboard/notifications/${item.id}` : "/dashboard/notifications"),
      label: item.label,
      attachmentUrl: item.attachmentUrl,
      attachmentLabel: item.attachmentLabel,
      details: item.details || [],
    })),
  ];

  const deduped: CombinedItem[] = [];
  const seen = new Set<string>();

  for (const item of combined) {
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    deduped.push(item);
  }

  return deduped;
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-zinc-300 bg-white px-6 py-16 text-center shadow-sm dark:border-white/15 dark:bg-zinc-950">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-200">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
          <path
            d="M7 8.5h10M7 12h10M7 15.5h6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <path
            d="M6 3.75h12A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}

function TypeChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition",
        active
          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
          : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/10",
      ].join(" ")}
    >
      <span className="capitalize">{label}</span>
      <span
        className={[
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
          active
            ? "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white"
            : "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: CombinedItem;
  onMarkRead: (key: string) => void;
}) {
  const unread = !item.read;

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl border p-4 transition sm:p-5",
        "border-zinc-300 bg-white shadow-sm hover:shadow-md dark:border-white/15 dark:bg-zinc-950",
      ].join(" ")}
    >
      <Link
        href={item.href}
        onClick={() => onMarkRead(item.key)}
        aria-label={`Open ${item.title}`}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/70"
      />

      <div className="relative z-20 flex items-start gap-4 pointer-events-none">
        <div
          className={[
            "mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-xs font-black uppercase tracking-wider",
            unread
              ? "border-zinc-900 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
              : "border-zinc-300 bg-zinc-100 text-zinc-500 dark:border-white/10 dark:bg-white/10 dark:text-zinc-300",
          ].join(" ")}
        >
          {item.type.slice(0, 2)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                {unread ? (
                  <span
                    className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-950 dark:bg-white"
                    aria-hidden="true"
                  />
                ) : null}

                <span
                  title={item.title}
                  className={[
                    "min-w-0 truncate text-base font-semibold",
                    "text-zinc-950 dark:text-white",
                  ].join(" ")}
                >
                  {item.title}
                </span>
              </div>

              <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                {item.message}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-xs font-bold tabular-nums text-zinc-900 dark:text-white">
                {item.time}
              </div>

              {unread ? (
                <div className="mt-2 flex justify-end">
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-950 px-2 text-[11px] font-bold leading-none text-white shadow-sm dark:bg-white dark:text-zinc-950">
                    {item.count ?? 1}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {item.details.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {item.details.map((detail) => (
                <div
                  key={`${item.key}-${detail.label}`}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                    {detail.label}
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">
                    {detail.value}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {item.attachmentUrl ? (
              <a
                href={item.attachmentUrl}
                onClick={() => onMarkRead(item.key)}
                className="pointer-events-auto relative z-30 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/10"
                download
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M12 3v10m0 0 3.5-3.5M12 13l-3.5-3.5M5 14.5V18a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-3.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {item.attachmentLabel || "PDF attachment"}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export function NotificationsSection({
  notifications = [],
  loginNotifications = [],
  announcements = [],
  welcomeNotice = null,
}: NotificationsSectionProps) {
  const combined = useMemo(
    () => normalizeCombinedItems(notifications, loginNotifications, announcements),
    [notifications, loginNotifications, announcements],
  );

  const [readKeys, setReadKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of combined) {
      if (item.read) initial.add(item.key);
    }
    return initial;
  });

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("all");
  const [showControls, setShowControls] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const stored = loadStoredReadKeys();
    if (!stored.size) return;

    setReadKeys((current) => {
      const next = new Set(current);
      for (const key of stored) next.add(key);
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let lastY = window.scrollY;
    let ticking = false;

    const updateVisibility = () => {
      const currentY = window.scrollY;
      setScrollY(currentY);

      const threshold = 8;
      const scrollingUp = currentY < lastY - threshold;
      const scrollingDown = currentY > lastY + threshold;

      if (currentY < 40) {
        setShowControls(true);
      } else if (scrollingDown) {
        setShowControls(false);
      } else if (scrollingUp) {
        setShowControls(true);
      }

      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateVisibility);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateVisibility();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const items = useMemo(
    () =>
      combined.map((item) => ({
        ...item,
        read: readKeys.has(item.key) || item.read,
      })),
    [combined, readKeys],
  );

  const typeCounts = useMemo(() => {
    const counts: Record<CombinedItem["type"], number> = {
      security: 0,
      grant: 0,
      announcement: 0,
      account: 0,
      transfer: 0,
      receipt: 0,
    };

    for (const item of items) counts[item.type] += 1;
    return counts;
  }, [items]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .filter((item) => {
        if (typeFilter === "all") return true;
        return item.type === typeFilter;
      })
      .filter((item) => {
        if (!q) return true;
        const haystack = [
          item.title,
          item.message,
          item.time,
          item.label ?? "",
          item.type,
          ...(item.details?.map((d) => `${d.label} ${d.value}`) ?? []),
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(q);
      })
      .sort((a, b) => Number(a.read) - Number(b.read));
  }, [items, query, typeFilter]);

  function markRead(key: string) {
    setReadKeys((current) => {
      const next = new Set(current);
      next.add(key);
      persistReadKeys(next);
      return next;
    });
  }

  function handleTypeSelect(nextType: NotificationTypeFilter) {
    setTypeFilter((current) => (current === nextType ? "all" : nextType));
  }

  const maxScrollForTitle = 180;
  const normalizedScroll = Math.min(Math.max(scrollY, 0), maxScrollForTitle) / maxScrollForTitle;
  const titleFontSize = 44 - normalizedScroll * 14;

  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <main className="min-w-0 space-y-6">
            <div className="sticky top-0 z-50 -mx-4 border-b border-zinc-200/70 bg-zinc-50/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-zinc-950/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <h1
                className="font-black tracking-tight transition-[font-size] duration-200 ease-out"
                style={{
                  fontSize: `${titleFontSize}px`,
                  lineHeight: 1.05,
                }}
              >
                Inbox
              </h1>
            </div>

            <div
              className={[
                "space-y-3 overflow-hidden transition-all duration-300 ease-in-out",
                showControls ? "max-h-[220px] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
              ].join(" ")}
            >
              <div className="overflow-x-auto pb-1">
                <div className="flex w-max flex-nowrap items-center gap-2">
                  <TypeChip
                    active={typeFilter === "all"}
                    onClick={() => handleTypeSelect("all")}
                    label="All"
                    count={items.length}
                  />
                  <TypeChip
                    active={typeFilter === "security"}
                    onClick={() => handleTypeSelect("security")}
                    label="Security"
                    count={typeCounts.security}
                  />
                  <TypeChip
                    active={typeFilter === "grant"}
                    onClick={() => handleTypeSelect("grant")}
                    label="Grant"
                    count={typeCounts.grant}
                  />
                  <TypeChip
                    active={typeFilter === "announcement"}
                    onClick={() => handleTypeSelect("announcement")}
                    label="Announcement"
                    count={typeCounts.announcement}
                  />
                  <TypeChip
                    active={typeFilter === "account"}
                    onClick={() => handleTypeSelect("account")}
                    label="Account"
                    count={typeCounts.account}
                  />
                  <TypeChip
                    active={typeFilter === "transfer"}
                    onClick={() => handleTypeSelect("transfer")}
                    label="Transfer"
                    count={typeCounts.transfer}
                  />
                  <TypeChip
                    active={typeFilter === "receipt"}
                    onClick={() => handleTypeSelect("receipt")}
                    label="Receipt"
                    count={typeCounts.receipt}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <label className="relative w-full lg:max-w-md">
                  <span className="sr-only">Search notifications</span>
                  <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path
                        d="m20 20-4.25-4.25M9.5 16.25a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5Z"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search title, message, type, label..."
                    className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-11 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/15 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white"
                  />
                </label>
              </div>
            </div>

            {visibleItems.length ? (
              <section className="space-y-4">
                {visibleItems.map((item) => (
                  <NotificationRow key={item.key} item={item} onMarkRead={markRead} />
                ))}
              </section>
            ) : (
              <EmptyState
                title={
                  query || typeFilter !== "all"
                    ? "No matching notifications"
                    : "No notifications yet"
                }
                message={
                  query || typeFilter !== "all"
                    ? "Try a different search term or switch filters."
                    : "New alerts, account updates, transfer receipts, and announcements will appear here."
                }
              />
            )}
          </main>

          <aside className="xl:sticky xl:top-6 xl:self-start">
            <div className="space-y-6">{/* sidebar space reserved */}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default NotificationsSection;