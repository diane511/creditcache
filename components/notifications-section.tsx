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
  if (!raw) return new Set<string>();

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(
      parsed.filter(
        (value): value is string => typeof value === "string"
      )
    );
  } catch {
    return new Set<string>();
  }
}

function loadStoredReadKeys(): Set<string> {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  try {
    return parseReadKeys(
      window.localStorage.getItem(STORAGE_KEY)
    );
  } catch {
    return new Set<string>();
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
    // Ignore localStorage failures.
  }
}

/* =========================================================
   NOTIFICATION IDENTIFICATION
========================================================= */

function makeKey(item: NotificationItem): string {
  return (
    item.id?.trim() ||
    [
      item.title,
      item.message,
      item.time,
      item.type ?? "",
      item.label ?? "",
    ].join("|")
  );
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
   RESPONSIVE ICONS
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
        "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold capitalize transition",
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10",
      ].join(" ")}
    >
      <span>{label}</span>

      {/* Only unread notifications are counted */}
      <span
        className={[
          "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
          active
            ? "bg-white/20 text-white"
            : count > 0
              ? "bg-rose-500 text-white"
              : "bg-zinc-200 text-zinc-500 dark:bg-white/10 dark:text-zinc-400",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}

/* =========================================================
   NOTIFICATION ROW
   WHATSAPP-INSPIRED FLAT LIST DESIGN
========================================================= */

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: CombinedItem;
  onMarkRead: (key: string) => void;
}) {
  const unread = !item.read;

  const iconColors: Record<NotificationType, string> = {
    security:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    grant:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    announcement:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    account:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    transfer:
      "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
    receipt:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  };

  return (
    <div
      className={[
        "group flex min-w-0 items-center gap-3 px-3 py-3 transition-colors sm:gap-4 sm:px-5 sm:py-4",
        "hover:bg-zinc-100/70 dark:hover:bg-white/[0.04]",
        unread ? "bg-white dark:bg-zinc-950" : "bg-transparent",
      ].join(" ")}
    >
      {/* Notification icon / avatar */}
      <div className="relative shrink-0">
        <div
          className={[
            "flex h-11 w-11 items-center justify-center rounded-full sm:h-12 sm:w-12",
            unread
              ? iconColors[item.type]
              : "bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500",
          ].join(" ")}
        >
          <NotificationIcon
            type={item.type}
            className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
          />
        </div>

        {/* Unread indicator */}
        {unread && (
          <span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-zinc-950"
            aria-label="Unread notification"
            title="Unread"
          />
        )}
      </div>

      {/* Main notification content */}
      <Link
        href={item.href}
        onClick={() => onMarkRead(item.key)}
        aria-label={`Open ${item.title}`}
        className="min-w-0 flex-1 outline-none"
      >
        {/* Title and time */}
        <div className="flex min-w-0 items-center justify-between gap-2">
          <h3
            title={item.title}
            className={[
              "min-w-0 flex-1 truncate transition-colors",
              unread
                ? "text-sm font-bold text-zinc-950 dark:text-white sm:text-[15px]"
                : "text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:text-sm",
            ].join(" ")}
          >
            {item.title}
          </h3>

          <span
            className={[
              "shrink-0 whitespace-nowrap text-[10px] tabular-nums sm:text-xs",
              unread
                ? "font-semibold text-emerald-700 dark:text-emerald-400"
                : "font-medium text-zinc-400 dark:text-zinc-500",
            ].join(" ")}
          >
            {item.time}
          </span>
        </div>

        {/* Message preview */}
        <div className="mt-1 flex min-w-0 items-center justify-between gap-3">
          <p
            className={[
              "min-w-0 flex-1 truncate text-xs leading-5 transition-colors sm:text-sm",
              unread
                ? "font-medium text-zinc-600 dark:text-zinc-300"
                : "font-normal text-zinc-400 dark:text-zinc-500",
            ].join(" ")}
          >
            {item.message}
          </p>

          {/* Unread message badge */}
          {unread && (item.count ?? 0) > 1 ? (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
              {item.count}
            </span>
          ) : !unread ? (
            <span
              className="shrink-0 text-zinc-400 dark:text-zinc-600"
              title="Read"
              aria-label="Read"
            >
              <NotificationIcon
                type="check"
                className="h-3.5 w-3.5"
              />
            </span>
          ) : null}
        </div>

        {/* Optional label */}
        {item.label && (
          <div className="mt-1.5">
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
              {item.label}
            </span>
          </div>
        )}

        {/* Notification details */}
        {item.details.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {item.details.map((detail) => (
              <div
                key={`${item.key}-${detail.label}`}
                className="min-w-0 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-white/5"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {detail.label}
                </p>

                <p className="mt-1 break-words text-xs font-medium text-zinc-800 dark:text-zinc-200">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </Link>

      {/* PDF attachment */}
      {item.attachmentUrl && (
        <a
          href={item.attachmentUrl}
          download
          onClick={() => onMarkRead(item.key)}
          title={item.attachmentLabel || "Download attachment"}
          aria-label={item.attachmentLabel || "Download attachment"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
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
        </a>
      )}
    </div>
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
    <div className="px-5 py-16 text-center sm:px-8">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
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

      <h3 className="text-base font-semibold text-zinc-900 dark:text-white sm:text-lg">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {message}
      </p>
    </div>
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

  const readKeysRef = useRef<Set<string>>(readKeys);

  /* Search and filters */
  const [query, setQuery] = useState("");

  const [typeFilter, setTypeFilter] =
    useState<NotificationTypeFilter>("all");

  /* Scroll controls */
  const [showControls, setShowControls] = useState(true);
  const [scrollY, setScrollY] = useState(0);

  /* =====================================================
     LOAD READ STATUS
  ===================================================== */

  useEffect(() => {
    const stored = loadStoredReadKeys();

    const next = new Set(readKeysRef.current);

    for (const key of stored) {
      next.add(key);
    }

    readKeysRef.current = next;
    setReadKeys(next);

    persistReadKeys(next);
  }, []);

  /* =====================================================
     CROSS-TAB READ STATUS SYNCHRONIZATION
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
     MARK AS READ
  ===================================================== */

  const markRead = useCallback((key: string) => {
    if (readKeysRef.current.has(key)) {
      return;
    }

    const next = new Set(readKeysRef.current);

    next.add(key);

    readKeysRef.current = next;
    setReadKeys(next);

    persistReadKeys(next);
  }, []);

  /* =====================================================
     MERGE SERVER AND CLIENT READ STATUS
  ===================================================== */

  const items = useMemo(
    () =>
      combined.map((item) => ({
        ...item,
        read: Boolean(
          readKeys.has(item.key) || item.read
        ),
      })),
    [combined, readKeys]
  );

  /* =====================================================
     UNREAD COUNTS ONLY
  ===================================================== */

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items]
  );

  /*
   * Every category counter counts unread messages only.
   * Read notifications never contribute to these numbers.
   */
  const unreadTypeCounts = useMemo(() => {
    const counts: Record<NotificationType, number> = {
      security: 0,
      grant: 0,
      announcement: 0,
      account: 0,
      transfer: 0,
      receipt: 0,
    };

    for (const item of items) {
      if (!item.read) {
        counts[item.type] += 1;
      }
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
        if (typeFilter === "all") return true;

        return item.type === typeFilter;
      })
      .filter((item) => {
        if (!searchTerm) return true;

        const searchableContent = [
          item.title,
          item.message,
          item.time,
          item.label ?? "",
          item.type,
          ...item.details.map(
            (detail) =>
              `${detail.label} ${detail.value}`
          ),
        ]
          .join(" ")
          .toLowerCase();

        return searchableContent.includes(searchTerm);
      })
      .sort(
        (a, b) => Number(a.read) - Number(b.read)
      );
  }, [items, query, typeFilter]);

  /* =====================================================
     FILTER SELECTION
  ===================================================== */

  function handleTypeSelect(
    nextType: NotificationTypeFilter
  ) {
    setTypeFilter((current) =>
      current === nextType ? "all" : nextType
    );
  }

  /* =====================================================
     SCROLL BEHAVIOUR
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
    <div className="min-h-screen w-full overflow-x-hidden bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white">

      <main className="mx-auto w-full max-w-7xl px-0 sm:px-4 lg:px-8">

        {/* ================================================
            HEADER
        ================================================ */}

        <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95 sm:px-6">

          <div className="flex items-center justify-between gap-3">

            <div className="min-w-0">

              <h1
                className="font-black tracking-tight text-zinc-950 transition-[font-size] duration-200 dark:text-white"
                style={{
                  fontSize: `clamp(2rem, ${titleFontSize}px, 2.75rem)`,
                  lineHeight: 1.05,
                }}
              >
                Inbox
              </h1>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                Your notifications and account updates.
              </p>

            </div>

            {/* ONLY UNREAD COUNT */}
            <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 dark:bg-emerald-500/10">

              <span
                className={[
                  "h-2 w-2 rounded-full",
                  unreadCount > 0
                    ? "bg-rose-500"
                    : "bg-emerald-500",
                ].join(" ")}
              />

              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {unreadCount} unread
              </span>

            </div>

          </div>

        </header>

        {/* ================================================
            WELCOME NOTICE
        ================================================ */}

        {welcomeNotice && (
          <div className="mx-3 mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200 sm:mx-6">
            {welcomeNotice}
          </div>
        )}

        {/* ================================================
            FILTERS AND SEARCH
        ================================================ */}

        <div
          className={[
            "space-y-4 overflow-hidden border-b border-zinc-200 px-4 py-4 transition-all duration-300 dark:border-white/10 sm:px-6",
            showControls
              ? "max-h-80 opacity-100"
              : "pointer-events-none max-h-0 border-transparent py-0 opacity-0",
          ].join(" ")}
        >

          {/* Category filters */}
          <div className="overflow-x-auto pb-1">

            <div className="flex w-max items-center gap-2">

              <TypeChip
                active={typeFilter === "all"}
                onClick={() => handleTypeSelect("all")}
                label="All"
                count={unreadCount}
              />

              {NOTIFICATION_TYPES.map((type) => (
                <TypeChip
                  key={type}
                  active={typeFilter === type}
                  onClick={() => handleTypeSelect(type)}
                  label={type}
                  count={unreadTypeCounts[type]}
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
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-zinc-950"
              />

            </label>

            {(query || typeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setTypeFilter("all");
                }}
                className="self-start rounded-full px-3 py-2 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white sm:self-auto"
              >
                Clear filters
              </button>
            )}

          </div>

        </div>

        {/* ================================================
            NOTIFICATION LIST
            FLAT WHATSAPP-STYLE SEPARATORS
        ================================================ */}

        {visibleItems.length > 0 ? (

          <section
            aria-label="Notifications"
            className="divide-y divide-zinc-200 dark:divide-white/10"
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
                ? "Try a different search term or notification category."
                : "New alerts, account updates, transfer receipts and announcements will appear here."
            }
          />

        )}

        {/* ================================================
            FOOTER
        ================================================ */}

        <footer className="border-t border-zinc-200 px-4 py-5 dark:border-white/10 sm:px-6">

          <div className="flex items-center justify-between gap-3">

            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "You're all caught up"}
            </span>

            {unreadCount === 0 && items.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">

                <NotificationIcon
                  type="check"
                  className="h-4 w-4"
                />

                All read

              </span>
            )}

          </div>

        </footer>

      </main>

    </div>
  );
}

export default NotificationsSection;
