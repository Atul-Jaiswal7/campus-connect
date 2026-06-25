import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("admin123456", 12);
  const studentPassword = await bcrypt.hash("student123", 12);

  await prisma.user.upsert({
    where: { email: "admin@college.edu" },
    update: {},
    create: {
      email: "admin@college.edu",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
      profile: {
        create: {
          firstName: "Admin",
          lastName: "User",
          headline: "Platform Administrator",
          department: "Administration",
          profileSlug: "admin-user",
          profileCompletion: 100,
        },
      },
    },
  });

  const students = [
    {
      email: "alex.kumar@college.edu",
      firstName: "Alex",
      lastName: "Kumar",
      department: "Computer Science",
      year: 3,
      headline: "Full Stack Developer | React Enthusiast",
    },
    {
      email: "priya.sharma@college.edu",
      firstName: "Priya",
      lastName: "Sharma",
      department: "Information Technology",
      year: 2,
      headline: "UI/UX Designer | Creative Thinker",
    },
    {
      email: "rahul.patel@college.edu",
      firstName: "Rahul",
      lastName: "Patel",
      department: "Electronics & Communication",
      year: 4,
      headline: "ML Engineer | Research Intern",
    },
  ];

  for (const s of students) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        name: `${s.firstName} ${s.lastName}`,
        password: studentPassword,
        role: "STUDENT",
        isVerified: true,
        profile: {
          create: {
            firstName: s.firstName,
            lastName: s.lastName,
            headline: s.headline,
            department: s.department,
            year: s.year,
            bio: `${s.firstName} is a passionate student at the college.`,
            openToTeam: true,
            profileSlug: `${s.firstName.toLowerCase()}-${s.lastName.toLowerCase()}`,
            profileCompletion: 70,
          },
        },
      },
    });
  }

  const skills = [
    "React", "Node.js", "Python", "TypeScript", "Machine Learning",
    "UI Design", "Docker", "PostgreSQL", "Next.js", "TensorFlow",
  ];

  for (const skillName of skills) {
    await prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName, category: "Programming" },
    });
  }

  const alex = await prisma.user.findUnique({
    where: { email: "alex.kumar@college.edu" },
  });

  if (alex) {
    await prisma.post.create({
      data: {
        authorId: alex.id,
        content:
          "Just deployed our hackathon project! Built a real-time collaboration tool using #react and #nodejs. Looking for teammates for the next hackathon! #hackathon2024",
        type: "PROJECT_UPDATE",
        hashtags: ["react", "nodejs", "hackathon2024"],
        isTrending: true,
        likeCount: 15,
        commentCount: 5,
      },
    });

    await prisma.project.create({
      data: {
        ownerId: alex.id,
        title: "Campus Navigator App",
        description:
          "A mobile app helping students navigate campus buildings, find classrooms, and discover events in real-time.",
        domain: "MOBILE",
        type: "COLLEGE",
        technologies: ["React Native", "Firebase", "Maps API"],
        githubUrl: "https://github.com/example/campus-navigator",
        isTrending: true,
        likeCount: 42,
        members: { create: { userId: alex.id, role: "Owner" } },
      },
    });
  }

  await prisma.club.upsert({
    where: { name: "Developer Club" },
    update: {},
    create: {
      name: "Developer Club",
      description: "Official coding and development club of the college.",
      category: "Technical",
    },
  });

  await prisma.opportunity.create({
    data: {
      title: "Summer Internship - Full Stack Developer",
      description:
        "Join our engineering team for a 3-month summer internship. Work on real products using React and Node.js.",
      type: "INTERNSHIP",
      company: "TechCorp India",
      location: "Bangalore",
      stipend: "₹25,000/month",
      deadline: new Date("2026-08-01"),
    },
  });

  console.log("Seed completed!");
  console.log("Admin: admin@college.edu / admin123456");
  console.log("Student: alex.kumar@college.edu / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
