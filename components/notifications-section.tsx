"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type NotificationItem = {
  id?: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  count?: number;
  type?:
    | "security"
    | "grant"
    | "announcement"
    | "account"
    | "transfer"
    | "receipt";
  href?: string;
  label?: string;
  attachmentUrl?: string;
  attachmentLabel?: string;
  details?: Array<{ label: string; value: string }>;
};

type AnnouncementItem = NotificationItem;

type NotificationType =
  | "security"
  | "grant"
  | "announcement"
  | "account"
  | "transfer"
  | "receipt";

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
  type: NotificationType;
  href: string;
  label?: string;
  attachmentUrl?: string;
  attachmentLabel?: string;
  details: Array<{ label: string; value: string }>;
};

type NotificationTypeFilter = "all" | NotificationType;

const STORAGE_KEY = "admin-notifications-read-v1";

const EMPTY_NOTIFICATIONS: NotificationItem[] = [];

const NOTIFICATION_TYPES: NotificationType[] = [
  "security",
  "grant",
  "announcement",
  "account",
  "transfer",
  "receipt",
];

/* =========================================================
   READ NOTIFICATION STORAGE
========================================================= */

function parseReadKeys(raw: string | null): Set<string> {
  if (!raw) return new Set();

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(
      parsed.filter(
        (value): value is string => typeof value === "string"
      )
    );
  } catch {
    return new Set();
  }
}

function loadStoredReadKeys(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  try {
    return parseReadKeys(
      window.localStorage.getItem(STORAGE_KEY)
    );
  } catch {
    return new Set();
  }
}

function persistReadKeys(keys: Set<string>) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(keys))
    );
  } catch {
    // Storage may be unavailable in private browsing.
  }
}

/* =========================================================
   NOTIFICATION IDENTIFICATION
========================================================= */

function makeKey(item: NotificationItem): string {
  if (item.id?.trim()) {
    return item.id.trim();
  }

  return [
    item.title,
    item.message,
    item.time,
    item.type ?? "",
    item.label ?? "",
  ].join("|");
}

/* =========================================================
   NORMALIZE NOTIFICATIONS
========================================================= */

function normalizeItem(
  item: NotificationItem,
  fallbackType: NotificationType
): CombinedItem {
  const type = item.type ?? fallbackType;

  return {
    key: makeKey(item),
    id: item.id,
    title: item.title,
    message: item.message,
    time: item.time || "Recent",
    read: item.read,
    count: item.count,
    type,
    href:
      item.href ||
      (item.id
        ? `/dashboard/notifications/${item.id}`
        : "/dashboard/notifications"),
    label: item.label,
    attachmentUrl: item.attachmentUrl,
    attachmentLabel: item.attachmentLabel,
    details: item.details ?? [],
  };
}

function normalizeCombinedItems(
  notifications: NotificationItem[],
  loginNotifications: NotificationItem[],
  announcements: AnnouncementItem[]
): CombinedItem[] {
  const combined: CombinedItem[] = [
    ...loginNotifications.map((item) =>
      normalizeItem(item, "security")
    ),

    ...notifications.map((item) =>
      normalizeItem(item, "account")
    ),

    ...announcements.map((item) =>
      normalizeItem(item, "announcement")
    ),
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

/* =========================================================
   ICONS
========================================================= */

function NotificationIcon({
  type,
  className = "h-5 w-5",
}: {
  type: NotificationType | "check";
  className?: string;
}) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      {...common}
    >
      {type === "security" && (
        <>
          <path d="M12 3 20 6v5c0 5-3.5 8.8-8 10-4.5-1.2-8-5-8-10V6l8-3z" />
          <path d="m9 12 2 2 4-4" />
        </>
      )}

      {type === "grant" && (
        <>
          <rect x="3" y="9" width="18" height="12" rx="2" />
          <path d="M12 9v12M2 9h20V6H2v3z" />
          <path d="M12 6c-4-7-9-2-5 0m5 0c4-7 9-2 5 0" />
        </>
      )}

      {type === "announcement" && (
        <>
          <path d="m3 11 18-5v12L3 13v-2z" />
          <path d="m7 14 2 6h4l-2-5" />
          <path d="M21 10v4" />
        </>
      )}

      {type === "account" && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </>
      )}

      {type === "transfer" && (
        <>
          <path d="M7 7h13l-3-3" />
          <path d="m20 7-3 3" />
          <path d="M17 17H4l3 3" />
          <path d="m4 17 3-3" />
        </>
      )}

      {type === "receipt" && (
        <>
          <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
          <path d="M9 8h6M9 12h6M9 16h3" />
        </>
      )}

      {type === "check" && (
        <path d="m5 12 4 4L19 6" />
      )}
    </svg>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-zinc-300 bg-white px-5 py-14 text-center dark:border-white/15 dark:bg-zinc-950 sm:px-8">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-6 w-6"
          aria-hidden="true"
        >
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

      <h3 className="text-base font-bold text-zinc-950 dark:text-white sm:text-lg">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {message}
      </p>
    </div>
  );
}

