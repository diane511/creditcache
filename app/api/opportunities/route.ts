import { NextResponse } from "next/server";
import { opportunities } from "@/main/lib/data";

export async function GET() {
  return NextResponse.json({ opportunities });
}
