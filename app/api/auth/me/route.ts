import { NextResponse, type NextRequest } from "next/server";
import { getUserFromSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getUserFromSession(request);

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const creditBalanceCents = user.creditBalance ?? 0;

  return NextResponse.json({
    user: {
      id: user.id,
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      verified: user.verified,
      avatarUrl: user.avatarUrl,
      creditBalance: creditBalanceCents,
      creditBalanceCents,
    },
  });
}