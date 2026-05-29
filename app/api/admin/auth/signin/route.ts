import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  issueSession,
  isAdminRole,
  normalizeEmail,
  sanitizeNextPath,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, next } = body as {
      identifier?: string;
      password?: string;
      next?: string;
    };

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    const orFilters: Array<{ email?: string; phone?: string }> = [];

    if (cleanIdentifier.includes("@")) {
      orFilters.push({ email: normalizeEmail(cleanIdentifier) });
    } else {
      orFilters.push({ phone: cleanIdentifier });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: orFilters,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.verified) {
      return NextResponse.json(
        { message: "Please verify your account first" },
        { status: 403 }
      );
    }

    if (!isAdminRole(user.role)) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
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
      { message: "Server error" },
      { status: 500 }
    );
  }
}