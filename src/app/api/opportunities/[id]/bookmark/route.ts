import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const existing = await prisma.opportunityBookmark.findUnique({
      where: { userId_opportunityId: { userId: session.user.id, opportunityId: id } },
    });

    if (existing) {
      await prisma.opportunityBookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, data: { bookmarked: false } });
    }

    await prisma.opportunityBookmark.create({
      data: { userId: session.user.id, opportunityId: id },
    });
    return NextResponse.json({ success: true, data: { bookmarked: true } });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
