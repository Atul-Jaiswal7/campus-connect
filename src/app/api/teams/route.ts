import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTeamRecruitment, getTeamRecruitments } from "@/services/team.service";
import { teamRecruitmentSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const result = await getTeamRecruitments({ page, limit });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GET /api/teams error:", error);
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
    const validated = teamRecruitmentSchema.parse(body);
    const recruitment = await createTeamRecruitment(session.user.id, validated);

    return NextResponse.json({ success: true, data: recruitment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
