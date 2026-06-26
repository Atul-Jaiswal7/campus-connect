import { prisma } from "@/lib/prisma";

export async function getProfileByUserId(userId: string, viewerId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true },
    include: {
      profile: true,
      skills: { include: { skill: true } },
      ownedProjects: {
        where: { deletedAt: null },
        take: 6,
        orderBy: { createdAt: "desc" },
      },
      experiences: { orderBy: { startDate: "desc" }, take: 5 },
      educations: { orderBy: { startDate: "desc" } },
      certifications: { orderBy: { issueDate: "desc" }, take: 5 },
      achievements: { orderBy: { date: "desc" }, take: 5 },
      _count: {
        select: {
          sentConnections: { where: { status: "ACCEPTED" } },
          receivedConnections: { where: { status: "ACCEPTED" } },
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) return null;

  if (viewerId && viewerId !== userId) {
    await prisma.profileView.upsert({
      where: { viewerId_profileId: { viewerId, profileId: userId } },
      create: { viewerId, profileId: userId },
      update: { viewedAt: new Date() },
    });
  }

  let connectionStatus: string | null = null;
  let isFollowing = false;

  if (viewerId && viewerId !== userId) {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: viewerId, receiverId: userId },
          { requesterId: userId, receiverId: viewerId },
        ],
      },
    });
    connectionStatus = connection?.status ?? null;

    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: viewerId, followingId: userId } },
    });
    isFollowing = !!follow;
  }

  const connectionCount =
    user._count.sentConnections + user._count.receivedConnections;

  return {
    ...user,
    connectionCount,
    connectionStatus,
    isFollowing,
    isOwnProfile: viewerId === userId,
  };
}

export async function getSuggestedUsers(userId: string, limit = 5) {
  const myProfile = await prisma.profile.findUnique({ where: { userId } });

  const connectedIds = await prisma.connection.findMany({
    where: {
      status: { in: ["PENDING", "ACCEPTED"] },
      OR: [{ requesterId: userId }, { receiverId: userId }],
    },
    select: { requesterId: true, receiverId: true },
  });

  const excludeIds = new Set<string>([userId]);
  connectedIds.forEach((c) => {
    excludeIds.add(c.requesterId);
    excludeIds.add(c.receiverId);
  });

  return prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludeIds) },
      isActive: true,
      profile: myProfile?.department
        ? { department: myProfile.department }
        : { isNot: null },
    },
    include: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
          headline: true,
          department: true,
          year: true,
        },
      },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
