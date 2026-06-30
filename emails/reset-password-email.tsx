import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Link,
} from "@react-email/components";

type ResetPasswordEmailProps = {
  name?: string;
  appName?: string;
  resetCode: string;
  expiresInMinutes?: number;
  resetUrl?: string;
};

export default function ResetPasswordEmail({
  name = "there",
  appName = "Your App",
  resetCode,
  expiresInMinutes = 15,
  resetUrl = "https://your-domain.com/auth/reset-password",
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your password reset code for {appName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Section style={badge}>✦</Section>

            <Text style={eyebrow}>Account security</Text>
            <Text style={title}>Reset your password</Text>
            <Text style={subtitle}>
              Hi {name}, we received a request to reset the password for{" "}
              <strong>{appName}</strong>.
            </Text>
          </Section>

          <Section style={content}>
            <Text style={bodyText}>
              Use this one-time code to continue:
            </Text>

            <Section style={codeWrap}>
              <Text style={code}>{resetCode}</Text>
            </Section>

            <Text style={bodyText}>
              This code expires in <strong>{expiresInMinutes} minutes</strong>.
              If you did not request a reset, you can ignore this email.
            </Text>

            <Section style={buttonRow}>
              <Button href={resetUrl} style={button}>
                Reset password
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              For your security, this code can only be used once.
            </Text>

            <Text style={footerText}>
              Need help?{" "}
              <Link href="mailto:support@your-domain.com" style={footerLink}>
                Contact support
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#020617",
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: "32px 16px",
};

const container: React.CSSProperties = {
  maxWidth: "640px",
  margin: "0 auto",
  borderRadius: "28px",
  overflow: "hidden",
  backgroundColor: "#0f172a",
  border: "1px solid rgba(255,255,255,0.08)",
};

const header: React.CSSProperties = {
  padding: "32px",
  background:
    "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.14))",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const badge: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: 800,
  boxShadow: "0 12px 30px rgba(99,102,241,0.35)",
};

const eyebrow: React.CSSProperties = {
  margin: "18px 0 8px",
  color: "#a5b4fc",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const title: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#ffffff",
  fontSize: "32px",
  lineHeight: 1.15,
  fontWeight: 800,
  letterSpacing: "-0.03em",
};

const subtitle: React.CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: 1.7,
};

const content: React.CSSProperties = {
  padding: "32px",
};

const bodyText: React.CSSProperties = {
  margin: "0 0 16px",
  color: "#cbd5e1",
  fontSize: "15px",
  lineHeight: 1.7,
};

const codeWrap: React.CSSProperties = {
  margin: "18px 0 22px",
  padding: "18px 20px",
  borderRadius: "18px",
  backgroundColor: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
  textAlign: "center",
};

const code: React.CSSProperties = {
  margin: 0,
  color: "#ffffff",
  fontSize: "30px",
  lineHeight: 1,
  fontWeight: 800,
  letterSpacing: "0.34em",
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
};

const buttonRow: React.CSSProperties = {
  margin: "24px 0 0",
};

const button: React.CSSProperties = {
  display: "inline-block",
  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  color: "#ffffff",
  textDecoration: "none",
  padding: "14px 22px",
  borderRadius: "14px",
  fontWeight: 700,
  fontSize: "15px",
  boxShadow: "0 10px 24px rgba(99,102,241,0.24)",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.08)",
  margin: "28px 0 20px",
};

const footerText: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: 1.7,
};

const footerLink: React.CSSProperties = {
  color: "#c4b5fd",
  textDecoration: "underline",
};