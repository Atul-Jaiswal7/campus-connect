# Campus Connect

**A Local LinkedIn for College Students**

Campus Connect is a production-ready full-stack networking platform exclusively for college students. Build professional profiles, showcase projects, form teams, discover opportunities, and network within your campus ecosystem.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, Auth.js (NextAuth v5) |
| Database | PostgreSQL, Prisma ORM |
| Storage | Cloudinary |
| Real-time | Socket.IO |
| Validation | Zod, React Hook Form |
| State | TanStack Query |
| Deployment | Vercel |

## Features

- **Professional Student Profiles** — Photo, cover, bio, skills, education, certifications, resume, portfolio links
- **LinkedIn-style Feed** — Posts, images, likes, comments, shares, bookmarks, trending, infinite scroll
- **Team Formation** — Recruitment posts, applications, accept/reject/shortlist
- **Project Discovery** — Browse, filter, search, trending projects
- **Networking** — Connection requests, followers, mutual connections, suggestions
- **Real-time Messaging** — 1:1 chat, group chat, file sharing
- **Opportunities** — Internships, hackathons, workshops, contests
- **Skill Endorsements** — Endorse peers, recommendations
- **Search** — Students, projects, skills, clubs, events
- **Notifications** — Real-time alerts for all activities
- **Dashboard** — Analytics, profile views, streaks
- **Admin Panel** — User management, moderation, analytics
- **Dark Mode** — System-aware theme switching
- **AI Features** — Teammate recommendations, skill matching (extensible)

## Project Structure

```
campus-connect/
│
├── prisma/
│   ├── schema.prisma          # Full database schema (30+ models)
│   ├── seed.ts                # Demo data seeder
│   └── migrations/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── logo/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-email/
│   │   │   └── forgot-password/
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── feed/
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── projects/
│   │   │   ├── teams/
│   │   │   ├── opportunities/
│   │   │   ├── clubs/
│   │   │   ├── events/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   ├── network/
│   │   │   ├── search/
│   │   │   └── settings/
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── posts/
│   │   │   ├── clubs/
│   │   │   ├── events/
│   │   │   └── reports/
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── posts/
│   │   │   ├── projects/
│   │   │   ├── teams/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   ├── connections/
│   │   │   ├── opportunities/
│   │   │   ├── search/
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   │
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Navbar, DashboardLayout
│   │   ├── feed/              # PostCard, FeedList, CreatePostBox
│   │   ├── profile/
│   │   ├── projects/
│   │   ├── teams/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── admin/
│   │   ├── forms/
│   │   └── shared/
│   │
│   ├── hooks/
│   │   └── use-toast.ts
│   │
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── cloudinary.ts
│   │   ├── socket.ts
│   │   ├── env.ts
│   │   ├── utils.ts
│   │   ├── validations/
│   │   └── constants/
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── post.service.ts
│   │   ├── project.service.ts
│   │   ├── team.service.ts
│   │   ├── notification.service.ts
│   │   └── chat.service.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── middleware.ts
│   └── auth.ts
│
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) Cloudinary account for image uploads
- (Optional) Google OAuth credentials

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL (PostgreSQL connection string)
# - AUTH_SECRET (generate with: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (optional)
# - CLOUDINARY credentials (optional)

# Push database schema
npm run db:push

# Seed demo data
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123456 |
| Student | alex.kumar@college.edu | student123 |

## API Routes

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/[...nextauth]` | GET, POST | Auth.js handlers |
| `/api/auth/register` | POST | User registration |
| `/api/posts` | GET, POST | Feed posts |
| `/api/posts/[id]/like` | POST | Toggle like |
| `/api/posts/[id]/bookmark` | POST | Toggle bookmark |
| `/api/projects` | GET, POST | Project CRUD |
| `/api/teams` | GET, POST | Team recruitments |
| `/api/teams/[id]/apply` | POST | Apply to team |
| `/api/connections` | GET, POST | Networking |
| `/api/messages` | GET, POST | Messaging |
| `/api/notifications` | GET, PATCH | Notifications |
| `/api/opportunities` | GET, POST | Opportunities |
| `/api/search` | GET | Global search |
| `/api/dashboard` | GET | Dashboard stats |
| `/api/admin` | GET, PATCH | Admin operations |

## Database Schema

30+ Prisma models including: User, Profile, Skill, Project, Post, Comment, Like, Connection, Message, Conversation, Notification, Club, Event, Opportunity, TeamRecruitment, TeamApplication, and more.

Features: UUID IDs, soft deletes, cascade deletes, proper indexes, role-based enums.

## Roles

- **Student** — Default role, full platform access
- **Club Coordinator** — Club management
- **Faculty** — Campus oversight
- **Alumni** — Extended network
- **Admin** — Platform administration

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Connect PostgreSQL (Vercel Postgres, Neon, or Supabase)
5. Deploy

```bash
npm run build
```

## Resume Description

**Campus Connect – Local LinkedIn for College Students**
*Next.js, React.js, TypeScript, PostgreSQL, Auth.js, Tailwind CSS*

Developed a LinkedIn-inspired networking platform exclusively for students, enabling professional profiles, project showcasing, and campus networking. Implemented team formation and recruitment features where students can post projects, recruit teammates based on required skills, and manage applications. Built real-time messaging, project discovery, personalized feeds, search, notifications, and responsive dashboards to enhance student collaboration and engagement across campus.

## License

MIT
