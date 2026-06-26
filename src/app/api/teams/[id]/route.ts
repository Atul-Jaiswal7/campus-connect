import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateApplicationStatus } from "@/services/team.service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recruitment = await prisma.teamRecruitment.findUnique({
      where: { id },
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
    const { applicationId, status } = await req.json();

    const recruitment = await prisma.teamRecruitment.findUnique({
      where: { id: recruitmentId },
    });
    if (!recruitment || recruitment.leaderId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await updateApplicationStatus(
      applicationId,
      session.user.id,
      status
    );
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
