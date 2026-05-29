import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const CODE_TTL_SECONDS = 15 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.parse(body);

    const email = parsed.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          code: "USER_NOT_FOUND",
          message: "No account found for this email. Create an account first.",
        },
        { status: 404 },
      );
    }

    const latest = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        purpose: "PASSWORD_RESET",
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (latest) {
      const resendAt = latest.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000;
      const now = Date.now();

      if (now < resendAt) {
        const retryAfterSeconds = Math.ceil((resendAt - now) / 1000);

        return NextResponse.json(
          {
            code: "RESEND_COOLDOWN",
            message: `Please wait ${retryAfterSeconds}s before requesting a new code.`,
            retryAfterSeconds,
          },
          { status: 429 },
        );
      }
    }

    const code = String(randomInt(100000, 1000000));
    const tokenHash = hashToken(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000);

    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
        purpose: "PASSWORD_RESET",
      },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: tokenHash,
        purpose: "PASSWORD_RESET",
        userId: user.id,
        expiresAt,
      },
    });

    await sendEmail({
      to: user.email,
      subject: "Your password reset code",
      text: `Your password reset code is ${code}. It expires in 15 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Password reset code</h2>
          <p>Use this code to reset your password:</p>
          <p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:16px 0">${code}</p>
          <p>This code expires in 15 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "A reset code has been sent to your email.",
      expiresInSeconds: CODE_TTL_SECONDS,
      resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
      expiresAt: expiresAt.toISOString(),
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}