"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

type AuthMode = "sign-in" | "sign-up";

type SidebarProps = {
  title?: string;
  isAuthenticated?: boolean;
  authMode?: AuthMode;
  signInHref?: string;
  signUpHref?: string;
  profileHref?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

type AuthMeUser = {
  id: string;
  displayName?: string | null;
  username?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
  status?: string;
  verified?: boolean;
  avatarUrl?: string | null;
};

type NavItem = {
  label: string;
  href: string;
  icon?: () => JSX.Element;
};

type NavSection = {
  heading: string;
  items: NavItem[];
};

const DASHBOARD_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: DashboardIcon },
  { label: "Payments", href: "/dashboard/payments", icon: VaultIcon },
  { label: "History", href: "/dashboard/history", icon: FileIcon },
  { label: "Security", href: "/dashboard/security", icon: ShieldAlertIcon },
  { label: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  { label: "Applications", href: "/dashboard/applications", icon: BriefcaseIcon },
  { label: "Actions", href: "/dashboard/actions", icon: UsersIcon },
];

const GUEST_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "Scam Center", href: "/scam-center" },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin", icon: DashboardIcon },
  { label: "Metrics", href: "/admin/metrics", icon: UsersIcon },
  { label: "Publish", href: "/admin/publish", icon: BriefcaseIcon },
  { label: "Opportunities", href: "/admin/opportunities", icon: VaultIcon },
  { label: "Guidance", href: "/admin/guidance", icon: FileIcon },
  { label: "Users", href: "/admin/users", icon: ProfileIcon },
  { label: "Winner", href: "/admin/winner", icon: ShieldAlertIcon },
  { label: "Queue", href: "/admin/queue", icon: SettingsIcon },
  { label: "Super admin", href: "/admin/super-admin", icon: UsersIcon },
];

function inferAuthModeFromPathname(pathname: string | null): AuthMode | null {
  if (!pathname) return null;
  const normalized = pathname.toLowerCase();

  if (
    normalized.includes("sign-up") ||
    normalized.includes("signup") ||
    normalized.includes("register")
  ) {
    return "sign-up";
  }

  if (
    normalized.includes("sign-in") ||
    normalized.includes("signin") ||
    normalized.includes("login")
  ) {
    return "sign-in";
  }

  return null;
}

function isAdminRole(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function isDashboardActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isAdminLinkActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 11.5 12 4l8 7.5V20H4v-8.5Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M9 7V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M4 8.5h16v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M7 3.5h7l5 5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path
        d="M14 3.5V9h5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 13h6M9 16h6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M12 16.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" fill="currentColor" />
    </svg>
  );
}

function ShieldAlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 3 19 6v5c0 5-3.2 8.8-7 10-3.8-1.2-7-5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M12 16.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M10.5 4.5h3l.5 2a6.8 6.8 0 0 1 1.4.6l1.8-1.1 2.1 2.1-1.1 1.8c.25.46.45.93.6 1.4l2 .5v3l-2 .5c-.15.47-.35.94-.6 1.4l1.1 1.8-2.1 2.1-1.8-1.1c-.46.25-.93.45-1.4.6l-.5 2h-3l-.5-2a6.8 6.8 0 0 1-1.4-.6l-1.8 1.1-2.1-2.1 1.1-1.8a6.8 6.8 0 0 1-.6-1.4l-2-.5v-3l2-.5c.15-.47.35-.94.6-1.4L5.2 8.7l2.1-2.1 1.8 1.1c.46-.25.93-.45 1.4-.6l.5-2Z"
        stroke="currentColor"
        strokeWidth="1.85"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2.1"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M16 19v-1.5A3.5 3.5 0 0 0 12.5 14h-1A3.5 3.5 0 0 0 8 17.5V19"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M15.5 7.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
        stroke="currentColor"
        strokeWidth="2.1"
      />
      <path
        d="M19 19v-1a3 3 0 0 0-2.2-2.9M18 8.5a2 2 0 1 1 0 4"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M5 19v-1.5A3.5 3.5 0 0 1 8.5 14"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path d="M6.5 8.5a2 2 0 1 1 0 4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M12 12.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2.1" />
    </svg>
  );
}

