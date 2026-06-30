import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";
import {
  createTxRef,
  getManualCredit,
  getPackByAmount,
} from "@/lib/creditcache-payments";

export const runtime = "nodejs";

type Body = {
  amountNgn?: number;
  mode?: "pack" | "manual";
  callbackUrl?: string;
  label?: string;
};

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromSession(request);

    if (!user) {
      return NextResponse.json(
        { status: false, message: "Not authenticated." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as Body | null;
    const amountNgn = Number(body?.amountNgn);
    const mode = body?.mode === "manual" ? "manual" : "pack";
    const callbackUrl =
      body?.callbackUrl?.trim() ||
      new URL("/admin/payments", request.url).toString();
    const label = body?.label?.trim() || "CreditCache top up";

    if (!Number.isInteger(amountNgn) || amountNgn <= 0) {
      return NextResponse.json(
        { status: false, message: "Invalid naira amount." },
        { status: 400 },
      );
    }

    let creditedUsdCents = 0;

    if (mode === "pack") {
      const pack = getPackByAmount(amountNgn);
      if (!pack) {
        return NextResponse.json(
          { status: false, message: "Invalid pack selected." },
          { status: 400 },
        );
      }
      creditedUsdCents = pack.creditedUsd;
    } else {
      creditedUsdCents = getManualCredit(amountNgn);
      if (creditedUsdCents <= 0) {
        return NextResponse.json(
          { status: false, message: "Invalid manual amount." },
          { status: 400 },
        );
      }
    }

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { status: false, message: "FLUTTERWAVE_SECRET_KEY is not set." },
        { status: 500 },
      );
    }

    const txRef = createTxRef("creditcache");

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: String(amountNgn),
        currency: "NGN",
        redirect_url: callbackUrl,
        customer: {
          email: user.email,
          name: user.displayName ?? user.username ?? "CreditCache user",
          phonenumber: user.phone ?? undefined,
        },
        customizations: {
          title: "CreditCache",
          description: label,
        },
        meta: {
          tx_ref: txRef,
          userId: user.id,
          email: user.email,
          label,
          mode,
          amountNgn,
          creditedUsdCents,
          creditedUsd: creditedUsdCents,
        },
        configurations: {
          session_duration: 15,
          max_retry_attempt: 3,
        },
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | {
          status?: string;
          message?: string;
          data?: {
            link?: string;
          };
        }
      | null;

    if (!response.ok || data?.status !== "success" || !data?.data?.link) {
      return NextResponse.json(
        {
          status: false,
          message: data?.message ?? "Unable to initialize checkout.",
        },
        { status: 400 },
      );
    }

    await db.creditTopUp.create({
      data: {
        txRef,
        userId: user.id,
        email: user.email,
        label,
        mode,
        amountNgn,
        creditedUsd: creditedUsdCents,
        currency: "NGN",
        status: "pending",
      },
    });

    return NextResponse.json({
      status: true,
      message: "Checkout created.",
      data: {
        authorization_url: data.data.link,
        tx_ref: txRef,
        amountNgn,
        creditedUsdCents,
        creditedUsd: creditedUsdCents,
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