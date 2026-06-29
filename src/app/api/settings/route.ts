import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { emailNotifications, matchSuggestions, profilePublic } = body;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: emailNotifications !== undefined ? emailNotifications : undefined,
        matchSuggestions: matchSuggestions !== undefined ? matchSuggestions : undefined,
        profilePublic: profilePublic !== undefined ? profilePublic : undefined,
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

    // Verify password (simplified - in production use proper password verification)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
