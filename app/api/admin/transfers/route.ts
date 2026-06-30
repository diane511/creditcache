import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  recipient: z.string().min(1).optional(),
  recipientId: z.string().min(1).optional(),
  recipientUsername: z.string().min(1).optional(),
  amountCents: z.number().int().positive(),
  purpose: z.enum([
    "WINNING",
    "SWEEPSTAKE",
    "SCHOLARSHIP",
    "SPONSORSHIP",
    "FUNDING",
    "NORMAL_TRANSFER",
  ]),
  note: z.string().trim().max(500).optional(),

  companyName: z.string().trim().max(120).optional(),
  eventName: z.string().trim().max(120).optional(),
  awardTitle: z.string().trim().max(120).optional(),
  placement: z.string().trim().max(60).optional(),
  customMessage: z.string().trim().max(1000).optional(),
  receiptTitle: z.string().trim().max(160).optional(),
});

type TransferErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_REQUEST"
  | "SENDER_NOT_FOUND"
  | "RECIPIENT_NOT_FOUND"
  | "SELF_TRANSFER"
  | "INSUFFICIENT_BALANCE"
  | "TRANSFER_FAILED";

function errorResponse(message: string, status: number, code: TransferErrorCode) {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
    },
    { status },
  );
}

function clean(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "";
}

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

function buildAwardMessage(params: {
  displayName: string;
  purpose: string;
  amountCents: number;
  companyName?: string;
  eventName?: string;
  placement?: string;
  customMessage?: string;
}) {
  const amount = formatCurrency(params.amountCents);
  const purposeLabel = params.purpose.toLowerCase().replace(/_/g, " ");

  const intro =
    params.purpose === "WINNING"
      ? `Dear ${params.displayName}, congratulations on your winning transfer.`
      : params.purpose === "SWEEPSTAKE"
        ? `Dear ${params.displayName}, congratulations on being selected for this sweepstake transfer.`
        : params.purpose === "SCHOLARSHIP"
          ? `Dear ${params.displayName}, congratulations on your scholarship transfer.`
          : params.purpose === "SPONSORSHIP"
            ? `Dear ${params.displayName}, congratulations on your sponsorship transfer.`
            : `Dear ${params.displayName}, congratulations on your funding transfer.`;

  const companyPart = params.companyName ? ` From ${params.companyName}.` : "";
  const eventPart = params.eventName ? ` Event: ${params.eventName}.` : "";
  const placementPart = params.placement ? ` Placement: ${params.placement}.` : "";

  const extra =
    params.customMessage?.trim() ||
    `You have received ${amount} under ${purposeLabel}.`;

  return `${intro}${companyPart}${eventPart}${placementPart} ${extra}`;
}

function buildReceiptMessage(params: {
  displayName: string;
  amountCents: number;
  purpose: string;
  txRef: string;
  companyName?: string;
  eventName?: string;
}) {
  const amount = formatCurrency(params.amountCents);
  const purposeLabel = params.purpose.toLowerCase().replace(/_/g, " ");
  const companyPart = params.companyName ? ` ${params.companyName}.` : ".";
  const eventPart = params.eventName ? ` Event: ${params.eventName}.` : "";

  return `Credit Cache receipt for ${params.displayName}: ${amount} received for ${purposeLabel}.${companyPart}${eventPart} Reference ${params.txRef}.`;
}

