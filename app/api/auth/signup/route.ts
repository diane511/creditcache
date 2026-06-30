// main/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validators/auth";
import { sanitizeNextPath } from "@/lib/auth";
import { issueEmailVerificationCode } from "@/lib/email-verification";
import { isProduction } from "@/lib/session";

export const runtime = "nodejs";

const ONBOARDING_COOKIE = "cc_onboarding_pending";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.trim().replace(/[^\d+()\s-]/g, "");
}

function normalizeInviteToken(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function logActivity(userId: string, title: string, meta: string) {
  await prisma.activityEvent
    .create({
      data: {
        title,
        meta,
        tone: "GOOD",
        type: "LOGIN",
        entityType: "USER",
        entityId: userId,
        createdById: userId,
      },
    })
    .catch(() => {});
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

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
      typeof body?.nextPath === "string" ? body.nextPath : "/dashboard?welcome=verified",
    );

    const inviteToken = normalizeInviteToken(
      body?.inviteToken ??
        body?.invite ??
        body?.signupLinkToken ??
        url.searchParams.get("invite") ??
        url.searchParams.get("inviteToken"),
    );

    const cleanEmail = normalizeEmail(parsed.data.email);
    const cleanPhone = normalizePhone(parsed.data.phone);

    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          code: "EMAIL_EXISTS",
          message: "An account already exists for this email.",
        },
        { status: 409 },
      );
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone: cleanPhone },
      select: { id: true },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          code: "PHONE_EXISTS",
          message: "An account already exists for this phone number.",
        },
        { status: 409 },
      );
    }

    const inviteLink = inviteToken
      ? await prisma.adminSignupLink.findUnique({
          where: { token: inviteToken },
          include: {
            createdBy: {
              select: {
                id: true,
                role: true,
                status: true,
              },
            },
          },
        })
      : null;

    if (inviteToken && !inviteLink) {
      return NextResponse.json(
        {
          code: "INVITE_NOT_FOUND",
          message: "That signup link is invalid.",
        },
        { status: 404 },
      );
    }

    if (inviteLink) {
      const expired = inviteLink.expiresAt && inviteLink.expiresAt.getTime() <= Date.now();
      const exhausted =
        typeof inviteLink.maxUses === "number" &&
        inviteLink.maxUses > 0 &&
        inviteLink.usedCount >= inviteLink.maxUses;

      if (!inviteLink.active || expired || exhausted) {
        return NextResponse.json(
          {
            code: "INVITE_EXPIRED",
            message: "That signup link is no longer active.",
          },
          { status: 410 },
        );
      }
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const usernameBase = cleanEmail.split("@")[0].replace(/[^a-z0-9._-]/gi, "") || "user";
    const username = `${usernameBase}_${crypto.randomBytes(3).toString("hex")}`;

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          username,
          displayName: usernameBase,
          verified: false,
          role: "USER",
          invitedByAdminId: inviteLink ? inviteLink.createdById : null,
        },
      });

      if (inviteLink) {
        const nextUsedCount = inviteLink.usedCount + 1;
        await tx.adminSignupLink.update({
          where: { id: inviteLink.id },
          data: {
            usedCount: nextUsedCount,
            lastUsedAt: new Date(),
            active:
              typeof inviteLink.maxUses === "number" && inviteLink.maxUses > 0
                ? nextUsedCount < inviteLink.maxUses
                : inviteLink.active,
          },
        });
      }

      return created;
    });

    await issueEmailVerificationCode(user, { respectCooldown: false });

    await logActivity(
      user.id,
      "Welcome to Credit Cache",
      "Your account was created. Verify your email to continue.",
    );

    const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(cleanEmail)}&next=${encodeURIComponent(nextPath)}`;

    const response = NextResponse.json({
      success: true,
      message: "Account created. We sent a verification code to your email.",
      code: "VERIFICATION_REQUIRED",
      requiresVerification: true,
      email: cleanEmail,
      redirectTo: verifyUrl,
      verifyUrl,
      invitedByAdminId: inviteLink?.createdById ?? null,
    });

    response.cookies.set(ONBOARDING_COOKIE, "1", {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("signup error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message,
      },
      { status: 500 },
    );
  }
}