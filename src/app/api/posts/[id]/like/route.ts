import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleLike } from "@/services/post.service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await toggleLike(id, session.user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST /api/posts/[id]/like error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
