import { NextResponse } from "next/server";
import { getVaultRecords } from "@/lib/data";
import type { VaultRecord } from "@/lib/types";
import { readJson, writeJson } from "@/lib/storage";

export async function GET() {
  const seedVault = await getVaultRecords();

  const items = await readJson<VaultRecord[]>(
    "documents.json",
    seedVault as unknown as VaultRecord[],
  );

  return NextResponse.json({ documents: items });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.label) {
    return NextResponse.json({ error: "Document label is required." }, { status: 400 });
  }

  const seedVault = await getVaultRecords();

  const current = await readJson<VaultRecord[]>(
    "documents.json",
    seedVault as unknown as VaultRecord[],
  );

  const record: VaultRecord = {
    id: `doc_${Date.now()}`,
    label: String(body.label).slice(0, 150),
    type: String(body.type || "General").slice(0, 50),
    dateAdded: new Date().toISOString().slice(0, 10),
    notes: body.notes ? String(body.notes).slice(0, 1000) : "",
  };

  const next = [record, ...current];
  await writeJson("documents.json", next);

  return NextResponse.json({ ok: true, document: record }, { status: 201 });
}