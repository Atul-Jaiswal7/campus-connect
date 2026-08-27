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
      recentPosts,
      recentProjects,
      recentTeams,
      savedPosts,
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
      prisma.post.findMany({
        where: { authorId: userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          author: {
            select: {
              profile: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
        },
      }),
      prisma.project.findMany({
        where: { ownerId: userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.teamRecruitment.findMany({
        where: { leaderId: userId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.bookmark.findMany({
        where: { userId, postId: { not: null } },
        include: {
          post: {
            include: {
              author: {
                select: {
                  profile: {
                    select: { firstName: true, lastName: true, avatarUrl: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
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
        recentPosts,
        recentProjects,
        recentTeams,
        savedPosts: savedPosts.map((sb: (typeof savedPosts)[number]) => sb.post),
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
