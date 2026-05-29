import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRandomPasswordHash } from "@/lib/password";
import { fetchGoogleProfile, exchangeGoogleCode } from "@/lib/oauth";
import {
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  isProduction,
} from "@/lib/session";
import {
  emailPrefixToDisplayName,
  issueSession,
  normalizeEmail,
  sanitizeNextPath,
  uniqueUsername,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");

    const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
    const nextPath = sanitizeNextPath(
      request.cookies.get(OAUTH_NEXT_COOKIE)?.value,
    );

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=oauth_state", request.url),
      );
    }

    const tokenData = await exchangeGoogleCode(request.nextUrl.origin, code);
    const profile = await fetchGoogleProfile(tokenData.access_token);

    if (!profile.email) {
      return NextResponse.redirect(
        new URL("/auth/sign-in?error=google_email", request.url),
      );
    }

    const email = normalizeEmail(profile.email);

    let account = await prisma.authAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "GOOGLE",
          providerAccountId: profile.sub,
        },
      },
      include: { user: true },
    });

    let user = account?.user ?? null;

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      const displayName =
        profile.name?.trim() || emailPrefixToDisplayName(email);
      const username = await uniqueUsername(displayName);
      const passwordHash = await createRandomPasswordHash();

      user = await prisma.user.create({
        data: {
          displayName,
          username,
          email,
          passwordHash,
          role: "PENDING_ADMIN",
          status: "ACTIVE",
          isApproved: true,
          verified: Boolean(profile.email_verified),
          emailVerifiedAt: profile.email_verified ? new Date() : null,
          avatarUrl: profile.picture ?? null,
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
        },
      });
    } else if (profile.email_verified && !user.verified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          emailVerifiedAt: new Date(),
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
        },
      });
    }

    if (!account) {
      account = await prisma.authAccount.create({
        data: {
          userId: user.id,
          provider: "GOOGLE",
          providerAccountId: profile.sub,
          providerEmail: email,
          idToken: tokenData.id_token ?? null,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token ?? null,
          scope: tokenData.scope ?? null,
          tokenType: tokenData.token_type ?? null,
          expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          providerData: profile as unknown as object,
        },
      });
    } else {
      await prisma.authAccount.update({
        where: { id: account.id },
        data: {
          providerEmail: email,
          idToken: tokenData.id_token ?? null,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token ?? null,
          scope: tokenData.scope ?? null,
          tokenType: tokenData.token_type ?? null,
          expiresAt: Math.floor(Date.now() / 1000) + tokenData.expires_in,
          providerData: profile as unknown as object,
        },
      });
    }

    const response = NextResponse.redirect(new URL(nextPath, request.url));

    response.cookies.set(OAUTH_STATE_COOKIE, "", {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    response.cookies.set(OAUTH_NEXT_COOKIE, "", {
      httpOnly: true,
      secure: isProduction(),
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    await issueSession(response, user.id, request);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google sign-in failed";

    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=${encodeURIComponent(message)}`, request.url),
    );
  }
}