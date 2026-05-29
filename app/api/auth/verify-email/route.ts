import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { verifyEmailSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

const COOKIE_NAME = "token";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function signAuthToken(userId: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
}

function setAuthCookie(response: NextResponse, userId: string) {
  response.cookies.set(COOKIE_NAME, signAuthToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS,
  });

  return response;
}

async function verifyToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const verification = await prisma.verificationToken.findUnique({
    where: { token: tokenHash },
    include: { user: true },
  });

  if (
    !verification ||
    verification.purpose !== "EMAIL_VERIFY" ||
    verification.consumedAt ||
    verification.expiresAt.getTime() <= Date.now() ||
    !verification.user
  ) {
    return null;
  }

  await prisma.user.update({
    where: { id: verification.user.id },
    data: {
      verified: true,
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    },
  });

  await prisma.verificationToken.update({
    where: { token: tokenHash },
    data: { consumedAt: new Date() },
  });

  return verification.user;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ message: "Token is required" }, { status: 400 });
  }

  const user = await verifyToken(token);

  if (!user) {
    return NextResponse.json(
      { message: "Verification link is invalid or expired" },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ message: "Email verified", success: true });
  return setAuthCookie(response, user.id);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyEmailSchema.parse(body);

    const user = await verifyToken(parsed.token);

    if (!user) {
      return NextResponse.json(
        { message: "Verification link is invalid or expired" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ message: "Email verified", success: true });
    return setAuthCookie(response, user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";

    return NextResponse.json({ message }, { status: 400 });
  }
}