import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applyToTeam } from "@/services/team.service";
import { teamApplicationSchema } from "@/lib/validations";

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
    const body = await req.json();
    const validated = teamApplicationSchema.parse(body);

    const application = await applyToTeam(
      id,
      session.user.id,
      validated.introduction,
      validated.resumeUrl
    );

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams/[id]/apply error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Application failed" },
      { status: 400 }
    );
  }
}
