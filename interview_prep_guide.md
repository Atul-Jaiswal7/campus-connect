# Campus Connect — Technical Interview Preparation Guide

This guide compiles potential technical and architectural interview questions based on the **Campus Connect** project. It is structured into conceptual sections: Project Overview, Frontend Architecture, Backend & System Design, Database Design, Real-time & Security, and Scale & Edge Cases.

---

## 1. Project & Architecture Overview

### Q1. Can you explain the elevator pitch of Campus Connect?
**Answer:**  
Campus Connect is a local, private networking platform built specifically for college ecosystems—essentially a "Local LinkedIn." It allows students to showcase projects, form teams for hackathons or startups, discover internships, participate in student club events, and chat in real-time. By verification-gating access to college email domains (e.g., `@college.edu`), we keep the community trusted, secure, and focused on peer-to-peer academic and professional collaboration.

### Q2. Walk me through the technology stack and the rationale behind your choices.
**Answer:**  
- **Frontend**: Next.js 15 (App Router) and React 19 for SEO, Server-Side Rendering (SSR) of profile pages, and static bundling of assets. Styling uses Tailwind CSS and shadcn/ui for consistent, responsive design.
- **State Management**: TanStack Query (React Query) handles async server-state caching, automatic refetching, and optimistic updates.
- **Backend & APIs**: Next.js API Routes. Auth.js (NextAuth.js v5) provides robust JWT-based session security.
- **Database**: PostgreSQL with Prisma ORM. A relational database is optimal because a professional network is built on dense relationships (e.g., followers, connections, memberships) which require foreign keys, transactional integrity, and complex join queries.
- **Real-time**: Socket.IO handles live chats, typing indicators, and immediate notification alerts.
- **Storage**: Cloudinary hosts, optimizes, and serves user-uploaded media (photos/videos).

---

## 2. Frontend Architecture (Next.js 15 & React 19)

### Q3. Next.js 15 introduces React Server Components (RSC). How did you divide your components into Server vs. Client Components?
**Answer:**  
- **Server Components (RSC)**: Used by default for layouts (Navbar, Sidebars), index page shells, and public profile views. Rationale: Rendering database queries directly on the server reduces the JS bundle sent to the client, increases loading performance, and improves SEO.
- **Client Components** (using the `"use client"` directive): Used for interactive parts of the application. Examples include the like/comment toggle buttons, feed creation boxes, chat rooms, and search inputs. These components rely on browser APIs, React hooks (`useState`, `useEffect`), or dynamic state bindings.

### Q4. Why did you use TanStack Query instead of global state systems like Redux or Zustand?
**Answer:**  
Almost all the state in Campus Connect is **Server State** (data fetched from a remote server, like posts, messages, or connections). Using Redux or Context to mirror this data in client state causes massive synchronization boilerplate. TanStack Query automates:
1. **Caching & Revalidation**: Prevents redundant API requests when switching tabs.
2. **Infinite Scroll**: Utilizes `useInfiniteQuery` to handle cursor-based pagination for the feed cleanly.
3. **Optimistic Updates**: Immediately increments the "Like" count on the UI before the API call finishes, making the platform feel instantaneous.

---

## 3. Database Schema & Query Optimization (PostgreSQL & Prisma)

### Q5. Why did you choose a Relational DB (PostgreSQL) instead of a Document DB (MongoDB)?
**Answer:**  
Campus Connect is a social network, which is fundamentally a graph of relationships:
- A `User` has one `Profile`.
- A `User` has many `Post`s, `Comment`s, and `Like`s.
- `Connection` is a join table linking a requester and a receiver.
- `ProjectMember` maps users to projects.

In a Document DB like MongoDB, these relationships must either be denormalized (causing data duplication and inconsistency when a user updates their profile) or manually joined in application memory (which is slow and lacks integrity). PostgreSQL maintains strict relational integrity through foreign keys, cascades, and constraints. Using Prisma ORM guarantees strict type safety on these relations.

