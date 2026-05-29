// app/api/auth/signin/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  return value.trim().replace(/[^\d+()\s-]/g, "");
}

function isLikelyEmail(value: string) {
  return value.includes("@");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      identifier,
      password,
      method,
    } = body as {
      identifier?: string;
      password?: string;
      method?: "email" | "phone";
    };

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 },
      );
    }

    const cleanIdentifier = identifier.trim();

    const user = await prisma.user.findFirst({
      where:
        method === "phone"
          ? {
              phone: normalizePhone(cleanIdentifier),
            }
          : method === "email"
            ? {
                email: normalizeEmail(cleanIdentifier),
              }
            : isLikelyEmail(cleanIdentifier)
              ? {
                  email: normalizeEmail(cleanIdentifier),
                }
              : {
                  phone: normalizePhone(cleanIdentifier),
                },
      select: {
        id: true,
        email: true,
        phone: true,
        passwordHash: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json(
        { message: "Account is temporarily locked. Try again later." },
        { status: 423 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
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

    const response = NextResponse.json({ success: true });
    await issueSession(response, user.id, req);
    return response;
  } catch (error) {
    console.error("signin error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 },
    );
  }
}