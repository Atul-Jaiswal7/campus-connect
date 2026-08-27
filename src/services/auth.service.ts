import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { slugify, isCollegeEmail } from "@/lib/utils";
import { env } from "@/lib/env";
import { sendVerificationEmail } from "@/services/email.service";
import type { RegisterInput } from "@/lib/validations";

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const isVerified = isCollegeEmail(data.email, env.COLLEGE_EMAIL_DOMAIN);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      password: hashedPassword,
      isVerified,
      profile: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          department: data.department,
          year: data.year,
          profileSlug: slugify(`${data.firstName}-${data.lastName}-${Date.now()}`),
          profileCompletion: 20,
        },
      },
    },
    include: { profile: true },
  });

  if (!isVerified) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verifyUrl).catch((error) =>
      console.error("Failed to send verification email:", error)
    );
  }

  return user;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
      skills: { include: { skill: true } },
    },
  });
}

export async function verifyUser(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { isVerified: true },
  });
}
