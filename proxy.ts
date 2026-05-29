import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, sanitizeNextPath } from "@/lib/auth";

const PROTECTED_PREFIXES = ["/dashboard", "/account", "/settings", "/admin"];

const PUBLIC_PREFIXES = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/api/auth",
  "/admin/login",
  "/api/admin/auth/signin",
];

// Canonical pages you already have
const SIGNIN_PATH = "/auth/signin";
const SIGNUP_PATH = "/auth/signup";

// Extra URLs that should redirect to the canonical pages
const SIGNIN_ALIASES = [
  "/signin",
  "/sign-in",
  "/auth/sign-in",
  "/login",
  "/log-in",
];

const SIGNUP_ALIASES = [
  "/signup",
  "/sign-up",
  "/create-account",
  "/register",
  "/sign-up",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isPublicPath(pathname: string) {
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
}

function isAdminRole(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

function redirectTo(urlPath: string, request: NextRequest, next?: string) {
  const url = request.nextUrl.clone();
  url.pathname = urlPath;
  if (next) url.searchParams.set("next", sanitizeNextPath(next));
  return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const fullPath = `${pathname}${search}`;

  // Redirect friendly aliases first
  if (SIGNIN_ALIASES.includes(pathname)) {
    return redirectTo(SIGNIN_PATH, request, undefined);
  }

  if (SIGNUP_ALIASES.includes(pathname)) {
    return redirectTo(SIGNUP_PATH, request, undefined);
  }

  if (isPublicPath(pathname)) {
    if (pathname === "/admin/login") {
      const user = await getUserFromSession(request);

      if (user && isAdminRole(user.role)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const user = await getUserFromSession(request);

  if (!user) {
    const loginPath = isAdminPath(pathname) ? "/admin/login" : SIGNIN_PATH;
    return redirectTo(loginPath, request, fullPath);
  }

  if (isAdminPath(pathname) && !isAdminRole(user.role)) {
    return redirectTo("/admin/login", request, fullPath);
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

    // alias routes so they do not 404
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