export function Sidebar({
  title = "CREDIT CACHE",
  isAuthenticated,
  authMode,
  signInHref,
  signUpHref,
  profileHref = "/profile",
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const [sessionUser, setSessionUser] = useState<AuthMeUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    async function loadSession() {
      try {
        setSessionLoading(true);

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
        if (alive) {
          setSessionLoading(false);
          setSessionChecked(true);
        }
      }
    }

    loadSession();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen, onMobileClose]);

  const effectiveAuthMode = authMode ?? inferAuthModeFromPathname(pathname);
  const isAdminArea = pathname.startsWith("/admin");
  const isAdminUser = Boolean(sessionUser && isAdminRole(sessionUser.role));

  const resolvedLoggedIn =
    sessionChecked ? Boolean(sessionUser) : Boolean(isAuthenticated);

  const resolvedUserName =
    sessionUser?.displayName?.trim() ||
    sessionUser?.username?.trim() ||
    sessionUser?.email?.split("@")[0]?.trim() ||
    "Profile";

  const effectiveSignInHref =
    signInHref ?? (isAdminArea ? "/admin/ops-7c3a/signin" : "/signin");

  const effectiveSignUpHref =
    signUpHref ?? (isAdminArea ? "/admin/ops-7c3a/signup" : "/signup");

  const visibleSections = useMemo<NavSection[]>(() => {
    if (!resolvedLoggedIn) {
      return [{ heading: "Explore", items: GUEST_ITEMS }];
    }

    if (isAdminArea && isAdminUser) {
      return [
        { heading: "Admin workspace", items: ADMIN_ITEMS },
        { heading: "Workspace", items: DASHBOARD_ITEMS },
      ];
    }

    return [{ heading: "Workspace", items: DASHBOARD_ITEMS }];
  }, [resolvedLoggedIn, isAdminArea, isAdminUser]);

  const closeMobile = () => onMobileClose?.();

  async function handleLogout() {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // ignore
    } finally {
      window.location.href = effectiveSignInHref;
    }
  }

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-zinc-950/55 backdrop-blur-[2px] lg:hidden"
        />
      ) : null}

      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-[320px] border-r border-black/5 bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-zinc-950/95",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-black/5 bg-zinc-950 text-white shadow-sm dark:border-white/10 dark:bg-white dark:text-zinc-950">
              <span className="text-xs font-semibold">CC</span>
            </div>

            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                {title}
              </div>
              <div className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-white">
                {resolvedLoggedIn
                  ? "Workspace"
                  : effectiveAuthMode === "sign-up"
                    ? "Create account"
                    : "Global Funding"}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 lg:hidden"
          >
            ×
          </button>
        </div>

        <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col px-4 pb-4">
          <nav className="mt-2 flex-1 overflow-y-auto pr-1">
            <div className="space-y-5">
              {visibleSections.map((section) => (
                <section key={section.heading}>
                  <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                    {section.heading}
                  </div>

                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = item.href.startsWith("/admin")
                        ? isAdminLinkActive(pathname, item.href)
                        : isDashboardActive(pathname, item.href);

                      return (
                        <Link
                          key={`${item.label}-${item.href}`}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          onClick={closeMobile}
                          className={[
                            "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                            active
                              ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950"
                              : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/8 dark:hover:text-white",
                          ].join(" ")}
                        >
                          {item.icon ? (
                            <span
                              className={[
                                "inline-flex h-8 w-8 items-center justify-center rounded-lg",
                                active
                                  ? "bg-white/10 text-white dark:bg-zinc-950 dark:text-zinc-950"
                                  : "bg-zinc-100 text-zinc-500 dark:bg-white/5 dark:text-zinc-400",
                              ].join(" ")}
                            >
                              <item.icon />
                            </span>
                          ) : null}

                          <span className="min-w-0 flex-1 truncate">{item.label}</span>

                          <span
                            className={[
                              "text-xs transition",
                              active ? "text-white/80" : "text-zinc-400 group-hover:text-zinc-500",
                            ].join(" ")}
                          >
                            →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </nav>

          <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/10">
            {resolvedLoggedIn ? (
              <div className="rounded-2xl border border-black/5 bg-white px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href={profileHref}
                    onClick={closeMobile}
                    className="inline-flex min-w-0 flex-1 items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                      <ProfileIcon />
                    </span>
                    <span className="truncate">{resolvedUserName}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-xl border border-black/5 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-black/5 bg-white px-3 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
                  Access
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {effectiveAuthMode === "sign-up"
                    ? "Already have an account?"
                    : "Need an account?"}
                </p>

                <div className="mt-3 flex gap-2">
                  <a
                    href={effectiveAuthMode === "sign-up" ? effectiveSignInHref : effectiveSignUpHref}
                    onClick={closeMobile}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-zinc-950 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    {effectiveAuthMode === "sign-up" ? "Sign in" : "Sign up"}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}