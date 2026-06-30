// main/app/api/onboarding/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, emailPrefixToDisplayName, uniqueUsername, slugifyUsername } from "@/lib/auth";
import { isProduction } from "@/lib/session";

export const runtime = "nodejs";

const ONBOARDING_COOKIE = "cc_onboarding_pending";

function normalizeDateInput(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function normalizeText(value: unknown) {
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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromSession(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          message: "You must be signed in to complete onboarding.",
        },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const legalName = normalizeText(body?.legalName);
    const dateOfBirth = normalizeDateInput(body?.dateOfBirth);
    const usernameInput = normalizeText(body?.username);

    if (!legalName) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Legal name is required.",
        },
        { status: 400 },
      );
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Date of birth is required.",
        },
        { status: 400 },
      );
    }

    if (dateOfBirth > new Date()) {
      return NextResponse.json(
        {
          success: false,
          code: "VALIDATION_ERROR",
          message: "Date of birth cannot be in the future.",
        },
        { status: 400 },
      );
    }

    const desiredUsername =
      slugifyUsername(usernameInput) ||
      slugifyUsername(legalName) ||
      slugifyUsername(emailPrefixToDisplayName(user.email)) ||
      "user";

    const existingUsername = await prisma.user.findUnique({
      where: { username: desiredUsername },
      select: { id: true },
    });

    const finalUsername =
      existingUsername && existingUsername.id !== user.id
        ? await uniqueUsername(desiredUsername)
        : desiredUsername;

    const displayName = legalName.split(/\s+/)[0] || emailPrefixToDisplayName(user.email);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        legalName,
        dateOfBirth,
        username: finalUsername,
        displayName,
        onboardingComplete: true,
      },
    });

    await logActivity(
      user.id,
      "Onboarding completed",
      "Your profile has been saved and your dashboard is now unlocked.",
    );

    const response = NextResponse.json({
      success: true,
      message: "Onboarding complete.",
      redirectTo: "/dashboard",
      username: finalUsername,
    });

    response.cookies.set(ONBOARDING_COOKIE, "", {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error("onboarding complete error:", error);
    return NextResponse.json(
      {
        success: false,
        code: "SERVER_ERROR",
        message: "We could not save your onboarding details.",
      },
      { status: 500 },
    );
  }
}