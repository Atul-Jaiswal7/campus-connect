import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { extractHashtags } from "@/lib/utils";
import type { PostInput } from "@/lib/validations";

// Feed ranking tiers, lowest number surfaces first.
export const FEED_PRIORITY = {
  OPPORTUNITY: 0,
  FOLLOWED_AUTHOR: 1,
  FOLLOWED_COMMENTED: 2,
  FOLLOWED_LIKED: 3,
  TRENDING: 4,
  OTHER: 5,
} as const;

const POST_INCLUDE = {
  author: {
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
};

export async function createPost(authorId: string, data: PostInput) {
  const hashtags = extractHashtags(data.content);

  return prisma.post.create({
    data: {
      authorId,
      content: data.content,
      type: data.type,
      visibility: data.visibility,
      imageUrls: data.imageUrls ?? [],
      githubUrl: data.githubUrl,
      hashtags,
    },
    include: POST_INCLUDE,
  });
}

export async function getFeedPosts(
  userId: string,
  page: number = 1,
  limit: number = 10,
  trending: boolean = false
) {
  const skip = (page - 1) * limit;

  if (trending) {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { deletedAt: null, isTrending: true },
        include: {
          ...POST_INCLUDE,
          likes: { where: { userId }, select: { id: true } },
          bookmarks: { where: { userId }, select: { id: true } },
        },
        orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.post.count({ where: { deletedAt: null, isTrending: true } }),
    ]);

    return {
      data: posts.map((post) => ({
        ...post,
        isLiked: post.likes.length > 0,
        isBookmarked: post.bookmarks.length > 0,
        feedPriority: FEED_PRIORITY.TRENDING,
        likes: undefined,
        bookmarks: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  }

  // Rank in SQL so pagination stays correct across the whole feed.
  const ranked = await prisma.$queryRaw<Array<{ id: string; priority: number }>>(Prisma.sql`
    SELECT p.id,
      CASE
        WHEN p."type" IN ('INTERNSHIP', 'PLACEMENT') THEN ${FEED_PRIORITY.OPPORTUNITY}
        WHEN f."followingId" IS NOT NULL THEN ${FEED_PRIORITY.FOLLOWED_AUTHOR}
        WHEN EXISTS (
          SELECT 1 FROM comments c
          JOIN follows fc ON fc."followingId" = c."authorId" AND fc."followerId" = ${userId}
          WHERE c."postId" = p.id AND c."deletedAt" IS NULL
        ) THEN ${FEED_PRIORITY.FOLLOWED_COMMENTED}
        WHEN EXISTS (
          SELECT 1 FROM likes l
          JOIN follows fl ON fl."followingId" = l."userId" AND fl."followerId" = ${userId}
          WHERE l."postId" = p.id
        ) THEN ${FEED_PRIORITY.FOLLOWED_LIKED}
        WHEN p."isTrending" THEN ${FEED_PRIORITY.TRENDING}
        ELSE ${FEED_PRIORITY.OTHER}
      END AS priority
    FROM posts p
    LEFT JOIN follows f
      ON f."followingId" = p."authorId" AND f."followerId" = ${userId}
    WHERE p."deletedAt" IS NULL
    ORDER BY priority ASC, p."createdAt" DESC
    LIMIT ${limit} OFFSET ${skip}
  `);

  const total = await prisma.post.count({ where: { deletedAt: null } });

  if (ranked.length === 0) {
    return {
      data: [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: false,
      },
    };
  }

  const priorityById = new Map(ranked.map((r) => [r.id, Number(r.priority)]));

  const posts = await prisma.post.findMany({
    where: { id: { in: ranked.map((r) => r.id) } },
    include: {
      ...POST_INCLUDE,
      likes: { where: { userId }, select: { id: true } },
      bookmarks: { where: { userId }, select: { id: true } },
    },
  });

  // findMany ignores the ranked order, so restore it here.
  const orderedPosts = ranked
    .map((r) => posts.find((p) => p.id === r.id))
    .filter((p): p is (typeof posts)[number] => Boolean(p));

  return {
    data: orderedPosts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      feedPriority: priorityById.get(post.id) ?? FEED_PRIORITY.OTHER,
      likes: undefined,
      bookmarks: undefined,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
}

export async function toggleLike(postId: string, userId: string) {
  const existing = await prisma.like.findUnique({
    where: { postId_userId: { postId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.like.delete({ where: { id: existing.id } }),
      prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return { liked: false };
  }

  await prisma.$transaction([
    prisma.like.create({ data: { postId, userId } }),
    prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    }),
  ]);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post && post.authorId !== userId) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        actorId: userId,
        type: "LIKE",
        title: "New Like",
        message: "Someone liked your post",
        link: "/feed",
      },
    });
  }

  return { liked: true };
}

export async function toggleBookmark(postId: string, userId: string) {
  const existing = await prisma.bookmark.findFirst({
    where: { postId, userId },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { postId, userId } });
  return { bookmarked: true };
}

export async function addComment(
  postId: string,
  authorId: string,
  content: string,
  parentId?: string
) {
  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { postId, authorId, content, parentId },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    }),
    prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    }),
  ]);

  return comment;
}

export async function updatePost(postId: string, userId: string, data: Partial<PostInput>) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  if (post.authorId !== userId) throw new Error("Unauthorized to edit this post");

  const hashtags = data.content ? extractHashtags(data.content) : undefined;

  return prisma.post.update({
    where: { id: postId },
    data: {
      content: data.content,
      type: data.type,
      visibility: data.visibility,
      imageUrls: data.imageUrls,
      githubUrl: data.githubUrl,
      ...(hashtags ? { hashtags } : {}),
    },
    include: POST_INCLUDE,
  });
}

export async function deletePost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  if (post.authorId !== userId) throw new Error("Unauthorized to delete this post");

  return prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
  });
}
