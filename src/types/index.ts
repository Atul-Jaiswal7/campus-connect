import type {
  Role,
  PostType,
  ProjectDomain,
  ProjectType,
  OpportunityType,
  ApplicationStatus,
  ConnectionStatus,
  NotificationType,
} from "@prisma/client";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UserWithProfile {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    headline: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    department: string | null;
    year: number | null;
    bio: string | null;
    openToWork: boolean;
    openToTeam: boolean;
    profileCompletion: number;
    profileSlug: string | null;
  } | null;
}

export interface PostWithAuthor {
  id: string;
  content: string;
  type: PostType;
  imageUrls: string[];
  hashtags: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isTrending: boolean;
  createdAt: Date;
  author: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      headline: string | null;
    } | null;
  };
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface ProjectWithOwner {
  id: string;
  title: string;
  description: string;
  domain: ProjectDomain;
  type: ProjectType;
  technologies: string[];
  imageUrls: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  likeCount: number;
  viewCount: number;
  isTrending: boolean;
  createdAt: Date;
  owner: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  };
}

export interface TeamRecruitmentWithDetails {
  id: string;
  title: string;
  problemStatement: string;
  teamSize: number;
  currentMembers: number;
  workload: string | null;
  duration: string | null;
  hackathonName: string | null;
  deadline: Date | null;
  isActive: boolean;
  createdAt: Date;
  leader: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  };
  skills: Array<{
    roleNeeded: string;
    skill: { name: string };
  }>;
  _count?: { applications: number };
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
  actor: {
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  } | null;
}

export interface DashboardStats {
  profileViews: number;
  connections: number;
  teamInvitations: number;
  appliedProjects: number;
  savedOpportunities: number;
  unreadMessages: number;
  unreadNotifications: number;
  profileCompletion: number;
  streakDays: number;
}

export interface SearchResult {
  students: UserWithProfile[];
  projects: ProjectWithOwner[];
  skills: { id: string; name: string; userCount: number }[];
  clubs: { id: string; name: string; logoUrl: string | null }[];
  events: { id: string; title: string; startDate: Date }[];
  opportunities: { id: string; title: string; type: OpportunityType }[];
}

export type { Role, ConnectionStatus, ApplicationStatus, OpportunityType };
