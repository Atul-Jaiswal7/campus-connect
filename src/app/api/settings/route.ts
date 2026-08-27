import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCollegeEmail } from "@/lib/utils";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        emailNotifications: true,
        matchSuggestions: true,
        profilePublic: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { emailNotifications, matchSuggestions, profilePublic, name, email } = body;

    if (email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
        matchSuggestions: matchSuggestions !== undefined ? matchSuggestions : undefined,
        profilePublic: profilePublic !== undefined ? profilePublic : undefined,
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        ...(email !== undefined
          ? { isVerified: isCollegeEmail(email, env.COLLEGE_EMAIL_DOMAIN) }
          : {}),
      },
    });

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("PATCH /api/settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }

    // Soft delete user account
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { 
          isActive: false,
          deletedAt: new Date(),
          email: `deleted_${user.id}@campus.local`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/settings error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
