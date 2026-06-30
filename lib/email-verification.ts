import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { hashToken } from "@/lib/tokens";

export const EMAIL_VERIFICATION_CODE_TTL_SECONDS = 15 * 60;
export const EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS = 60;

const PURPOSE = "EMAIL_VERIFY" as const;

type VerificationUser = {
  id: string;
  email: string;
  name?: string | null;
};

type IssueVerificationCodeOptions = {
  respectCooldown?: boolean;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const makeVerificationCode = () => String(crypto.randomInt(100000, 1000000));

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatMinutes = (seconds: number) => {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
};

function buildVerificationEmail(params: {
  code: string;
  email: string;
  name?: string | null;
  expiresInSeconds: number;
}) {
  const appName = process.env.APP_NAME ?? "Credit Cache";
  const appUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const supportEmail = process.env.SUPPORT_EMAIL ?? "support@creditcache.com";

  const subject = `Verify your email for ${appName}`;
  const expiresText = formatMinutes(params.expiresInSeconds);
  const greeting = params.name ? `Hi ${params.name},` : "Hi,";

  const verifyUrl = appUrl
    ? `${appUrl.replace(/\/$/, "")}/auth/verify-email?email=${encodeURIComponent(
        params.email,
      )}&code=${encodeURIComponent(params.code)}`
    : "";

  const text = `
${appName}

${greeting}

Use this 6-digit code to verify your email:

${params.code}

This code expires in ${expiresText}.

${verifyUrl ? `Open this link to verify:\n${verifyUrl}\n` : ""}Email: ${params.email}

If you did not request this, you can ignore this email.
Need help? ${supportEmail}
`.trim();

  const html = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827;background:#ffffff;">
    <div style="max-width:560px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;margin-bottom:16px;">
        ${escapeHtml(appName)}
      </div>

      <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.2;">Verify your email address</h1>

      <p style="margin:0 0 18px 0;font-size:16px;line-height:1.6;color:#374151;">
        ${escapeHtml(greeting)} Use the code below to finish setting up your account.
        It expires in <strong>${escapeHtml(expiresText)}</strong>.
      </p>

      <div style="margin:0 0 18px 0;padding:14px 16px;border:1px solid #e5e7eb;border-radius:12px;">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">
          Verification code
        </div>
        <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:32px;font-weight:800;letter-spacing:6px;color:#111827;">
          ${escapeHtml(params.code)}
        </div>
      </div>

      ${
        verifyUrl
          ? `
      <p style="margin:0 0 18px 0;font-size:14px;line-height:1.6;color:#374151;">
        Click to verify:
        <a href="${escapeHtml(verifyUrl)}" style="color:#111827;text-decoration:underline;">${escapeHtml(
            verifyUrl,
          )}</a>
      </p>
      `
          : ""
      }

      <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:#374151;">
        Signed in as <strong>${escapeHtml(params.email)}</strong>
      </p>

      <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:#374151;">
        If this was not you, you can ignore this email.
      </p>

      <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">
        Need help? <a href="mailto:${escapeHtml(supportEmail)}" style="color:#111827;text-decoration:underline;">${escapeHtml(
          supportEmail,
        )}</a>
      </p>

      <p style="margin:18px 0 0 0;font-size:12px;line-height:1.6;color:#6b7280;">
        For security, do not share this code.
      </p>
    </div>
  </body>
</html>
`.trim();

  return { subject, text, html };
}

export async function issueEmailVerificationCode(
  user: VerificationUser,
  options: IssueVerificationCodeOptions = {},
) {
  const email = normalizeEmail(user.email);
  const { respectCooldown = false } = options;

  if (respectCooldown) {
    const latest = await prisma.verificationToken.findFirst({
      where: { userId: user.id, purpose: PURPOSE },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    if (latest) {
      const retryAfterSeconds = Math.ceil(
        (latest.createdAt.getTime() +
          EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS * 1000 -
          Date.now()) /
          1000,
      );

      if (retryAfterSeconds > 0) {
        const error = new Error(
          `Please wait ${retryAfterSeconds}s before requesting a new code.`,
        ) as Error & {
          code?: string;
          statusCode?: number;
          retryAfterSeconds?: number;
        };

        error.code = "RATE_LIMITED";
        error.statusCode = 429;
        error.retryAfterSeconds = retryAfterSeconds;
        throw error;
      }
    }
  }

  const code = makeVerificationCode();
  const token = hashToken(`${email}:${code}`);
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_CODE_TTL_SECONDS * 1000);

  await prisma.verificationToken.deleteMany({
    where: { userId: user.id, purpose: PURPOSE },
  });

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      identifier: email,
      token,
      purpose: PURPOSE,
      expiresAt,
    },
  });

  await sendEmail({
    to: email,
    ...buildVerificationEmail({
      code,
      email,
      name: user.name,
      expiresInSeconds: EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    }),
  });

  return {
    code,
    expiresAt,
    expiresInSeconds: EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    sentAt: new Date(),
  };
}