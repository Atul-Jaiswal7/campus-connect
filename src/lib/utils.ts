import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString();
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateProfileCompletion(profile: {
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  headline?: string | null;
  department?: string | null;
  year?: number | null;
  resumeUrl?: string | null;
  githubUrl?: string | null;
  skillsCount?: number;
  projectsCount?: number;
}): number {
  const fields = [
    !!profile.avatarUrl,
    !!profile.coverUrl,
    !!profile.bio,
    !!profile.headline,
    !!profile.department,
    !!profile.year,
    !!profile.resumeUrl,
    !!profile.githubUrl,
    (profile.skillsCount ?? 0) >= 3,
    (profile.projectsCount ?? 0) >= 1,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export function extractHashtags(content: string): string[] {
  const matches = content.match(/#[\w]+/g);
  return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
}

export function isCollegeEmail(email: string, domain?: string): boolean {
  if (!domain) return true;
  return email.toLowerCase().endsWith(`@${domain.toLowerCase()}`);
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: items.slice(start, end),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
      hasMore: end < items.length,
    },
  };
}
