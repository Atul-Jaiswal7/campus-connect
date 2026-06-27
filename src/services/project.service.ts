import { prisma } from "@/lib/prisma";
import type { ProjectInput } from "@/lib/validations";
import type { ProjectDomain, ProjectType } from "@prisma/client";

export async function createProject(ownerId: string, data: ProjectInput) {
  return prisma.project.create({
    data: {
      ownerId,
      title: data.title,
      description: data.description,
      domain: data.domain,
      type: data.type,
      technologies: data.technologies,
      demoUrl: data.demoUrl || null,
      githubUrl: data.githubUrl || null,
      status: data.status,
      imageUrls: data.imageUrls || [],
      members: {
        create: { userId: ownerId, role: "Owner" },
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          profile: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function getProjects(filters: {
  domain?: ProjectDomain;
  type?: ProjectType;
  search?: string;
  trending?: boolean;
  page?: number;
  limit?: number;
}) {
  const { domain, type, search, trending, page = 1, limit = 12 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(domain && { domain }),
    ...(type && { type }),
    ...(trending && { isTrending: true }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { technologies: { has: search } },
      ],
    }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        _count: { select: { members: true } },
      },
      orderBy: trending
        ? [{ likeCount: "desc" }, { viewCount: "desc" }]
        : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
}

export async function getProjectById(id: string) {
  await prisma.project.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });

  return prisma.project.findUnique({
    where: { id },
    include: {
      owner: {
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
      members: {
        include: {
          user: {
            select: {
              id: true,
              profile: {
                select: { firstName: true, lastName: true, avatarUrl: true },
              },
            },
          },
        },
      },
      recruitments: {
        where: { isActive: true },
        include: {
          skills: { include: { skill: true } },
        },
      },
    },
  });
}

export async function updateProject(projectId: string, userId: string, data: Partial<ProjectInput>) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");
  if (project.ownerId !== userId) throw new Error("Unauthorized to edit this project");

  return prisma.project.update({
    where: { id: projectId },
    data: {
      title: data.title,
      description: data.description,
      domain: data.domain,
      type: data.type,
      technologies: data.technologies,
      demoUrl: data.demoUrl || null,
      githubUrl: data.githubUrl || null,
      status: data.status,
      imageUrls: data.imageUrls,
    },
    include: {
      owner: {
        select: {
          id: true,
          profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error("Project not found");
  if (project.ownerId !== userId) throw new Error("Unauthorized to delete this project");

  return prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });
}
