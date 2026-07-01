import { NextResponse } from "next/server";
import { scamReports as seedReports } from "@/lib/data";
import type { ScamReport } from "@/lib/types";
import { readJson, writeJson } from "@/lib/storage";

export async function GET() {
  const items = await readJson<ScamReport[]>(
    "scam-reports.json",
    seedReports as unknown as ScamReport[]
  );
  return NextResponse.json({ reports: items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.topic || !body?.channel || !body?.description) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const current = await readJson<ScamReport[]>(
    "scam-reports.json",
    seedReports as unknown as ScamReport[]
  );

  const report: ScamReport = {
    id: `scam_${Date.now()}`,
    topic: String(body.topic).slice(0, 120),
    channel: String(body.channel).slice(0, 80),
    description: String(body.description).slice(0, 2000),
    status: "New",
    createdAt: new Date().toISOString(),
  };

  const next = [report, ...current];
  await writeJson("scam-reports.json", next);
  return NextResponse.json({ ok: true, report }, { status: 201 });
}