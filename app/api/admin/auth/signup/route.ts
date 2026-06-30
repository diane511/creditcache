import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createOpaqueToken,
  emailPrefixToDisplayName,
  normalizeEmail,
  normalizePhone,
  sanitizeNextPath,
  uniqueUsername,
} from "@/lib/auth";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

function isStrongEnoughPassword(value: string) {
  return value.length >= 8;
}

function buildEmailVerificationPath(email: string, next?: string) {
  const params = new URLSearchParams();
  params.set("email", email);
  params.set("next", sanitizeNextPath(next ?? "/admin"));
  return `/auth/verify-email?${params.toString()}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    const {
      legalName,
      email,
      phone,
      password,
      confirmPassword,
      next,
    } = (body ?? {}) as {
      legalName?: string;
      email?: string;
      phone?: string;
      password?: string;
      confirmPassword?: string;
      next?: string;
    };

    if (!legalName || !email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          code: "missing_fields",
          message:
            "Legal name, email, password, and confirm password are required.",
        },
        { status: 400 },
      );
    }

    const cleanLegalName = legalName.trim();
    const cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        {
          code: "invalid_email",
          message: "Please enter a valid email address.",
        },
        { status: 400 },
      );
    }

    const cleanPhone = phone?.trim() ? normalizePhone(phone) : null;

    if (cleanPhone && !isValidPhone(cleanPhone)) {
      return NextResponse.json(
        {
          code: "invalid_phone",
          message: "Please enter a valid phone number.",
        },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          code: "password_mismatch",
          message: "Passwords do not match.",
        },
        { status: 400 },
      );
    }

    if (!isStrongEnoughPassword(password)) {
      return NextResponse.json(
        {
          code: "weak_password",
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 },
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, verified: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          code: existingEmail.verified
            ? "account_exists_email"
            : "account_exists_email_unverified",
          message: existingEmail.verified
            ? "An account with this email already exists."
            : "An account with this email already exists, but it is not verified yet.",
        },
        { status: 409 },
      );
    }

    if (cleanPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: cleanPhone },
        select: { id: true, verified: true },
      });

      if (existingPhone) {
        return NextResponse.json(
          {
            code: existingPhone.verified
              ? "account_exists_phone"
              : "account_exists_phone_unverified",
            message: existingPhone.verified
              ? "An account with this phone number already exists."
              : "An account with this phone number already exists, but it is not verified yet.",
          },
          { status: 409 },
        );
      }
    }

    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
      select: { id: true },
    });

    const isFirstAdmin = !existingSuperAdmin;

    const usernameBase =
      cleanLegalName.split(/\s+/)[0] || emailPrefixToDisplayName(cleanEmail);
    const username = await uniqueUsername(usernameBase);
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = createOpaqueToken();
    const verificationPath = buildEmailVerificationPath(cleanEmail, next);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          legalName: cleanLegalName,
          displayName:
            cleanLegalName.split(/\s+/)[0] ||
            emailPrefixToDisplayName(cleanEmail),
          username,
          email: cleanEmail,
          phone: cleanPhone,
          passwordHash,
          role: isFirstAdmin ? "SUPER_ADMIN" : "PENDING_ADMIN",
          status: isFirstAdmin ? "ACTIVE" : "PENDING",
          verified: false,
          isApproved: isFirstAdmin,
          onboardingComplete: false,
        },
      });

      await tx.verificationToken.create({
        data: {
          userId: createdUser.id,
          identifier: cleanEmail,
          token: verificationToken,
          purpose: "EMAIL_VERIFY",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          metadata: {
            userId: createdUser.id,
            context: isFirstAdmin ? "admin-bootstrap" : "admin-signup",
            next: sanitizeNextPath(next ?? "/admin"),
          },
        },
      });

      return createdUser;
    });

    return NextResponse.json(
      {
        success: true,
        code: "verification_required",
        message: isFirstAdmin
          ? "Super admin account created. Please verify your email before signing in."
          : "Admin account created. Please verify your email before signing in.",
        nextPath: verificationPath,
        email: user.email,
        verificationRequired: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("admin signup error:", error);
    return NextResponse.json(
      {
        code: "server_error",
        message: "Server validation failed. Please try again.",
      },
      { status: 500 },
    );
  }
}