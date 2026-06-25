import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, message } = await req.json();

    if (receiverId === session.user.id) {
      return NextResponse.json({ error: "Cannot connect with yourself" }, { status: 400 });
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, receiverId },
          { requesterId: receiverId, receiverId: session.user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Connection already exists" }, { status: 400 });
    }

    const connection = await prisma.connection.create({
      data: {
        requesterId: session.user.id,
        receiverId,
        message,
      },
    });

    await prisma.notification.create({
      data: {
        userId: receiverId,
        actorId: session.user.id,
        type: "CONNECTION_REQUEST",
        title: "New Connection Request",
        message: "Someone wants to connect with you",
        link: "/network",
      },
    });

    return NextResponse.json({ success: true, data: connection }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: session.user.id }, { receiverId: session.user.id }],
      },
      include: {
        requester: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                headline: true,
                department: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
                headline: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: connections });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
