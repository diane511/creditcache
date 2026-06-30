import crypto from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSuccessfulStatus } from "@/lib/creditcache-payments";

export const runtime = "nodejs";

type WebhookBody = {
  event?: string;
  data?: {
    id?: number;
    tx_ref?: string;
    amount?: number;
    currency?: string;
    status?: string;
  };
};

async function verifyById(transactionId: string) {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) throw new Error("FLUTTERWAVE_SECRET_KEY is not set.");

  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  const data = (await response.json().catch(() => null)) as
    | {
        status?: string;
        message?: string;
        data?: {
          id?: number;
          tx_ref?: string;
          amount?: number;
          currency?: string;
          status?: string;
        };
      }
    | null;

  if (!response.ok || data?.status !== "success" || !data.data) {
    throw new Error(data?.message ?? "Unable to verify transaction.");
  }

  return data.data;
}

function timingSafeEqualString(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: Request) {
  try {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
    if (!secretHash) {
      return NextResponse.json(
        { status: false, message: "FLUTTERWAVE_WEBHOOK_SECRET_HASH is not set." },
        { status: 500 },
      );
    }

    const rawBody = await request.text();

    const flutterwaveSignature =
      request.headers.get("flutterwave-signature") ??
      request.headers.get("verif-hash") ??
      "";

    if (!flutterwaveSignature) {
      return NextResponse.json(
        { status: false, message: "Missing webhook signature." },
        { status: 401 },
      );
    }

    const headerUsed = request.headers.get("flutterwave-signature")
      ? "flutterwave-signature"
      : "verif-hash";

    let valid = false;

    if (headerUsed === "flutterwave-signature") {
      const computed = crypto
        .createHmac("sha256", secretHash)
        .update(rawBody)
        .digest("base64");

      valid = timingSafeEqualString(computed, flutterwaveSignature);
    } else {
      valid = timingSafeEqualString(secretHash, flutterwaveSignature);
    }

    if (!valid) {
      return NextResponse.json(
        { status: false, message: "Invalid webhook signature." },
        { status: 401 },
      );
    }

    const body = JSON.parse(rawBody) as WebhookBody;

    const txRef = body?.data?.tx_ref;
    const transactionId = body?.data?.id ? String(body.data.id) : undefined;
    const status = body?.data?.status ?? "";

    if (!txRef) {
      return NextResponse.json({ status: true, message: "Ignored." }, { status: 200 });
    }

    if (!isSuccessfulStatus(status)) {
      return NextResponse.json({ status: true, message: "Ignored." }, { status: 200 });
    }

    const record = await db.creditTopUp.findUnique({
      where: { txRef },
    });

    if (!record) {
      return NextResponse.json(
        { status: false, message: "Top-up record not found." },
        { status: 404 },
      );
    }

    if (record.status === "success") {
      return NextResponse.json({ status: true, message: "Already processed." }, { status: 200 });
    }

    const verified = transactionId ? await verifyById(transactionId) : null;
    const verifiedCurrency = String(verified?.currency ?? body.data?.currency ?? "").toUpperCase();
    const verifiedAmountNgn = Math.round(Number(verified?.amount ?? body.data?.amount ?? 0));

    if (verifiedCurrency && verifiedCurrency !== "NGN") {
      return NextResponse.json(
        { status: false, message: "Invalid currency." },
        { status: 400 },
      );
    }

    if (verifiedAmountNgn && verifiedAmountNgn !== record.amountNgn) {
      return NextResponse.json(
        { status: false, message: "Amount mismatch." },
        { status: 400 },
      );
    }

    await db.$transaction(async (tx) => {
      const current = await tx.creditTopUp.findUnique({
        where: { txRef },
      });

      if (!current || current.status === "success") return;

      await tx.user.update({
        where: { id: current.userId },
        data: {
          creditBalance: {
            increment: current.creditedUsd,
          },
        },
      });

      await tx.creditTopUp.update({
        where: { txRef },
        data: {
          status: "success",
          providerTransactionId: transactionId ?? String(verified?.id ?? ""),
          verifiedAt: new Date(),
          creditedAt: new Date(),
          providerStatus: String(verified?.status ?? body.data?.status ?? "successful"),
        },
      });
    });

    return NextResponse.json({ status: true, message: "Credited." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}