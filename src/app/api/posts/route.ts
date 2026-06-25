import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPost, getFeedPosts } from "@/services/post.service";
import { postSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");
    const trending = searchParams.get("trending") === "true";

    const result = await getFeedPosts(session.user.id, page, limit, trending);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GET /api/posts error:", error);
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
    const validated = postSchema.parse(body);
    const post = await createPost(session.user.id, validated);

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
