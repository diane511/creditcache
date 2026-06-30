import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  issueSession,
  isAdminRole,
  normalizeEmail,
  normalizePhone,
  sanitizeNextPath,
} from "@/lib/auth";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function buildEmailVerificationPath(email: string, next?: string) {
  const params = new URLSearchParams();
  params.set("email", email);

  if (next) {
    params.set("next", sanitizeNextPath(next));
  }

  return `/auth/verify-email?${params.toString()}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { identifier, identifierType, password, next } = (body ?? {}) as {
      identifier?: string;
      identifierType?: "email" | "phone";
      password?: string;
      next?: string;
    };

    if (!identifier || !password) {
      return NextResponse.json(
        {
          code: "missing_fields",
          message: "Email or phone number and password are required.",
        },
        { status: 400 },
      );
    }

    const cleanIdentifier = identifier.trim();

    let user = null as Awaited<ReturnType<typeof prisma.user.findFirst>>;

    if (identifierType === "phone") {
      const normalizedPhone = normalizePhone(cleanIdentifier);

      if (!isValidPhone(normalizedPhone)) {
        return NextResponse.json(
          {
            code: "invalid_phone",
            message: "Please enter a valid phone number.",
          },
          { status: 400 },
        );
      }

      user = await prisma.user.findFirst({
        where: { phone: normalizedPhone },
      });
    } else {
      if (!isValidEmail(cleanIdentifier)) {
        return NextResponse.json(
          {
            code: "invalid_email",
            message: "Please enter a valid email address.",
          },
          { status: 400 },
        );
      }

      user = await prisma.user.findFirst({
        where: { email: normalizeEmail(cleanIdentifier) },
      });
    }

    if (!user) {
      return NextResponse.json(
        {
          code: "account_not_found",
          message: "No account was found for that email or phone number.",
        },
        { status: 404 },
      );
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      return NextResponse.json(
        {
          code: "account_locked",
          message: "This account is temporarily locked. Try again later.",
        },
        { status: 423 },
      );
    }

    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        {
          code: "account_suspended",
          message: "This account has been suspended.",
        },
        { status: 403 },
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        {
          code: "email_not_verified",
          message: "Please verify your email before signing in.",
          nextPath: buildEmailVerificationPath(
            user.email,
            next ?? "/admin",
          ),
          email: user.email,
        },
        { status: 403 },
      );
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        {
          code: "admin_access_required",
          message: "This account does not have admin access.",
        },
        { status: 403 },
      );
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      const nextFailedCount = user.failedLoginAttempts + 1;
      const shouldLock = nextFailedCount >= 5;
      const lockedUntil = shouldLock
        ? new Date(Date.now() + 15 * 60 * 1000)
        : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextFailedCount,
          lockedUntil,
        },
      });

      return NextResponse.json(
        {
          code: "incorrect_password",
          message: "Incorrect password.",
        },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const response = NextResponse.json({
      success: true,
      nextPath: sanitizeNextPath(next),
    });

    await issueSession(response, user.id, req);

    return response;
  } catch (error) {
    console.error("admin signin error:", error);
    return NextResponse.json(
      {
        code: "server_error",
        message: "Server validation failed. Please try again.",
      },
      { status: 500 },
    );
  }
}