import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserConversations, sendMessage } from "@/services/chat.service";
import { messageSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await getUserConversations(session.user.id);
    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, ...messageData } = body;
    const validated = messageSchema.parse(messageData);

    const message = await sendMessage(
      conversationId,
      session.user.id,
      validated.content,
      validated.fileUrl,
      validated.fileName
    );

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 400 }
    );
  }
}
