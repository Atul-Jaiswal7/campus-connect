import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const type = searchParams.get("type") ?? "all";

    if (!q.trim()) {
      return NextResponse.json({ success: true, data: {} });
    }

    const results: Record<string, unknown> = {};

    if (type === "all" || type === "student") {
      results.students = await prisma.user.findMany({
        where: {
          isActive: true,
          profile: {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { department: { contains: q, mode: "insensitive" } },
            ],
          },
        },
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              headline: true,
              department: true,
              year: true,
            },
          },
        },
        take: 10,
      });
    }

    if (type === "all" || type === "project") {
      results.projects = await prisma.project.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { technologies: { has: q } },
          ],
        },
        include: {
          owner: {
            select: {
              profile: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
        },
        take: 10,
      });
    }

    if (type === "all" || type === "skill") {
      results.skills = await prisma.skill.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        include: { _count: { select: { userSkills: true } } },
        take: 10,
      });
    }

    if (type === "all" || type === "club") {
      results.clubs = await prisma.club.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: "insensitive" },
        },
        take: 10,
      });
    }

    if (type === "all" || type === "opportunity") {
      results.opportunities = await prisma.opportunity.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { company: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 10,
      });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
