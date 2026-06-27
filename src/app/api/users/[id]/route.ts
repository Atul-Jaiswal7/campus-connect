import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProfileByUserId } from "@/services/profile.service";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const profile = await getProfileByUserId(id, session?.user?.id);
    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
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
    const { id } = await params;

    if (!session?.user?.id || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      headline,
      bio,
      avatarUrl,
      coverUrl,
      department,
      year,
      hostel,
      rollNumber,
      phone,
      resumeUrl,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      leetcodeUrl,
      codeforcesUrl,
      openToWork,
      openToTeam,
      lookingForInternship,
      skills,
      experiences,
      educations,
    } = body;

    let filledFields = 0;
    const totalFields = 15;
    if (firstName) filledFields++;
    if (lastName) filledFields++;
    if (headline) filledFields++;
    if (bio) filledFields++;
    if (avatarUrl) filledFields++;
    if (coverUrl) filledFields++;
    if (department) filledFields++;
    if (year) filledFields++;
    if (hostel) filledFields++;
    if (resumeUrl) filledFields++;
    if (portfolioUrl) filledFields++;
    if (githubUrl) filledFields++;
    if (linkedinUrl) filledFields++;
    if (skills && skills.length > 0) filledFields++;
    if (experiences && experiences.length > 0) filledFields++;
    const profileCompletion = Math.round((filledFields / totalFields) * 100);

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: `${firstName} ${lastName}`,
          image: avatarUrl || undefined,
        },
      });

      const profile = await tx.profile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          firstName,
          lastName,
          headline,
          bio,
          avatarUrl,
          coverUrl,
          department,
          year: year ? parseInt(year) : null,
          hostel,
          rollNumber,
          phone,
          resumeUrl,
          portfolioUrl,
          githubUrl,
          linkedinUrl,
          leetcodeUrl,
          codeforcesUrl,
          openToWork: !!openToWork,
          openToTeam: !!openToTeam,
          lookingForInternship: !!lookingForInternship,
          profileCompletion,
        },
        update: {
          firstName,
          lastName,
          headline,
          bio,
          avatarUrl,
          coverUrl,
          department,
          year: year ? parseInt(year) : null,
          hostel,
          rollNumber,
          phone,
          resumeUrl,
          portfolioUrl,
          githubUrl,
          linkedinUrl,
          leetcodeUrl,
          codeforcesUrl,
          openToWork: !!openToWork,
          openToTeam: !!openToTeam,
          lookingForInternship: !!lookingForInternship,
          profileCompletion,
        },
      });

      if (skills) {
        await tx.userSkill.deleteMany({ where: { userId: id } });
        for (const skillName of skills) {
          const skill = await tx.skill.upsert({
            where: { name: skillName },
            create: { name: skillName },
            update: {},
          });
          await tx.userSkill.create({
            data: { userId: id, skillId: skill.id },
          });
        }
      }

      if (experiences) {
        await tx.experience.deleteMany({ where: { userId: id } });
        for (const exp of experiences) {
          await tx.experience.create({
            data: {
              userId: id,
              title: exp.title,
              company: exp.company,
              location: exp.location,
              description: exp.description,
              startDate: new Date(exp.startDate),
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              isCurrent: !!exp.isCurrent,
            },
          });
        }
      }

      if (educations) {
        await tx.education.deleteMany({ where: { userId: id } });
        for (const edu of educations) {
          await tx.education.create({
            data: {
              userId: id,
              institution: edu.institution,
              degree: edu.degree,
              field: edu.field,
              startDate: new Date(edu.startDate),
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              grade: edu.grade,
              description: edu.description,
            },
          });
        }
      }

      return profile;
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
