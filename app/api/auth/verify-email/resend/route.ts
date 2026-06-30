import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyEmailCodeSchema } from "@/lib/validators/auth";
import { issueEmailVerificationCode } from "@/lib/email-verification";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyEmailCodeSchema.safeParse({
      email: body?.email,
      code: "000000",
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "VALIDATION_ERROR",
          message: "Please enter a valid email address.",
          errors: parsed.error.issues.map((issue) => ({
            field: issue.path.join(".") || null,
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, verified: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          code: "USER_NOT_FOUND",
          message: "No account found for this email.",
        },
        { status: 404 },
      );
    }

    if (user.verified) {
      return NextResponse.json(
        {
          code: "ALREADY_VERIFIED",
          message: "This account is already verified.",
        },
        { status: 409 },
      );
    }

    try {
      const result = await issueEmailVerificationCode(
        { id: user.id, email: user.email },
        { respectCooldown: true },
      );

      return NextResponse.json({
        success: true,
        message: "A new verification code has been sent.",
        expiresInSeconds: result.expiresInSeconds,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        "statusCode" in error &&
        Number((error as Error & { statusCode?: number }).statusCode) === 429
      ) {
        return NextResponse.json(
          {
            code: "RATE_LIMITED",
            message:
              error.message || "Please wait before requesting another code.",
            retryAfterSeconds: Number(
              (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds ?? 60,
            ),
          },
          { status: 429 },
        );
      }

      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return NextResponse.json(
      {
        code: "SERVER_ERROR",
        message,
      },
      { status: 500 },
    );
  }
}