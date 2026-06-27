import { prisma } from "@/lib/prisma";
import type { TeamRecruitmentInput } from "@/lib/validations";

export async function createTeamRecruitment(
  leaderId: string,
  data: TeamRecruitmentInput
) {
  const skillRecords = await Promise.all(
    data.roles.map(async (role) => {
      const skill = await prisma.skill.upsert({
        where: { name: role.skillName },
        create: { name: role.skillName },
        update: {},
      });
      return { skillId: skill.id, roleNeeded: role.roleNeeded };
    })
  );

  return prisma.teamRecruitment.create({
    data: {
      leaderId,
      projectId: data.projectId,
      title: data.title,
      problemStatement: data.problemStatement,
      teamSize: data.teamSize,
      workload: data.workload,
      duration: data.duration,
      hackathonName: data.hackathonName,
      deadline: data.deadline ? new Date(data.deadline) : null,
      skills: {
        create: skillRecords,
      },
    },
    include: {
      leader: {
        select: {
          id: true,
          profile: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
        },
      },
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
  });
}

export async function getTeamRecruitments(filters: {
  active?: boolean;
  page?: number;
  limit?: number;
}) {
  const { active = true, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(active && { isActive: true }),
  };

  const [recruitments, total] = await Promise.all([
    prisma.teamRecruitment.findMany({
      where,
      include: {
        leader: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.teamRecruitment.count({ where }),
  ]);

  return {
    data: recruitments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
}

export async function applyToTeam(
  recruitmentId: string,
  applicantId: string,
  introduction: string,
  resumeUrl?: string
) {
  const recruitment = await prisma.teamRecruitment.findUnique({
    where: { id: recruitmentId },
  });

  if (!recruitment?.isActive) throw new Error("Recruitment is not active");
  if (recruitment.leaderId === applicantId)
    throw new Error("Cannot apply to your own recruitment");

  const application = await prisma.teamApplication.create({
    data: { recruitmentId, applicantId, introduction, resumeUrl },
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
  });

  await prisma.notification.create({
    data: {
      userId: recruitment.leaderId,
      actorId: applicantId,
      type: "TEAM_APPLICATION",
      title: "New Team Application",
      message: "Someone applied to your team recruitment",
      link: `/teams/${recruitmentId}`,
    },
  });

  return application;
}

export async function updateApplicationStatus(
  applicationId: string,
  leaderId: string,
  status: "SHORTLISTED" | "ACCEPTED" | "REJECTED"
) {
  const application = await prisma.teamApplication.findUnique({
    where: { id: applicationId },
    include: { recruitment: true },
  });

  if (!application || application.recruitment.leaderId !== leaderId) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.teamApplication.update({
    where: { id: applicationId },
    data: { status },
  });

  if (status === "ACCEPTED") {
    await prisma.teamRecruitment.update({
      where: { id: application.recruitmentId },
      data: { currentMembers: { increment: 1 } },
    });

    if (application.recruitment.projectId) {
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: {
            projectId: application.recruitment.projectId,
            userId: application.applicantId,
          },
        },
        create: {
          projectId: application.recruitment.projectId,
          userId: application.applicantId,
          role: "Member",
        },
        update: {},
      });
    }
  }

  await prisma.notification.create({
    data: {
      userId: application.applicantId,
      actorId: leaderId,
      type: status === "ACCEPTED" ? "APPLICATION_ACCEPTED" : "APPLICATION_REJECTED",
      title: `Application ${status.toLowerCase()}`,
      message: `Your team application has been ${status.toLowerCase()}`,
      link: `/teams/${application.recruitmentId}`,
    },
  });

  return updated;
}

export async function updateTeamRecruitment(
  recruitmentId: string,
  leaderId: string,
  data: Partial<TeamRecruitmentInput>
) {
  const recruitment = await prisma.teamRecruitment.findUnique({
    where: { id: recruitmentId },
  });

  if (!recruitment) throw new Error("Recruitment posting not found");
  if (recruitment.leaderId !== leaderId) throw new Error("Unauthorized");

  if (data.roles) {
    const skillRecords = await Promise.all(
      data.roles.map(async (role) => {
        const skill = await prisma.skill.upsert({
          where: { name: role.skillName },
          create: { name: role.skillName },
          update: {},
        });
        return { skillId: skill.id, roleNeeded: role.roleNeeded };
      })
    );

    return prisma.$transaction(async (tx) => {
      await tx.teamRecruitmentSkill.deleteMany({
        where: { recruitmentId },
      });

      return tx.teamRecruitment.update({
        where: { id: recruitmentId },
        data: {
          projectId: data.projectId,
          title: data.title,
          problemStatement: data.problemStatement,
          teamSize: data.teamSize,
          workload: data.workload,
          duration: data.duration,
          hackathonName: data.hackathonName,
          deadline: data.deadline ? new Date(data.deadline) : null,
          skills: {
            create: skillRecords,
          },
        },
        include: {
          skills: { include: { skill: true } },
        },
      });
    });
  }

  return prisma.teamRecruitment.update({
    where: { id: recruitmentId },
    data: {
      projectId: data.projectId,
      title: data.title,
      problemStatement: data.problemStatement,
      teamSize: data.teamSize,
      workload: data.workload,
      duration: data.duration,
      hackathonName: data.hackathonName,
      deadline: data.deadline ? new Date(data.deadline) : null,
    },
    include: {
      skills: { include: { skill: true } },
    },
  });
}

export async function deleteTeamRecruitment(recruitmentId: string, leaderId: string) {
  const recruitment = await prisma.teamRecruitment.findUnique({
    where: { id: recruitmentId },
  });

  if (!recruitment) throw new Error("Recruitment posting not found");
  if (recruitment.leaderId !== leaderId) throw new Error("Unauthorized");

  return prisma.teamRecruitment.update({
    where: { id: recruitmentId },
    data: { deletedAt: new Date() },
  });
}