### Q6. How did you design the self-referential relations? Can you write out the Prisma model relationships for Followers and Connection Requests?
**Answer:**  
For **Connections** (bidirectional connections), we use two self-referential relations on the `User` model, bridging through a join table:
```prisma
model User {
  id                  String       @id @default(uuid())
  sentConnections     Connection[] @relation("SentConnections")
  receivedConnections Connection[] @relation("ReceivedConnections")
}

model Connection {
  id          String           @id @default(uuid())
  requesterId String
  receiverId  String
  status      ConnectionStatus @default(PENDING)

  requester   User             @relation("SentConnections", fields: [requesterId], references: [id], onDelete: Cascade)
  receiver    User             @relation("ReceivedConnections", fields: [receiverId], references: [id], onDelete: Cascade)

  @@unique([requesterId, receiverId])
}
```
This forces a clean 2-way handshake connection where A requests B, and B can accept, establishing the connection. Follows (`follower` and `following`) are modeled similarly using a `Follow` join table with a compound unique index `@@unique([followerId, followingId])` to prevent double-following.

### Q7. What is the N+1 query problem, and how did you prevent it in Prisma?
**Answer:**  
The N+1 problem occurs when fetching a list of records (e.g., 20 posts) and then executing a separate database query for each record to fetch its relations (e.g., fetching the author of each post). This results in 1 initial query + N follow-up queries, which degrades database performance.

In Prisma, we resolve this by using **Eager Loading** via the `include` block. For example, when fetching the feed:
```typescript
const posts = await prisma.post.findMany({
  take: 20,
  orderBy: { createdAt: 'desc' },
  include: {
    author: {
      select: { name: true, image: true, profile: { select: { headline: true } } }
    },
    likes: { select: { userId: true } },
    _count: { select: { comments: true } }
  }
});
```
This compile-time directive generates optimized SQL SQL JOIN queries under the hood, fetching the posts, author profiles, and comment counts in a single network round-trip.

### Q8. Why did you use soft deletes (`deletedAt`), and how do you handle them?
**Answer:**  
Hard-deleting records can break user experience and relational data. For example, if a user deletes a post, hard-deleting it might break nested comment loops or database records referencing that post's ID. 

Instead, we add a nullable `deletedAt DateTime?` field. When a user deletes a post, we set `deletedAt = new Date()`. In our application queries, we filter them out:
```typescript
const posts = await prisma.post.findMany({
  where: { deletedAt: null }
});
```
This keeps historical audit logs intact (in the `AuditLog` table) while rendering active feeds cleanly.

---

## 4. Systems Design & Real-time Integration

### Q9. Walk me through the real-time messaging implementation.
**Answer:**  
We implement real-time chat using WebSockets via **Socket.IO**. 
1. **Handshake**: When the client mounts the chat dashboard, it establishes a WebSocket connection with the Socket.IO server. During connection, the server validates the user's NextAuth JWT to authenticate the socket.
2. **Rooms**: When a user selects a conversation, the client emits a `join_room` event containing the `conversationId`. The server joins the socket to that room.
3. **Message Transfer**: When User A sends a message:
   - The client sends an HTTP POST request to `/api/messages` to save the message to PostgreSQL.
   - Upon successful save, the client emits a socket event `send_message` with the message data.
   - The Socket.IO server broadcasts the message to the corresponding `conversationId` room.
   - Other users in the room receive the message instantaneously without polling.

### Q10. Next.js serverless functions (like Vercel Serverless) have a 10–60 second execution limit and don't maintain persistent connections. How did you run Socket.IO?
**Answer:**  
WebSockets require a persistent, stateful TCP server connection to manage active client sockets. Therefore, WebSockets cannot run directly inside serverless functions. 
- **Solution**: We run the Socket.IO server on a separate, dedicated containerized node instance (like a Node.js process deployed on Render, Railway, or AWS ECS). 
- **Communication Bridge**: The Next.js API endpoints interact with the Socket.IO server via a Pub/Sub redis adapter or HTTP client triggers to broadcast notifications when state updates occur outside WebSocket sessions.

---

## 5. Security & Validation

