import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession, slugifyUsername } from "@/lib/auth";
import { onboardingSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

function normalizeUsername(value: string) {
  return slugifyUsername(value)
    .replace(/[^a-z0-9._]/g, "")
    .replace(/^\.+|\.+$/g, "")
    .replace(/\.+/g, ".");
}

function buildUsernameSuggestions(base: string) {
  const cleanBase = normalizeUsername(base) || "user";
  const compact = cleanBase.replace(/\./g, "");
  return Array.from(
    new Set([
      cleanBase,
      `${cleanBase}1`,
      `${cleanBase}.cc`,
      `${compact}${Math.floor(Math.random() * 90 + 10)}`,
    ]),
  ).slice(0, 4);
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromSession(request);

    if (!currentUser) {
      return NextResponse.json(
        {
          code: "SESSION_EXPIRED",
          message: "Your session expired. Please sign in again.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = onboardingSchema.safeParse(body);

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

    const legalName = parsed.data.legalName.trim();
    const username = normalizeUsername(parsed.data.username);

    const usernameExists = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (usernameExists && usernameExists.id !== currentUser.id) {
      return NextResponse.json(
        {
          code: "USERNAME_TAKEN",
          message: "That username is already taken.",
          suggestions: buildUsernameSuggestions(legalName),
        },
        { status: 409 },
      );
    }

    const dateOfBirth = new Date(parsed.data.dateOfBirth);
    if (Number.isNaN(dateOfBirth.getTime())) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Enter a valid date of birth.",
        },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        displayName: legalName,
        username,
        dateOfBirth,
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        dateOfBirth: true,
      },
    });

    await prisma.activityEvent.create({
      data: {
        title: "Profile completed",
        meta: "Legal name, date of birth, and username saved.",
        tone: "GOOD",
        type: "ONBOARDING",
        entityType: "USER",
        entityId: currentUser.id,
        createdById: currentUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile saved",
      user: updatedUser,
    });
  } catch (error) {
    console.error("onboarding error:", error);
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}