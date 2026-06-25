export const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Business Administration",
  "Other",
] as const;

export const YEARS = [1, 2, 3, 4, 5] as const;

export const SKILL_CATEGORIES = [
  "Programming",
  "Framework",
  "Database",
  "DevOps",
  "Design",
  "Soft Skills",
  "Other",
] as const;

export const PROJECT_DOMAINS = [
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
] as const;

export const POST_TYPES = [
  { value: "TEXT", label: "Text Post" },
  { value: "IMAGE", label: "Image Post" },
  { value: "PROJECT_UPDATE", label: "Project Update" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "PLACEMENT", label: "Placement Experience" },
  { value: "EVENT", label: "Event Announcement" },
  { value: "POLL", label: "Poll" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
] as const;

export const OPPORTUNITY_TYPES = [
  { value: "INTERNSHIP", label: "Internships" },
  { value: "JOB", label: "Jobs" },
  { value: "HACKATHON", label: "Hackathons" },
  { value: "WORKSHOP", label: "Workshops" },
  { value: "CODING_CONTEST", label: "Coding Contests" },
  { value: "RESEARCH", label: "Research" },
  { value: "CLUB_RECRUITMENT", label: "Club Recruitment" },
] as const;

export const NAV_ITEMS = [
  { href: "/feed", label: "Feed", icon: "Home" },
  { href: "/network", label: "My Network", icon: "Users" },
  { href: "/projects", label: "Projects", icon: "FolderKanban" },
  { href: "/teams", label: "Teams", icon: "UsersRound" },
  { href: "/opportunities", label: "Opportunities", icon: "Briefcase" },
  { href: "/messages", label: "Messages", icon: "MessageSquare" },
  { href: "/notifications", label: "Notifications", icon: "Bell" },
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/users", label: "Users", icon: "Users" },
  { href: "/admin/posts", label: "Posts", icon: "FileText" },
  { href: "/admin/clubs", label: "Clubs", icon: "Building2" },
  { href: "/admin/events", label: "Events", icon: "Calendar" },
  { href: "/admin/reports", label: "Reports", icon: "Flag" },
] as const;
