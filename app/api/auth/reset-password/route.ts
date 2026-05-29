import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashToken } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { revokeAllSessionsForUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.parse(body);

    const email = parsed.email.trim().toLowerCase();
    const codeHash = hashToken(parsed.code.trim());

    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: codeHash,
        purpose: "PASSWORD_RESET",
        consumedAt: null,
        expiresAt: {
          gt: new Date(),
        },
        user: {
          email,
        },
      },
      include: { user: true },
    });

    if (!verification?.user) {
      return NextResponse.json(
        { message: "Reset code is invalid or expired" },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(parsed.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.user.id },
        data: {
          passwordHash,
          passwordUpdatedAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.verificationToken.update({
        where: { token: codeHash },
        data: { consumedAt: new Date() },
      }),
    ]);

    await revokeAllSessionsForUser(verification.user.id);

    return NextResponse.json({ message: "Password updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}