// main/app/api/auth/signin/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueSession, sanitizeNextPath } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { signInSchema } from "@/lib/validators/auth";
import { issueEmailVerificationCode } from "@/lib/email-verification";
import { isProduction } from "@/lib/session";

export const runtime = "nodejs";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const ONBOARDING_COOKIE = "cc_onboarding_pending";

// Valid header names only: lowercase letters, numbers, and hyphens.
// Make sure whatever sets these headers uses the same names.
const IP_CITY_HEADER = "x-credit-cache-ip-city";
const IP_REGION_HEADER = "x-credit-cache-ip-region";
const IP_COUNTRY_HEADER = "x-credit-cache-ip-country";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.trim().replace(/[^\d+()\s-]/g, "");
}

function isLikelyEmail(value: string) {
  return value.includes("@");
}

function resolveLoginLocation(req: NextRequest) {
  const city =
    req.headers.get(IP_CITY_HEADER) ||
    req.headers.get("cf-ipcity") ||
    req.headers.get("x-forwarded-city") ||
    "";

  const region =
    req.headers.get(IP_REGION_HEADER) ||
    req.headers.get("cf-region") ||
    req.headers.get("x-forwarded-region") ||
    "";

  const country =
    req.headers.get(IP_COUNTRY_HEADER) ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-forwarded-country") ||
    "";

  const parts = [city, region].filter(Boolean);
  if (parts.length && country) return `${parts.join(", ")}, ${country}`;
  if (city && country) return `${city}, ${country}`;
  if (country) return country;
  if (city) return city;
  return "Unknown location";
}

async function logActivity(
  userId: string,
  title: string,
  meta: string,
  tone: "GOOD" | "PRIMARY" = "PRIMARY",
) {
  await prisma.activityEvent
    .create({
      data: {
        title,
        meta,
        tone,
        type: "LOGIN",
        entityType: "USER",
        entityId: userId,
        createdById: userId,
      },
    })
    .catch(() => {});
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Please fix the highlighted fields.",
          errors: parsed.error.issues.map((issue) => ({
            field: issue.path.join(".") || null,
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const nextPath = sanitizeNextPath(
      typeof body?.nextPath === "string" ? body.nextPath : "/dashboard",
    );

    const { identifier, password, method } = parsed.data;
    const cleanIdentifier = identifier.trim();
    const loginLocation = resolveLoginLocation(req);

    const lookup =
      method === "phone"
        ? { phone: normalizePhone(cleanIdentifier) }
        : method === "email"
          ? { email: normalizeEmail(cleanIdentifier) }
          : isLikelyEmail(cleanIdentifier)
            ? { email: normalizeEmail(cleanIdentifier) }
            : { phone: normalizePhone(cleanIdentifier) };

    const user = await prisma.user.findFirst({
      where: lookup,
      select: {
        id: true,
        email: true,
        phone: true,
        passwordHash: true,
        verified: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          code: "USER_NOT_FOUND",
          message:
            method === "phone"
              ? "No account found for this phone number."
              : "No account found for this email.",
        },
        { status: 404 },
      );
    }

    if (!user.verified) {
      try {
        await issueEmailVerificationCode(
          { id: user.id, email: user.email },
          { respectCooldown: true },
        );
      } catch (error) {
        const retryAfterSeconds =
          error instanceof Error && "retryAfterSeconds" in error
            ? Number((error as Error & { retryAfterSeconds?: number }).retryAfterSeconds ?? 60)
            : 60;

        return NextResponse.json(
          {
            code: "RATE_LIMITED",
            message: `We already sent a code. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
            retryAfterSeconds,
          },
          { status: 429 },
        );
      }

      await logActivity(
        user.id,
        "Verification required",
        `A new verification code was sent from ${loginLocation}.`,
        "PRIMARY",
      );

      const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(user.email)}&next=${encodeURIComponent(nextPath)}`;

      const response = NextResponse.json(
        {
          code: "EMAIL_NOT_VERIFIED",
          message: "Your account is not verified yet. We sent a new verification code.",
          requiresVerification: true,
          email: user.email,
          redirectTo: verifyUrl,
          verifyUrl,
        },
        { status: 403 },
      );

      response.cookies.set(ONBOARDING_COOKIE, "1", {
        httpOnly: true,
        secure: isProduction(),
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000),
      );

      await logActivity(
        user.id,
        "Account locked",
        `Too many failed login attempts from ${loginLocation}.`,
        "PRIMARY",
      );

      return NextResponse.json(
        {
          code: "RATE_LIMITED",
          message: `Too many attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
          retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      const nextFailedAttempts = user.failedLoginAttempts + 1;
      const shouldLock = nextFailedAttempts >= MAX_FAILED_ATTEMPTS;
      const lockedUntil = shouldLock
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
        : null;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: nextFailedAttempts,
          lockedUntil,
        },
      });

      await logActivity(
        user.id,
        shouldLock ? "Account locked" : "Login attempt failed",
        shouldLock
          ? `Too many failed login attempts from ${loginLocation}.`
          : `Incorrect password attempt from ${loginLocation}.`,
        "PRIMARY",
      );

      if (shouldLock) {
        return NextResponse.json(
          {
            code: "RATE_LIMITED",
            message: `Too many attempts. Try again in ${LOCK_MINUTES} minute(s).`,
            retryAfterSeconds: LOCK_MINUTES * 60,
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          code: "INVALID_PASSWORD",
          message: "Incorrect password.",
        },
        { status: 401 },
      );
    }

    const firstLogin =
      user.failedLoginAttempts === 0 && user.lockedUntil == null && user.verified;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.activityEvent.create({
        data: {
          title: firstLogin ? "Welcome to Credit Cache" : "Sign in successful",
          meta: firstLogin
            ? `First login from ${loginLocation}.`
            : `Signed in from ${loginLocation}.`,
          tone: "GOOD",
          type: "LOGIN",
          entityType: "USER",
          entityId: user.id,
          createdById: user.id,
        },
      }),
    ]);

    const redirectTo = firstLogin ? "/dashboard?welcome=first-login" : nextPath;

    const response = NextResponse.json({
      success: true,
      firstLogin,
      redirectTo,
      redirectUrl: redirectTo,
    });

    if (firstLogin) {
      response.cookies.set(ONBOARDING_COOKIE, "1", {
        httpOnly: true,
        secure: isProduction(),
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    } else {
      response.cookies.set(ONBOARDING_COOKIE, "", {
        httpOnly: true,
        secure: isProduction(),
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
      });
    }

    await issueSession(response, user.id, req);
    return response;
  } catch (error) {
    console.error("signin error:", error);
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}