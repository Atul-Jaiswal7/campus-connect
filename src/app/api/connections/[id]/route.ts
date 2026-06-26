import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { respondToConnection } from "@/services/connection.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action !== "ACCEPTED" && action !== "REJECTED") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const connection = await respondToConnection(id, session.user.id, action);
    return NextResponse.json({ success: true, data: connection });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