export async function POST(req: NextRequest) {
  const sender = await getUserFromSession(req);

  if (!sender) {
    return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("Invalid request body", 400, "INVALID_REQUEST");
  }

  const {
    recipient,
    recipientId,
    recipientUsername,
    amountCents,
    purpose,
    note,
    companyName,
    eventName,
    awardTitle,
    placement,
    customMessage,
    receiptTitle,
  } = parsed.data;

  const senderId = sender.id;
  const senderUsername = clean(sender.username);

  const resolvedRecipientId = clean(recipientId);
  const resolvedRecipientUsername = clean(recipientUsername);
  const resolvedRecipientFallback = clean(recipient);

  if (
    resolvedRecipientId &&
    resolvedRecipientId === senderId
  ) {
    return errorResponse("You cannot transfer to yourself", 400, "SELF_TRANSFER");
  }

  if (
    resolvedRecipientUsername &&
    resolvedRecipientUsername.toLowerCase() === senderUsername.toLowerCase()
  ) {
    return errorResponse("You cannot transfer to yourself", 400, "SELF_TRANSFER");
  }

  if (
    resolvedRecipientFallback &&
    (resolvedRecipientFallback === senderId ||
      resolvedRecipientFallback.toLowerCase() === senderUsername.toLowerCase())
  ) {
    return errorResponse("You cannot transfer to yourself", 400, "SELF_TRANSFER");
  }

  const txRef = `trx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const senderRecord = await tx.user.findUnique({
        where: { id: senderId },
        select: {
          id: true,
          username: true,
          displayName: true,
          creditBalance: true,
        },
      });

      if (!senderRecord) {
        throw new Error("SENDER_NOT_FOUND");
      }

      let recipientUser:
        | {
            id: string;
            username: string;
            displayName: string;
            creditBalance: number;
          }
        | null = null;

      if (resolvedRecipientId) {
        recipientUser = await tx.user.findUnique({
          where: { id: resolvedRecipientId },
          select: {
            id: true,
            username: true,
            displayName: true,
            creditBalance: true,
          },
        });
      }

      if (!recipientUser && resolvedRecipientUsername) {
        recipientUser = await tx.user.findUnique({
          where: { username: resolvedRecipientUsername },
          select: {
            id: true,
            username: true,
            displayName: true,
            creditBalance: true,
          },
        });
      }

      if (!recipientUser && resolvedRecipientFallback) {
        recipientUser = await tx.user.findFirst({
          where: {
            OR: [
              { id: resolvedRecipientFallback },
              { username: resolvedRecipientFallback },
            ],
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            creditBalance: true,
          },
        });
      }

      if (!recipientUser) {
        throw new Error("RECIPIENT_NOT_FOUND");
      }

      if (recipientUser.id === senderRecord.id) {
        throw new Error("SELF_TRANSFER");
      }

      if (amountCents > senderRecord.creditBalance) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const updatedSender = await tx.user.update({
        where: { id: senderRecord.id },
        data: {
          creditBalance: {
            decrement: amountCents,
          },
        },
        select: {
          creditBalance: true,
        },
      });

      const updatedRecipient = await tx.user.update({
        where: { id: recipientUser.id },
        data: {
          creditBalance: {
            increment: amountCents,
          },
        },
        select: {
          creditBalance: true,
        },
      });

      const transfer = await tx.creditTransfer.create({
        data: {
          txRef,
          senderId: senderRecord.id,
          recipientId: recipientUser.id,
          purpose,
          amountCents,
          note: note ?? null,
          senderLookup: senderRecord.username,
          recipientLookup: recipientUser.username,
          createdById: senderRecord.id,
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      const recipientDisplayName = recipientUser.displayName || recipientUser.username || "User";

      const awardMessage =
        purpose === "NORMAL_TRANSFER"
          ? note?.trim() || `You received ${formatCurrency(amountCents)}.`
          : buildAwardMessage({
              displayName: recipientDisplayName,
              purpose,
              amountCents,
              companyName,
              eventName,
              placement,
              customMessage,
            });

      const receiptMessage = buildReceiptMessage({
        displayName: recipientDisplayName,
        amountCents,
        purpose,
        txRef,
        companyName,
        eventName,
      });

      const awardTitleText =
        receiptTitle?.trim() ||
        awardTitle?.trim() ||
        (purpose === "NORMAL_TRANSFER"
          ? "Credit transfer received"
          : `Congratulations, ${recipientDisplayName}`);

      const receiptTitleText = `Credit Cache receipt: ${recipientDisplayName}`;

      await tx.activityEvent.create({
        data: {
          title: awardTitleText,
          meta: awardMessage,
          tone: purpose === "NORMAL_TRANSFER" ? "PRIMARY" : "GOOD",
          type: "TRANSFER",
          entityType: "USER",
          entityId: recipientUser.id,
          value: amountCents / 100,
          metadata: {
            kind: "transfer_notice",
            transferId: transfer.id,
            txRef,
            purpose,
            amountCents,
            senderId: senderRecord.id,
            senderUsername: senderRecord.username,
            senderDisplayName: senderRecord.displayName || senderRecord.username,
            recipientId: recipientUser.id,
            recipientUsername: recipientUser.username,
            recipientDisplayName: recipientDisplayName,
            companyName: clean(companyName),
            eventName: clean(eventName),
            awardTitle: clean(awardTitle),
            placement: clean(placement),
            customMessage: clean(customMessage),
            note: clean(note),
            balanceBeforeCents: recipientUser.creditBalance,
            balanceAfterCents: updatedRecipient.creditBalance,
            createdById: senderRecord.id,
            issuedAt: new Date().toISOString(),
          },
        },
      });

      await tx.activityEvent.create({
        data: {
          title: receiptTitleText,
          meta: receiptMessage,
          tone: "PRIMARY",
          type: "RECEIPT",
          entityType: "USER",
          entityId: recipientUser.id,
          value: amountCents / 100,
          metadata: {
            kind: "credit_receipt",
            transferId: transfer.id,
            txRef,
            receiptNumber: txRef,
            purpose,
            amountCents,
            senderId: senderRecord.id,
            senderUsername: senderRecord.username,
            senderDisplayName: senderRecord.displayName || senderRecord.username,
            recipientId: recipientUser.id,
            recipientUsername: recipientUser.username,
            recipientDisplayName: recipientDisplayName,
            companyName: clean(companyName),
            eventName: clean(eventName),
            note: clean(note),
            balanceBeforeCents: recipientUser.creditBalance,
            balanceAfterCents: updatedRecipient.creditBalance,
            createdById: senderRecord.id,
            issuedAt: new Date().toISOString(),
          },
        },
      });

      return {
        transfer,
        senderBalanceCents: updatedSender.creditBalance,
        recipientBalanceCents: updatedRecipient.creditBalance,
      };
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Transfer failed.";

    if (message === "SENDER_NOT_FOUND") {
      return errorResponse("Sender not found", 404, "SENDER_NOT_FOUND");
    }

    if (message === "RECIPIENT_NOT_FOUND") {
      return errorResponse("Recipient not found", 404, "RECIPIENT_NOT_FOUND");
    }

    if (message === "SELF_TRANSFER") {
      return errorResponse("You cannot transfer to yourself", 400, "SELF_TRANSFER");
    }

    if (message === "INSUFFICIENT_BALANCE") {
      return errorResponse("Insufficient balance", 400, "INSUFFICIENT_BALANCE");
    }

    return errorResponse("Transfer failed", 500, "TRANSFER_FAILED");
  }
}