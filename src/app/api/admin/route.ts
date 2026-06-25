import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalUsers, verifiedUsers, totalPosts, pendingReports, totalClubs] =
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.post.count({ where: { deletedAt: null } }),
        prisma.report.count({ where: { status: "PENDING" } }),
        prisma.club.count({ where: { isActive: true } }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        totalPosts,
        pendingReports,
        totalClubs,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (action === "verify") {
      await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "VERIFY_USER",
          entity: "User",
          entityId: userId,
        },
      });
    }

    if (action === "deactivate") {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DEACTIVATE_USER",
          entity: "User",
          entityId: userId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
