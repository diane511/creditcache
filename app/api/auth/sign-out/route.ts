import { NextResponse, type NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: "Signed out" });
  await clearSessionCookie(response, request);
  return response;
}