import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isSuccessfulStatus } from "@/lib/creditcache-payments";

export const runtime = "nodejs";

type FlutterwaveVerifyResponse = {
  status?: string;
  message?: string;
  data?: {
    id?: number;
    tx_ref?: string;
    amount?: number;
    currency?: string;
    status?: string;
    meta?: Record<string, unknown> | null;
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

  const data = (await response.json().catch(() => null)) as FlutterwaveVerifyResponse | null;

  if (!response.ok || data?.status !== "success" || !data.data) {
    throw new Error(data?.message ?? "Unable to verify transaction.");
  }

  return data.data;
}

async function verifyByReference(txRef: string) {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) throw new Error("FLUTTERWAVE_SECRET_KEY is not set.");

  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(
      txRef,
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    },
  );

  const data = (await response.json().catch(() => null)) as FlutterwaveVerifyResponse | null;

  if (!response.ok || data?.status !== "success" || !data.data) {
    throw new Error(data?.message ?? "Unable to verify transaction.");
  }

  return data.data;
}

async function finalizeVerifiedTopUp(input: {
  txRef: string;
  transactionId?: string;
}) {
  const record = await db.creditTopUp.findUnique({
    where: { txRef: input.txRef },
  });

  if (!record) {
    throw new Error("Top-up record not found.");
  }

  if (record.status === "success") {
    return {
      alreadyProcessed: true,
      creditedUsdCents: record.creditedUsd,
    };
  }

  const verified = input.transactionId
    ? await verifyById(input.transactionId)
    : await verifyByReference(input.txRef);

  const verifiedStatus = String(verified.status ?? "").toLowerCase();
  const verifiedCurrency = String(verified.currency ?? "").toUpperCase();
  const verifiedAmountNgn = Math.round(Number(verified.amount ?? 0));

  if (!isSuccessfulStatus(verifiedStatus)) {
    throw new Error(`Transaction status is ${verified.status ?? "unknown"}.`);
  }

  if (verifiedCurrency !== "NGN") {
    throw new Error("Invalid currency returned by Flutterwave.");
  }

  if (verifiedAmountNgn !== record.amountNgn) {
    throw new Error(
      `Paid amount does not match expected amount. Expected ${record.amountNgn}, got ${verifiedAmountNgn}.`,
    );
  }

  await db.$transaction(async (tx) => {
    const current = await tx.creditTopUp.findUnique({
      where: { txRef: record.txRef },
    });

    if (!current) {
      throw new Error("Top-up record missing during crediting.");
    }

    if (current.status === "success") {
      return;
    }

    await tx.user.update({
      where: { id: current.userId },
      data: {
        creditBalance: {
          increment: current.creditedUsd,
        },
      },
    });

    await tx.creditTopUp.update({
      where: { txRef: current.txRef },
      data: {
        status: "success",
        providerTransactionId: input.transactionId
          ? String(input.transactionId)
          : String(verified.id ?? ""),
        verifiedAt: new Date(),
        creditedAt: new Date(),
        providerStatus: String(verified.status ?? "successful"),
      },
    });
  });

  return {
    alreadyProcessed: false,
    creditedUsdCents: record.creditedUsd,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const txRef = url.searchParams.get("tx_ref") ?? url.searchParams.get("reference");
    const transactionId = url.searchParams.get("transaction_id") ?? undefined;

    if (!txRef) {
      return NextResponse.json(
        { status: false, message: "Transaction reference is required." },
        { status: 400 },
      );
    }

    const result = await finalizeVerifiedTopUp({
      txRef,
      transactionId,
    });

    return NextResponse.json({
      status: true,
      message: result.alreadyProcessed
        ? "Payment already processed."
        : "Payment verified and user credited.",
      data: {
        reference: txRef,
        creditedUsdCents: result.creditedUsdCents,
        creditedUsd: result.creditedUsdCents,
      },
    });
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