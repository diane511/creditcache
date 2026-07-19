import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, sanitizeNextPath } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/account", "/settings", "/admin"];

const PUBLIC_PREFIXES = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/api/auth",
  "/api/admin/auth/signin",
  "/api/admin/auth/signup",

  // hidden admin auth
  "/admin/ops-7c3a/signin",
  "/admin/ops-7c3a/signup",
];

// Canonical public user auth pages
const SIGNIN_PATH = "/auth/signin";
const SIGNUP_PATH = "/auth/signup";

// Hidden admin auth pages
const ADMIN_SIGNIN_PATH = "/admin/ops-7c3a/signin";
const ADMIN_SIGNUP_PATH = "/admin/ops-7c3a/signup";

// Friendly aliases for user auth
const SIGNIN_ALIASES = ["/signin", "/sign-in", "/auth/sign-in", "/login", "/log-in"];
const SIGNUP_ALIASES = ["/signup", "/sign-up", "/create-account", "/register"];

// Old admin URLs now point to the hidden admin auth pages
const ADMIN_SIGNIN_ALIASES = ["/admin/login", "/admin/signin", "/admin/log-in"];
const ADMIN_SIGNUP_ALIASES = ["/admin/register", "/admin/signup", "/admin/sign-up"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin") && !pathname.startsWith("/admin/ops-7c3a");
}

function isAdminRole(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function isPendingAdmin(user: { role?: string | null; isApproved?: boolean | null } | null | undefined) {
  if (!user) return false;
  return user.role === "PENDING_ADMIN" || user.isApproved === false;
}

function redirectTo(urlPath: string, request: NextRequest, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = urlPath;

  if (next) {
    url.searchParams.set("next", sanitizeNextPath(next));
  }

  return NextResponse.redirect(url);
}

function hideAdminPath(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/404";
  url.search = "";
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;

  // User auth aliases
  if (SIGNIN_ALIASES.includes(pathname)) {
    return redirectTo(SIGNIN_PATH, request);
  }

  if (SIGNUP_ALIASES.includes(pathname)) {
    return redirectTo(SIGNUP_PATH, request);
  }

  // Old admin URLs go to the hidden admin auth pages
  if (ADMIN_SIGNIN_ALIASES.includes(pathname)) {
    return redirectTo(ADMIN_SIGNIN_PATH, request);
  }

  if (ADMIN_SIGNUP_ALIASES.includes(pathname)) {
    return redirectTo(ADMIN_SIGNUP_PATH, request);
  }

  // Allow public routes through
  if (isPublicPath(pathname)) {
    if (pathname === ADMIN_SIGNIN_PATH || pathname === ADMIN_SIGNUP_PATH) {
      const user = await getUserFromSession(request);

      if (user && isAdminRole(user.role)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      if (user && isPendingAdmin(user)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      if (user && !isAdminRole(user.role)) {
        return hideAdminPath(request);
      }
    }

    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const user = await getUserFromSession(request);

  // Admin area: allow pending admins through so the app can show the approval page
  if (isAdminPath(pathname)) {
    if (!user) {
      return redirectTo(ADMIN_SIGNIN_PATH, request, fullPath);
    }

    if (isPendingAdmin(user)) {
      return NextResponse.next();
    }

    if (!isAdminRole(user.role)) {
      return hideAdminPath(request);
    }

    return NextResponse.next();
  }

  // Non-admin protected pages
  if (!user) {
    return redirectTo(SIGNIN_PATH, request, fullPath);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/auth/:path*",
    "/api/auth/:path*",
    "/api/admin/:path*",

    // alias routes
    "/signin",
    "/sign-in",
    "/login",
    "/log-in",
    "/signup",
    "/sign-up",
    "/create-account",
    "/register",
  ],
};