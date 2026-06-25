import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    department: z.string().min(1, "Department is required"),
    year: z.coerce.number().min(1).max(5),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  headline: z.string().max(120).optional(),
  bio: z.string().max(2000).optional(),
  department: z.string().optional(),
  year: z.coerce.number().min(1).max(5).optional(),
  hostel: z.string().optional(),
  rollNumber: z.string().optional(),
  phone: z.string().optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  leetcodeUrl: z.string().url().optional().or(z.literal("")),
  codeforcesUrl: z.string().url().optional().or(z.literal("")),
  openToWork: z.boolean().optional(),
  openToTeam: z.boolean().optional(),
  lookingForInternship: z.boolean().optional(),
});

export const postSchema = z.object({
  content: z.string().min(1, "Post content is required").max(5000),
  type: z.enum([
    "TEXT",
    "IMAGE",
    "VIDEO",
    "PROJECT_UPDATE",
    "INTERNSHIP",
    "PLACEMENT",
    "EVENT",
    "POLL",
    "ANNOUNCEMENT",
  ]),
  visibility: z.enum(["PUBLIC", "CONNECTIONS", "CAMPUS"]).default("PUBLIC"),
  imageUrls: z.array(z.string().url()).optional(),
  githubUrl: z.string().url().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  parentId: z.string().uuid().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  domain: z.enum([
    "AI",
    "WEB",
    "MOBILE",
    "BLOCKCHAIN",
    "ML",
    "IOT",
    "ROBOTICS",
    "DATA_SCIENCE",
    "CYBERSECURITY",
    "OTHER",
  ]),
  type: z.enum(["COLLEGE", "OPEN_SOURCE", "STARTUP", "HACKATHON", "RESEARCH"]),
  technologies: z.array(z.string()).min(1),
  demoUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

export const teamRecruitmentSchema = z.object({
  title: z.string().min(3).max(100),
  problemStatement: z.string().min(20).max(3000),
  teamSize: z.coerce.number().min(2).max(20),
  workload: z.string().optional(),
  duration: z.string().optional(),
  hackathonName: z.string().optional(),
  deadline: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),
  roles: z
    .array(
      z.object({
        roleNeeded: z.string().min(2),
        skillName: z.string().min(2),
      })
    )
    .min(1),
});

export const teamApplicationSchema = z.object({
  introduction: z.string().min(20).max(2000),
  resumeUrl: z.string().url().optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
});

export const opportunitySchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(20).max(5000),
  type: z.enum([
    "INTERNSHIP",
    "JOB",
    "HACKATHON",
    "WORKSHOP",
    "CODING_CONTEST",
    "RESEARCH",
    "CLUB_RECRUITMENT",
  ]),
  company: z.string().optional(),
  location: z.string().optional(),
  stipend: z.string().optional(),
  deadline: z.string().datetime().optional(),
  applyUrl: z.string().url().optional(),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(100),
  type: z
    .enum(["all", "student", "project", "skill", "club", "event", "opportunity"])
    .default("all"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type PostInput = z.infer<typeof postSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TeamRecruitmentInput = z.infer<typeof teamRecruitmentSchema>;
