import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/services/email.service";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (!user || !user.password) {
      // Don't reveal if email exists
      return NextResponse.json(
        { message: "If the email exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.verificationToken.deleteMany({ where: { identifier: validated.email } });
    await prisma.verificationToken.create({
      data: {
        identifier: validated.email,
        token,
        expires: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendPasswordResetEmail(validated.email, resetUrl);

    return NextResponse.json(
      { message: "If the email exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send reset link" },
      { status: 400 }
    );
  }
}
