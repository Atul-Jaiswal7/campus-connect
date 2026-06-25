import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { slugify, isCollegeEmail } from "@/lib/utils";
import { env } from "@/lib/env";
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

  return user;
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
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
