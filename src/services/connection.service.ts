import { prisma } from "@/lib/prisma";

export async function sendConnectionRequest(
  requesterId: string,
  receiverId: string,
  message?: string
) {
  if (requesterId === receiverId) throw new Error("Cannot connect with yourself");

  const existing = await prisma.connection.findFirst({
    where: {
      OR: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    },
  });

  if (existing) throw new Error("Connection already exists");

  const connection = await prisma.connection.create({
    data: { requesterId, receiverId, message },
  });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      actorId: requesterId,
      type: "CONNECTION_REQUEST",
      title: "New Connection Request",
      message: "Someone wants to connect with you",
      link: "/network",
    },
  });

  return connection;
}

export async function respondToConnection(
  connectionId: string,
  userId: string,
  action: "ACCEPTED" | "REJECTED"
) {
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection || connection.receiverId !== userId) {
    throw new Error("Unauthorized");
  }

  if (connection.status !== "PENDING") {
    throw new Error("Connection already responded to");
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: action },
  });

  if (action === "ACCEPTED") {
    await prisma.notification.create({
      data: {
        userId: connection.requesterId,
        actorId: userId,
        type: "CONNECTION_ACCEPTED",
        title: "Connection Accepted",
        message: "Your connection request was accepted",
        link: `/profile/${userId}`,
      },
    });
  }

  return updated;
}
