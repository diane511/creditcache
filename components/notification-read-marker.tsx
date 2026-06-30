"use client";

import { useEffect } from "react";

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

export function NotificationReadMarker({
  notificationId,
}: {
  notificationId: string;
}) {
  useEffect(() => {
    if (!notificationId) return;

    const next = loadStoredReadKeys();
    next.add(notificationId);
    persistReadKeys(next);
  }, [notificationId]);

  return null;
}