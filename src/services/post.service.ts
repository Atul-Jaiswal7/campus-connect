import { prisma } from "@/lib/prisma";
import { extractHashtags } from "@/lib/utils";
import type { PostInput } from "@/lib/validations";

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

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        deletedAt: null,
        ...(trending ? { isTrending: true } : {}),
      },
      include: {
        ...POST_INCLUDE,
        likes: { where: { userId }, select: { id: true } },
        bookmarks: { where: { userId }, select: { id: true } },
      },
      orderBy: trending
        ? [{ likeCount: "desc" }, { createdAt: "desc" }]
        : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.post.count({
      where: { deletedAt: null, ...(trending ? { isTrending: true } : {}) },
    }),
  ]);

  return {
    data: posts.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
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
