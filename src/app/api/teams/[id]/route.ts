import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateApplicationStatus, updateTeamRecruitment, deleteTeamRecruitment } from "@/services/team.service";
import { teamRecruitmentSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recruitment = await prisma.teamRecruitment.findUnique({
      where: { id, deletedAt: null },
      include: {
        leader: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, avatarUrl: true, headline: true },
            },
          },
        },
        skills: { include: { skill: true } },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    headline: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        project: { select: { id: true, title: true } },
      },
    });

    if (!recruitment) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: recruitment });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: recruitmentId } = await params;
    const body = await req.json();

    const recruitment = await prisma.teamRecruitment.findUnique({
      where: { id: recruitmentId },
    });
    if (!recruitment || recruitment.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (body.applicationId) {
      const updated = await updateApplicationStatus(
        body.applicationId,
        session.user.id,
        body.status
      );
      return NextResponse.json({ success: true, data: updated });
    } else {
      const validated = teamRecruitmentSchema.partial().parse(body);
      const updated = await updateTeamRecruitment(recruitmentId, session.user.id, validated);
      return NextResponse.json({ success: true, data: updated });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteTeamRecruitment(id, session.user.id);
    return NextResponse.json({ success: true, message: "Recruitment deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete recruitment" },
      { status: 400 }
    );
  }
}
