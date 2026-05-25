import { NextResponse } from "next/server";
import { applications as seedApplications, opportunities } from "@/main/lib/data";
import type { ApplicationRecord } from "@/main/lib/types";
import { readJson, writeJson } from "@/main/lib/storage";

export async function GET() {
  const items = await readJson<ApplicationRecord[]>("applications.json", seedApplications);
  return NextResponse.json({ applications: items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.opportunitySlug || !body?.applicantName || !body?.email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const opportunity = opportunities.find((item) => item.slug === body.opportunitySlug);
  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  const current = await readJson<ApplicationRecord[]>("applications.json", seedApplications);
  const record: ApplicationRecord = {
    id: `app_${Date.now()}`,
    opportunitySlug: opportunity.slug,
    opportunityTitle: opportunity.title,
    applicantName: String(body.applicantName).slice(0, 120),
    email: String(body.email).slice(0, 120),
    status: "Submitted",
    deadline: String(body.deadline || opportunity.deadline),
    createdAt: new Date().toISOString(),
    notes: body.notes ? String(body.notes).slice(0, 1000) : undefined
  };

  const next = [record, ...current];
  await writeJson("applications.json", next);
  return NextResponse.json({ ok: true, application: record }, { status: 201 });
}
