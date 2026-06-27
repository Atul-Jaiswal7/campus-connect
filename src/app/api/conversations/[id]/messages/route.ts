import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMessages, sendMessage } from "@/services/chat.service";
import { messageSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
    });
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");

    const result = await getMessages(id, page);
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const member = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: session.user.id } },
    });
    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validated = messageSchema.parse(body);
    const message = await sendMessage(
      id,
      session.user.id,
      validated.content,
      validated.fileUrl,
      validated.fileName
    );

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 400 }
    );
  }
}
