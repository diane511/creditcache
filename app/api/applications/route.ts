import { NextResponse } from "next/server";
import { getApplications, getOpportunities } from "@/lib/data";
import type { ApplicationRecord } from "@/lib/types";
import { readJson, writeJson } from "@/lib/storage";

export async function GET() {
  const seedApplications = await getApplications();

  const items = await readJson<ApplicationRecord[]>(
    "applications.json",
    seedApplications as unknown as ApplicationRecord[],
  );

  return NextResponse.json({ applications: items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.opportunitySlug || !body?.applicantName || !body?.email) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const opportunities = await getOpportunities();
  const opportunity = opportunities.find((item) => item.slug === body.opportunitySlug);

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });
  }

  const seedApplications = await getApplications();

  const current = await readJson<ApplicationRecord[]>(
    "applications.json",
    seedApplications as unknown as ApplicationRecord[],
  );

  const record: ApplicationRecord = {
    id: `app_${Date.now()}`,
    opportunitySlug: opportunity.slug,
    opportunityTitle: opportunity.title,
    applicantName: String(body.applicantName).slice(0, 120),
    email: String(body.email).slice(0, 120),
    status: "Submitted",
    deadline: String(body.deadline || opportunity.deadline),
    createdAt: new Date().toISOString(),
    notes: body.notes ? String(body.notes).slice(0, 1000) : undefined,
  };

  const next = [record, ...current];
  await writeJson("applications.json", next);

  return NextResponse.json({ ok: true, application: record }, { status: 201 });
}