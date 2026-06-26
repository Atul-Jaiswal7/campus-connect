import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSuggestedUsers } from "@/services/profile.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await getSuggestedUsers(session.user.id);
    return NextResponse.json({ success: true, data: users });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
