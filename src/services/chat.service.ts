import { prisma } from "@/lib/prisma";

export async function getOrCreateDirectConversation(
  userId1: string,
  userId2: string
) {
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      members: {
        every: {
          userId: { in: [userId1, userId2] },
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (existing && existing.members.length === 2) return existing;

  return prisma.conversation.create({
    data: {
      type: "DIRECT",
      members: {
        create: [{ userId: userId1 }, { userId: userId2 }],
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
      messages: true,
    },
  });
}

export async function getUserConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  fileUrl?: string,
  fileName?: string
) {
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
        fileUrl,
        fileName,
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  const members = await prisma.conversationMember.findMany({
    where: { conversationId, userId: { not: senderId } },
  });

  await Promise.all(
    members.map((member) =>
      prisma.notification.create({
        data: {
          userId: member.userId,
          actorId: senderId,
          type: "MESSAGE",
          title: "New Message",
          message: content.slice(0, 100),
          link: `/messages?conversation=${conversationId}`,
        },
      })
    )
  );

  return message;
}

export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 50
) {
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId, deletedAt: null },
      include: {
        sender: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { conversationId, deletedAt: null } }),
  ]);

  return {
    data: messages.reverse(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
}