/* =========================================================
   FILTER CHIP
========================================================= */

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
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold capitalize transition sm:px-3.5 sm:text-xs",
        active
          ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950"
          : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10",
      ].join(" ")}
    >
      <span>{label}</span>

      <span
        className={[
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
          active
            ? "bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white"
            : "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

/* =========================================================
   NOTIFICATION ROW
========================================================= */

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
        "min-w-0 overflow-hidden rounded-2xl border transition duration-200",
        unread
          ? "border-rose-200 bg-white shadow-sm hover:border-rose-300 hover:shadow-md dark:border-rose-500/20 dark:bg-zinc-950 dark:hover:border-rose-500/40"
          : "border-zinc-200 bg-zinc-50/70 hover:bg-white dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
      ].join(" ")}
    >
      {/* Main notification link */}
      <Link
        href={item.href}
        onClick={() => onMarkRead(item.key)}
        aria-label={`Open ${item.title}${unread ? ", unread notification" : ", read notification"}`}
        className="block p-3 outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-500 sm:p-5"
      >
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          {/* Notification type icon */}
          <div
            className={[
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition sm:h-11 sm:w-11 sm:rounded-2xl",
              unread
                ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400"
                : "border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-500",
            ].join(" ")}
          >
            <NotificationIcon
              type={item.type}
              className="h-4 w-4 sm:h-5 sm:w-5"
            />
          </div>

          {/* Notification content */}
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  {unread && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full bg-rose-500 sm:h-2.5 sm:w-2.5"
                      aria-label="Unread"
                      title="Unread"
                    />
                  )}

                  <h3
                    title={item.title}
                    className={[
                      "min-w-0 truncate transition-all",
                      unread
                        ? "text-sm font-bold text-zinc-950 dark:text-white sm:text-base"
                        : "text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm",
                    ].join(" ")}
                  >
                    {item.title}
                  </h3>
                </div>

                {/* Message */}
                <p
                  className={[
                    "mt-1.5 leading-6 transition-colors",
                    unread
                      ? "text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm"
                      : "text-[11px] text-zinc-400 dark:text-zinc-500 sm:text-xs",
                  ].join(" ")}
                >
                  {item.message}
                </p>
              </div>

              {/* Time and read state */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={[
                    "whitespace-nowrap text-[10px] font-semibold tabular-nums sm:text-xs",
                    unread
                      ? "text-zinc-700 dark:text-zinc-200"
                      : "text-zinc-400 dark:text-zinc-500",
                  ].join(" ")}
                >
                  {item.time}
                </span>

                {unread ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white sm:h-6 sm:min-w-6 sm:text-[11px]">
                    {item.count ?? 1}
                  </span>
                ) : (
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-500"
                    title="Read"
                    aria-label="Read"
                  >
                    <NotificationIcon
                      type="check"
                      className="h-3 w-3"
                    />
                  </span>
                )}
              </div>
            </div>

            {/* Additional notification details */}
            {item.details.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {item.details.map((detail) => (
                  <div
                    key={`${item.key}-${detail.label}`}
                    className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {detail.label}
                    </p>

                    <p className="mt-1 break-words text-sm font-medium text-zinc-900 dark:text-zinc-200">
                      {detail.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Label */}
            {item.label && (
              <div className="mt-3">
                <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
                  {item.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Attachment download */}
      {item.attachmentUrl && (
        <div className="border-t border-zinc-200/70 px-3 py-3 dark:border-white/10 sm:px-5">
          <a
            href={item.attachmentUrl}
            download
            onClick={() => onMarkRead(item.key)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M12 3v10m0 0 3.5-3.5M12 13l-3.5-3.5M5 14.5V18a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18v-3.5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {item.attachmentLabel || "Download attachment"}
          </a>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   MAIN NOTIFICATIONS SECTION
========================================================= */

export function NotificationsSection({
  notifications = EMPTY_NOTIFICATIONS,
  loginNotifications = EMPTY_NOTIFICATIONS,
  announcements = EMPTY_NOTIFICATIONS,
  welcomeNotice = null,
}: NotificationsSectionProps) {
  /* Normalize incoming notifications */
  const combined = useMemo(
    () =>
      normalizeCombinedItems(
        notifications,
        loginNotifications,
        announcements
      ),
    [notifications, loginNotifications, announcements]
  );

  /* Initial read state */
  const [readKeys, setReadKeys] = useState<Set<string>>(() => {
    const initial = new Set<string>();

    for (const item of combined) {
      if (item.read) {
        initial.add(item.key);
      }
    }

    return initial;
  });

  /*
   * Keep a synchronous reference to read state.
   * This ensures localStorage is updated before navigation occurs.
   */
  const readKeysRef = useRef<Set<string>>(readKeys);

  /* Search and filters */
  const [query, setQuery] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<NotificationTypeFilter>("all");

  /* Scroll behaviour */
  const [showControls, setShowControls] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  /* =====================================================
     LOAD SAVED READ STATUS
  ===================================================== */

  useEffect(() => {
    const stored = loadStoredReadKeys();

    const next = new Set(readKeysRef.current);

    for (const key of stored) {
      next.add(key);
    }

    readKeysRef.current = next;
    setReadKeys(next);

    /*
     * Save merged state so notifications already marked
     * as read by the server are retained as well.
     */
    persistReadKeys(next);
  }, []);

  /* =====================================================
     SYNCHRONIZE READ STATUS BETWEEN TABS
  ===================================================== */

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== STORAGE_KEY || !event.newValue) {
        return;
      }

      const stored = parseReadKeys(event.newValue);

      const next = new Set(readKeysRef.current);

      for (const key of stored) {
        next.add(key);
      }

      readKeysRef.current = next;
      setReadKeys(next);
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  /* =====================================================
     MARK NOTIFICATION AS READ
  ===================================================== */

  const markRead = useCallback((key: string) => {
    if (readKeysRef.current.has(key)) {
      return;
    }

    const next = new Set(readKeysRef.current);

    next.add(key);

    /*
     * Update ref and React state immediately.
     */
    readKeysRef.current = next;
    setReadKeys(next);

    /*
     * Persist synchronously before navigation.
     */
    persistReadKeys(next);
  }, []);

  /* =====================================================
     MERGE SERVER AND CLIENT READ STATUS
  ===================================================== */

  const items = useMemo(
    () =>
      combined.map((item) => ({
        ...item,
        read: Boolean(readKeys.has(item.key) || item.read),
      })),
    [combined, readKeys]
  );

  /* =====================================================
     COUNTS
  ===================================================== */

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  const typeCounts = useMemo(() => {
    const counts: Record<NotificationType, number> = {
      security: 0,
      grant: 0,
      announcement: 0,
      account: 0,
      transfer: 0,
      receipt: 0,
    };

    for (const item of items) {
      counts[item.type] += 1;
    }

    return counts;
  }, [items]);

  /* =====================================================
     SEARCH AND FILTER
  ===================================================== */

  const visibleItems = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return items
      .filter((item) => {
        if (typeFilter === "all") {
          return true;
        }

        return item.type === typeFilter;
      })
      .filter((item) => {
        if (!searchTerm) {
          return true;
        }

        const searchableContent = [
          item.title,
          item.message,
          item.time,
          item.label ?? "",
          item.type,
          ...item.details.map(
            (detail) => `${detail.label} ${detail.value}`
          ),
        ]
          .join(" ")
          .toLowerCase();

        return searchableContent.includes(searchTerm);
      })
      /*
       * Unread notifications appear before read notifications.
       */
      .sort((a, b) => Number(a.read) - Number(b.read));
  }, [items, query, typeFilter]);

  /* =====================================================
     FILTER SELECTION
  ===================================================== */

  function handleTypeSelect(nextType: NotificationTypeFilter) {
    setTypeFilter((current) =>
      current === nextType ? "all" : nextType
    );
  }

  /* =====================================================
     SCROLL-BASED HEADER AND CONTROL VISIBILITY
  ===================================================== */

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    function updateVisibility() {
      const currentY = window.scrollY;

      setScrollY(currentY);

      const threshold = 8;

      const scrollingUp =
        currentY < lastY - threshold;

      const scrollingDown =
        currentY > lastY + threshold;

      if (currentY < 40) {
        setShowControls(true);
      } else if (scrollingDown) {
        setShowControls(false);
      } else if (scrollingUp) {
        setShowControls(true);
      }

      lastY = currentY;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(updateVisibility);
    }

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    updateVisibility();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const normalizedScroll =
    Math.min(Math.max(scrollY, 0), 180) / 180;

  const titleFontSize =
    44 - normalizedScroll * 12;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
      <main className="mx-auto w-full max-w-7xl space-y-5 px-3 py-3 sm:space-y-6 sm:px-6 sm:py-5 lg:px-8">

        {/* =================================================
            STICKY HEADER
        ================================================= */}

        <header className="sticky top-0 z-50 -mx-3 border-b border-zinc-200/70 bg-zinc-50/95 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="font-black tracking-tight text-zinc-950 transition-[font-size] duration-200 ease-out dark:text-white"
                style={{
                  fontSize: `clamp(2rem, ${titleFontSize}px, 2.75rem)`,
                  lineHeight: 1.05,
                }}
              >
                Inbox
              </h1>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Manage your notifications and account updates.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 dark:bg-white/10">
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  unreadCount > 0
                    ? "bg-rose-500"
                    : "bg-emerald-500",
                ].join(" ")}
              />

              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-200">
                {unreadCount} unread
              </span>
            </div>
          </div>
        </header>

        {/* =================================================
            WELCOME NOTICE
        ================================================= */}

        {welcomeNotice && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
            {welcomeNotice}
          </div>
        )}

        {/* =================================================
            FILTERS AND SEARCH
        ================================================= */}

        <div
          className={[
            "space-y-4 overflow-hidden transition-all duration-300 ease-in-out",
            showControls
              ? "max-h-80 opacity-100"
              : "pointer-events-none max-h-0 opacity-0",
          ].join(" ")}
        >
          {/* Notification type filters */}
          <div className="overflow-x-auto pb-2">
            <div className="flex w-max items-center gap-2">
              <TypeChip
                active={typeFilter === "all"}
                onClick={() => handleTypeSelect("all")}
                label="All"
                count={items.length}
              />

              {NOTIFICATION_TYPES.map((type) => (
                <TypeChip
                  key={type}
                  active={typeFilter === type}
                  onClick={() => handleTypeSelect(type)}
                  label={type}
                  count={typeCounts[type]}
                />
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-lg">
              <span className="sr-only">
                Search notifications
              </span>

              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-zinc-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
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
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search notifications..."
                className="w-full rounded-full border border-zinc-300 bg-white py-3 pl-11 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-zinc-950 dark:border-white/15 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white"
              />
            </label>

            {(query || typeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                }}
                className="shrink-0 self-start rounded-full px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10 sm:self-auto"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* =================================================
            NOTIFICATION LIST
        ================================================= */}

        {visibleItems.length > 0 ? (
          <section
            aria-label="Notifications"
            className="space-y-3 sm:space-y-4"
          >
            {visibleItems.map((item) => (
              <NotificationRow
                key={item.key}
                item={item}
                onMarkRead={markRead}
              />
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
                ? "Try a different search term or change your notification filters."
                : "New alerts, account updates, transfer receipts and announcements will appear here."
            }
          />
        )}

        {/* =================================================
            FOOTER SUMMARY
        ================================================= */}

        {items.length > 0 && (
          <footer className="border-t border-zinc-200/70 pt-5 dark:border-white/10">
            <div className="flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {visibleItems.length} of {items.length} notifications
              </span>

              <span>
                {items.length - unreadCount} read · {unreadCount} unread
              </span>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

export default NotificationsSection;