### Q11. How did you secure your API routes?
**Answer:**  
We enforce three layers of API security:
1. **Authentication Middleware**: NextAuth.js middleware blocks unauthenticated requests from accessing `/dashboard`, `/feed`, and `/api/*` endpoints.
2. **Role-Based Guards**: Specific routes check the session role:
   ```typescript
   const session = await auth();
   if (!session || session.user.role !== Role.ADMIN) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
   }
   ```
3. **Data Access Ownership Check (IDOR prevention)**: Before performing actions like modifying a project or deleting a post, we verify that the `session.user.id` matches the record's `authorId` or `ownerId`.

### Q12. How does the application protect itself from malicious input or script injections?
**Answer:**  
- **Schema Validation**: All input payloads (registration, post creation, comments) are parsed and validated using **Zod** schemas. Anything containing invalid datatypes or SQL injection patterns fails validation immediately.
- **ORM Escaping**: Prisma ORM parameters are natively sanitized. When querying databases, Prisma uses parameterized queries, which treat inputs as data values rather than executable commands, rendering SQL injection impossible.
- **Sanitizing HTML**: To prevent Cross-Site Scripting (XSS), user-submitted text content is escaped when rendering on React, which renders content dynamically inside text nodes by default rather than using raw `dangerouslySetInnerHTML`.

---

## 6. High Concurrency, Scale & Edge Cases

### Q13. Imagine a popular project leader posts a Team Recruitment ad seeking 3 developers. What happens if 100 students apply at the exact same millisecond? How do you prevent over-recruiting?
**Answer:**  
This is a concurrency race condition. If we check the current members count, verify it's less than the capacity limit, and then add a member, multiple requests could pass the check before any write occurs, recruiting 5 or 6 developers instead of 3.

To solve this, we use **Prisma transactions** (`$transaction`) and database row-level locking or an atomic conditional update. For example, when accepting a member:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Fetch and Lock the TeamRecruitment record
  const recruitment = await tx.teamRecruitment.findUnique({
    where: { id: recruitmentId },
  });

  if (!recruitment || !recruitment.isActive) {
    throw new Error("Recruitment is inactive or does not exist");
  }

  if (recruitment.currentMembers >= recruitment.teamSize) {
    throw new Error("Team is already full");
  }

  // 2. Atomically increment currentMembers count
  await tx.teamRecruitment.update({
    where: { id: recruitmentId },
    data: { currentMembers: { increment: 1 } }
  });

  // 3. Create the member record
  await tx.projectMember.create({
    data: { projectId: recruitment.projectId!, userId: applicantId, role: "Teammate" }
  });
});
```
This forces the operations to run sequentially in a database transaction block, rolling back updates if any query fails or constraints are violated.

### Q14. How would you design a feed-ranking algorithm to compute "Trending" posts?
**Answer:**  
We can calculate a simple engagement score based on interactions and decay over time (similar to Reddit/Hacker News ranking algorithms):
$$\text{Score} = \frac{(\text{Likes} \times 1) + (\text{Comments} \times 2) + (\text{Shares} \times 3)}{(\text{Age in Hours} + 2)^{1.5}}$$
- **Implementation**: Instead of running this calculation on the fly for every user request (which is too slow), we pre-calculate this score periodically (e.g. every 15 minutes) using a Cron job, or dynamically update the `isTrending` boolean field in the `Post` table. The feed API query can then simply filter by `orderBy: { isTrending: 'desc' }`.

### Q15. How would you scale Campus Connect to support 100k active users?
**Answer:**  
1. **Database Scaling**: Implement read-replicas in PostgreSQL. Write requests go to the master database, while heavy read requests (like compiling feeds) are routed to replica nodes.
2. **Caching Feed Queries**: Use Redis to cache the home feed for users. Rather than querying the PostgreSQL database repeatedly, user feed views are served directly from memory. We invalidate or append to the Redis cache when a user's connection publishes a new post.
3. **Load Balancing WebSockets**: Deploy multiple instances of the Socket.IO node. Connect them using a **Redis Adapter** to sync events across different server nodes. Use a load balancer with sticky sessions enabled to distribute connections.
4. **Static Page Optimization (ISR)**: Convert public portfolios, club profile shells, and event details into Incremental Static Regeneration (ISR) pages, rebuilding them only when updates are pushed.
