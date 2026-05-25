import { NextResponse } from "next/server";

export async function GET() {
  const isLoggedIn = false;

  if (!isLoggedIn) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: "user_1",
      email: "member@example.com",
    },
  });
}