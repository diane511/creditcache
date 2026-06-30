import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { Prisma, type Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, SESSION_DAYS, isProduction } from "@/lib/session";
import { addDays, hashToken } from "@/lib/tokens";

export type AdminScopeViewer = {
  id: string;
  role?: Role | string | null;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string) {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function sanitizeNextPath(nextPath?: string | null) {
  if (!nextPath) return "/dashboard";
  if (!nextPath.startsWith("/")) return "/dashboard";
  if (nextPath.startsWith("//")) return "/dashboard";
  return nextPath;
}

export function emailPrefixToDisplayName(email: string) {
  const prefix = normalizeEmail(email).split("@")[0] ?? "User";
  const cleaned = prefix
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "User";

  return cleaned
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function slugifyUsername(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.+/g, ".");
}

export function isSuperAdminRole(role: Role | string | null | undefined) {
  return role === "SUPER_ADMIN";
}

export function isAdminRole(role: Role | string | null | undefined) {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageAllUsers(viewer?: AdminScopeViewer) {
  return Boolean(viewer && isSuperAdminRole(viewer.role));
}

export function buildManagedUserWhere(
  viewer?: AdminScopeViewer,
): Prisma.UserWhereInput {
  if (!viewer) return {};
  if (isSuperAdminRole(viewer.role)) return {};
  if (isAdminRole(viewer.role)) {
    return {
      invitedByAdminId: viewer.id,
    };
  }

  return {
    id: viewer.id,
  };
}

export function canAccessManagedUser(
  viewer: AdminScopeViewer | null | undefined,
  target: { id: string; invitedByAdminId: string | null },
) {
  if (!viewer) return false;
  if (isSuperAdminRole(viewer.role)) return true;
  if (isAdminRole(viewer.role)) return target.invitedByAdminId === viewer.id;
  return target.id === viewer.id;
}

export async function uniqueUsername(base: string) {
  const safeBase = slugifyUsername(base) || "user";
  let candidate = safeBase;
  let attempt = 0;

  while (true) {
    const exists = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!exists) return candidate;

    attempt += 1;
    candidate = `${safeBase}.${attempt}`;
  }
}

export function createOpaqueToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function issueSession(
  response: NextResponse,
  userId: string,
  request: NextRequest,
) {
  const rawToken = createOpaqueToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = addDays(new Date(), SESSION_DAYS);

  await prisma.authSession.create({
    data: {
      userId,
      sessionToken: tokenHash,
      expiresAt,
      ipAddress:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: request.headers.get("user-agent"),
      deviceName: request.headers.get("user-agent"),
    },
  });

  response.cookies.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return { rawToken, expiresAt };
}

export async function clearSessionCookie(
  response: NextResponse,
  request: NextRequest,
) {
  const rawToken = request.cookies.get(SESSION_COOKIE)?.value;

  if (rawToken) {
    await prisma.authSession
      .deleteMany({ where: { sessionToken: hashToken(rawToken) } })
      .catch(() => {});
  }

  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getUserFromSession(request: NextRequest) {
  const rawToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const sessionToken = hashToken(rawToken);

  const session = await prisma.authSession.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.authSession.delete({ where: { sessionToken } }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const sessionToken = hashToken(rawToken);

  const session = await prisma.authSession.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.authSession.delete({ where: { sessionToken } }).catch(() => {});
    return null;
  }

  return session.user;
}

export async function revokeAllSessionsForUser(userId: string) {
  await prisma.authSession.deleteMany({ where: { userId } });
}