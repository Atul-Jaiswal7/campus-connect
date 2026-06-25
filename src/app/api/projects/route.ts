import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createProject, getProjects } from "@/services/project.service";
import { projectSchema } from "@/lib/validations";
import type { ProjectDomain, ProjectType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "12");
    const domain = searchParams.get("domain") as ProjectDomain | null;
    const type = searchParams.get("type") as ProjectType | null;
    const search = searchParams.get("search") ?? undefined;
    const trending = searchParams.get("trending") === "true";

    const result = await getProjects({
      domain: domain ?? undefined,
      type: type ?? undefined,
      search,
      trending,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GET /api/projects error:", error);
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
    const validated = projectSchema.parse(body);
    const project = await createProject(session.user.id, validated);

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
