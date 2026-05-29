import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, password } = body as {
      email?: string;
      phone?: string;
      password?: string;
    };

    const cleanEmail = email?.trim();
    const cleanPhone = phone?.trim() || null;

    if (!cleanEmail || !password) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, ...(cleanPhone ? [{ phone: cleanPhone }] : [])],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usernameBase = cleanEmail.split("@")[0];
    const username = `${usernameBase}_${crypto.randomBytes(3).toString("hex")}`;

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        username,
        displayName: usernameBase,
        verified: false,
      },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        identifier: cleanEmail,
        token: tokenHash,
        purpose: "EMAIL_VERIFY",
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      },
    });

    return NextResponse.json({
      success: true,
      verifyUrl: `/auth/verify-email?token=${rawToken}`,
    });
  } catch (error) {
    console.error("signup error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}