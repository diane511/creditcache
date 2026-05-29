"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 8h16M4 16h16"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 20l-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2.1" />
    </svg>
  );
}

type SiteHeaderProps = {
  isLoggedIn?: boolean;
  onMenuClick?: () => void;
  profileHref?: string;
  userName?: string;
};

type AuthMeUser = {
  id: string;
  displayName?: string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  verified?: boolean;
  role?: string;
  status?: string;
};

export function SiteHeader({
  isLoggedIn,
  onMenuClick,
  profileHref = "/profile",
  userName = "Guest",
}: SiteHeaderProps) {
  const [sessionUser, setSessionUser] = useState<AuthMeUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function loadMe() {
      try {
        setLoadingUser(true);
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!alive) return;

        if (!res.ok) {
          setSessionUser(null);
          return;
        }

        const data = (await res.json().catch(() => null)) as
          | { user?: AuthMeUser | null }
          | null;

        setSessionUser(data?.user ?? null);
      } catch {
        if (alive) setSessionUser(null);
      } finally {
        if (alive) setLoadingUser(false);
      }
    }

    loadMe();

    return () => {
      alive = false;
    };
  }, []);

  const resolvedLoggedIn = isLoggedIn ?? Boolean(sessionUser);
  const resolvedName = useMemo(() => {
    if (!resolvedLoggedIn) return "Guest";

    return (
      sessionUser?.displayName?.trim() ||
      sessionUser?.username?.trim() ||
      sessionUser?.email?.split("@")[0]?.trim() ||
      userName ||
      "Profile"
    );
  }, [resolvedLoggedIn, sessionUser, userName]);

  const profileLabel = useMemo(() => {
    if (!resolvedLoggedIn) return "Guest";
    return sessionUser?.username?.trim() || sessionUser?.displayName?.trim() || "Profile";
  }, [resolvedLoggedIn, sessionUser]);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 h-16 backdrop-blur-xl",
        resolvedLoggedIn
          ? "bg-white/85 dark:bg-zinc-950/85 lg:left-[300px]"
          : "bg-white/95 dark:bg-zinc-950/95",
      ].join(" ")}
    >
      <div className="mx-3 flex h-full items-center border-b border-black/5 dark:border-white/10 sm:mx-4 lg:mx-5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="inline-flex h-10 w-10 items-center justify-center text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white lg:hidden"
        >
          <MenuIcon />
        </button>

        <div className="ml-2 flex min-w-0 items-center gap-3 lg:ml-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-black/5 bg-zinc-950 text-white shadow-sm dark:border-white/10 dark:bg-white dark:text-zinc-950">
            <span className="text-xs font-semibold">CC</span>
          </div>

          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
              {resolvedLoggedIn ? "CREDIT CACHE" : "Public access"}
            </div>

            <div className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
              {resolvedLoggedIn
                ? "Your Future Fully Funded"
                : "Explore opportunities safely"}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {!resolvedLoggedIn && (
            <>
              <Link
                href="/signin"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white sm:inline-flex"
              >
                Sign in
              </Link>

              <Link
                href="/signup"
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Sign up
              </Link>
            </>
          )}

          <Link
            href={resolvedLoggedIn ? profileHref : "/signin"}
            aria-label={resolvedLoggedIn ? `Profile for ${resolvedName}` : "Profile"}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/5 bg-white px-3.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-zinc-950 px-2 text-white dark:bg-white dark:text-zinc-950">
              {resolvedLoggedIn ? (
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {loadingUser ? "…" : "Profile"}
                </span>
              ) : (
                <ProfileIcon />
              )}
            </span>

            <span className="hidden sm:inline">{resolvedName}</span>
          </Link>

          <button
            type="button"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center text-zinc-700 transition hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
          >
            <SearchIcon />
          </button>
        </div>
      </div>
    </header>
  );
}