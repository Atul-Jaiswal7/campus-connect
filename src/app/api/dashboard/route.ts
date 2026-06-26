import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const [
      profileViews,
      connections,
      teamInvitations,
      appliedProjects,
      savedOpportunities,
      unreadMessages,
      unreadNotifications,
      profile,
    ] = await Promise.all([
      prisma.profileView.count({ where: { profileId: userId } }),
      prisma.connection.count({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: userId }, { receiverId: userId }],
        },
      }),
      prisma.teamApplication.count({
        where: {
          applicantId: userId,
          status: "PENDING",
        },
      }),
      prisma.teamApplication.count({ where: { applicantId: userId } }),
      prisma.opportunityBookmark.count({ where: { userId } }),
      prisma.notification.count({
        where: { userId, type: "MESSAGE", isRead: false },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.profile.findUnique({ where: { userId } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        profileViews,
        connections,
        teamInvitations,
        appliedProjects,
        savedOpportunities,
        unreadMessages,
        unreadNotifications,
        profileCompletion: profile?.profileCompletion ?? 0,
        streakDays: profile?.streakDays ?? 0,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
