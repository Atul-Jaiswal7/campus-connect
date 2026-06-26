import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfileByUserId } from "@/services/profile.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const profile = await getProfileByUserId(id, session?.user?.id);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
