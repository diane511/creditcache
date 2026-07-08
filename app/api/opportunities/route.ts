import { NextResponse } from "next/server";
import { getOpportunities } from "@/lib/data";

export async function GET() {
  const opportunities = await getOpportunities();
  return NextResponse.json({ opportunities });
}