import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

function formatCurrency(cents: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function cleanAscii(input: string) {
  return input
    .replace(/[^\x20-\x7E\n\r]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfString(value: string) {
  return `(${cleanAscii(value)})`;
}

function buildPdf(lines: string[]) {
  const contentParts: string[] = [
    "BT",
    "/F1 18 Tf",
    "72 758 Td",
    `${pdfString("CREDIT CACHE RECEIPT")} Tj`,
    "/F1 9 Tf",
    "0 -18 Td",
    `${pdfString("Official PDF receipt")} Tj`,
    "/F2 11 Tf",
    "0 -30 Td",
    `${pdfString("Receipt summary")} Tj`,
    "/F1 10 Tf",
    "0 -14 Td",
  ];

  lines.forEach((line, index) => {
    if (index > 0) {
      contentParts.push("T*");
    }
    contentParts.push(`${pdfString(line)} Tj`);
  });

  contentParts.push("ET");

  const content = contentParts.join("\n");
  const contentBuffer = Buffer.from(content, "utf8");

  const objects: string[] = [];
  objects.push(`1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj`);
  objects.push(`2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj`);
  objects.push(
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >> endobj`,
  );
  objects.push(`4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj`);
  objects.push(`5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj`);
  objects.push(
    `6 0 obj << /Length ${contentBuffer.length} >> stream\n${content}\nendstream endobj`,
  );

  let pdf = `%PDF-1.4\n`;
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${obj}\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += `0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    const offset = offsets[i].toString().padStart(10, "0");
    pdf += `${offset} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.activityEvent.findFirst({
    where: {
      id,
      entityType: "USER",
      entityId: user.id,
    },
    select: {
      id: true,
      title: true,
      meta: true,
      type: true,
      metadata: true,
      createdAt: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const meta = asRecord(event.metadata);
  const purpose = text(meta.purpose, event.type ?? "Transfer");
  const txRef = text(meta.txRef, event.id);
  const receiptNumber = text(meta.receiptNumber, txRef);
  const senderName = text(meta.senderDisplayName, text(meta.senderName, "Credit Cache"));
  const recipientName = text(meta.recipientDisplayName, text(meta.recipientName, "You"));
  const companyName = text(meta.companyName, "Credit Cache");
  const eventName = text(meta.eventName, "");
  const awardTitle = text(meta.awardTitle, "");
  const placement = text(meta.placement, "");
  const amountCents = numberValue(meta.amountCents);
  const balanceBeforeCents = numberValue(meta.balanceBeforeCents);
  const balanceAfterCents = numberValue(meta.balanceAfterCents);
  const createdAt = formatDate(event.createdAt);

  const lines = [
    `Receipt No.: ${receiptNumber}`,
    `Reference: ${txRef}`,
    `Date Issued: ${createdAt}`,
    `Recipient: ${recipientName}`,
    `Sender: ${senderName}`,
    `Company: ${companyName}`,
    `Purpose: ${purpose}`,
    `Amount: ${formatCurrency(amountCents)}`,
    `Balance Before: ${balanceBeforeCents ? formatCurrency(balanceBeforeCents) : "N/A"}`,
    `Balance After: ${balanceAfterCents ? formatCurrency(balanceAfterCents) : "N/A"}`,
    `Event: ${eventName || "N/A"}`,
    `Award Title: ${awardTitle || "N/A"}`,
    `Placement: ${placement || "N/A"}`,
  ];

  const pdf = buildPdf(lines);

  return new NextResponse(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="credit-cache-receipt-${receiptNumber}.pdf"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}