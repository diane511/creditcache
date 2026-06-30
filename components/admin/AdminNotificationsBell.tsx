"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 17H9m8-6a5 5 0 10-10 0c0 5-2 6-2 6h14s-2-1-2-6Zm-3.5 8a2 2 0 01-3 0" />
    </svg>
  );
}

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

type AdminNotificationsBellProps = {
  notificationIds: string[];
};

export function AdminNotificationsBell({
  notificationIds,
}: AdminNotificationsBellProps) {
  const [readKeys, setReadKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setReadKeys(loadStoredReadKeys());
  }, []);

  const unreadCount = useMemo(() => {
    if (!notificationIds.length) return 0;
    return notificationIds.filter((id) => !readKeys.has(id)).length;
  }, [notificationIds, readKeys]);

  return (
    <Link
      href="/admin/notifications"
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
      aria-label="Open notifications"
    >
      <BellIcon />
      {unreadCount > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}