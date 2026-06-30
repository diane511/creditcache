import { NextResponse, type NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { issueSession, sanitizeNextPath } from "@/lib/auth";
import { verifyEmailCodeSchema, verifyEmailSchema } from "@/lib/validators/auth";

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

async function verifyWithCode(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();
  const tokenHash = hashToken(`${cleanEmail}:${cleanCode}`);

  const verification = await prisma.verificationToken.findFirst({
    where: {
      token: tokenHash,
      purpose: "EMAIL_VERIFY",
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
      identifier: cleanEmail,
    },
    include: { user: true },
  });

  if (!verification?.user) {
    return null;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.user.id },
      data: {
        verified: true,
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
      },
    }),
    prisma.verificationToken.update({
      where: { token: tokenHash },
      data: { consumedAt: new Date() },
    }),
  ]);

  return verification.user;
}

async function verifyLegacyToken(rawToken: string) {
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

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.user.id },
      data: {
        verified: true,
        emailVerifiedAt: new Date(),
        status: "ACTIVE",
      },
    }),
    prisma.verificationToken.update({
      where: { token: tokenHash },
      data: { consumedAt: new Date() },
    }),
  ]);

  return verification.user;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));

  if (token) {
    const user = await verifyLegacyToken(token);

    if (!user) {
      return NextResponse.json(
        { message: "Verification link is invalid or expired" },
        { status: 400 },
      );
    }

    const response = NextResponse.redirect(new URL(nextPath, request.url));
    await issueSession(response, user.id, request);
    return setAuthCookie(response, user.id);
  }

  return NextResponse.json(
    { message: "Verification link is invalid or expired" },
    { status: 400 },
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nextPath = sanitizeNextPath(
      typeof body?.nextPath === "string" ? body.nextPath : "/dashboard?welcome=verified",
    );

    const parsed = verifyEmailCodeSchema.safeParse(body);

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

    const user = await verifyWithCode(parsed.data.email, parsed.data.code);

    if (!user) {
      return NextResponse.json(
        {
          code: "INVALID_VERIFICATION_CODE",
          message: "Verification code is invalid or expired.",
        },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      message: "Email verified",
      success: true,
      redirectUrl: nextPath,
    });

    await issueSession(response, user.id, request);
    return setAuthCookie(response, user.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}