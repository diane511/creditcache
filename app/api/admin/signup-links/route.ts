import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, isAdminRole } from "@/lib/auth";

export const runtime = "nodejs";

type Viewer = {
  id: string;
  role: string;
};

function canManageLink(viewer: Viewer, createdById: string) {
  return createdById === viewer.id;
}

function parseDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function serializeLink(link: {
  id: string;
  token: string;
  label: string | null;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
  createdBy?: unknown;
}) {
  return {
    id: link.id,
    token: link.token,
    label: link.label,
    active: link.active,
    maxUses: link.maxUses,
    usedCount: link.usedCount,
    lastUsedAt: link.lastUsedAt ? link.lastUsedAt.toISOString() : null,
    expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
    createdById: link.createdById,
    createdBy: link.createdBy,
  };
}

export async function GET(request: NextRequest) {
  const user = await getUserFromSession(request);
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const viewer = { id: user.id, role: user.role } satisfies Viewer;

  const links = await prisma.adminSignupLink.findMany({
    where: { createdById: viewer.id },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          id: true,
          displayName: true,
          legalName: true,
          username: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return NextResponse.json({
    links: links.map((link) => ({
      ...serializeLink(link),
      signupUrl: new URL(
        `/auth/signup?invite=${encodeURIComponent(link.token)}`,
        request.url,
      ).toString(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getUserFromSession(request);
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const active = typeof body?.active === "boolean" ? body.active : true;
  const maxUses =
    typeof body?.maxUses === "number" && Number.isFinite(body.maxUses)
      ? Math.max(1, Math.floor(body.maxUses))
      : 1;
  const expiresAt = parseDate(body?.expiresAt);

  const token = crypto.randomBytes(18).toString("hex");

  const link = await prisma.adminSignupLink.create({
    data: {
      token,
      label: label || null,
      active,
      maxUses,
      expiresAt,
      createdById: user.id,
    },
  });

  return NextResponse.json({
    link: {
      ...serializeLink(link),
      signupUrl: new URL(
        `/auth/signup?invite=${encodeURIComponent(link.token)}`,
        request.url,
      ).toString(),
    },
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getUserFromSession(request);
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const token = typeof body?.token === "string" ? body.token.trim() : "";
  const active = typeof body?.active === "boolean" ? body.active : undefined;
  const label = typeof body?.label === "string" ? body.label.trim() : undefined;
  const maxUses =
    typeof body?.maxUses === "number" && Number.isFinite(body.maxUses)
      ? Math.max(1, Math.floor(body.maxUses))
      : undefined;
  const expiresAt =
    body?.expiresAt === null ? null : parseDate(body?.expiresAt);

  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const link = await prisma.adminSignupLink.findUnique({
    where: { token },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!canManageLink({ id: user.id, role: user.role }, link.createdById)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.adminSignupLink.update({
    where: { token },
    data: {
      ...(typeof active === "boolean" ? { active } : {}),
      ...(typeof label === "string" ? { label: label || null } : {}),
      ...(typeof maxUses === "number" ? { maxUses } : {}),
      ...(expiresAt !== undefined ? { expiresAt } : {}),
    },
  });

  return NextResponse.json({
    link: {
      ...serializeLink(updated),
      signupUrl: new URL(
        `/auth/signup?invite=${encodeURIComponent(updated.token)}`,
        request.url,
      ).toString(),
    },
  });
}