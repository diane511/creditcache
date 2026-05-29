import { NextResponse, type NextRequest } from "next/server";
import {
  buildGoogleAuthorizeUrl,
} from "@/lib/oauth";
import {
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MINUTES,
  isProduction,
} from "@/lib/session";
import { addMinutes } from "@/lib/tokens";
import { generateToken } from "@/lib/tokens";
import { sanitizeNextPath } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
  const state = generateToken(16);
  const redirectUrl = buildGoogleAuthorizeUrl(request.nextUrl.origin, state);

  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: addMinutes(new Date(), OAUTH_STATE_MINUTES),
  });

  response.cookies.set(OAUTH_NEXT_COOKIE, nextPath, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    expires: addMinutes(new Date(), 30),
  });

  return response;
}