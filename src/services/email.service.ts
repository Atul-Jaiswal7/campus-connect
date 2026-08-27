import { env } from "@/lib/env";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!env.BREVO_API_KEY || !env.BREVO_FROM_EMAIL) {
    console.warn("BREVO_API_KEY/BREVO_FROM_EMAIL not configured; skipping email send.");
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { email: env.BREVO_FROM_EMAIL, name: env.NEXT_PUBLIC_APP_NAME },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to send email via Brevo: ${res.status} ${body}`);
  }
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendEmail({
    to,
    subject: `Reset your ${env.NEXT_PUBLIC_APP_NAME} password`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset the password for your ${env.NEXT_PUBLIC_APP_NAME} account.</p>
        <p>Click the button below to choose a new password. This link expires in 1 hour.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#0a66c2;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(to: string, verifyUrl: string) {
  await sendEmail({
    to,
    subject: `Verify your ${env.NEXT_PUBLIC_APP_NAME} email`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Confirm your college email address to unlock full access to ${env.NEXT_PUBLIC_APP_NAME}.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background:#0a66c2;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
            Verify Email
          </a>
        </p>
        <p>This link expires in 24 hours. If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  });
}
