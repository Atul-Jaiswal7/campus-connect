"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { CreatePostBox } from "@/components/feed/create-post-box";
import { PostCard } from "@/components/feed/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { PostWithAuthor } from "@/types";

export function FeedList({ trending = false }: { trending?: boolean }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["feed", trending],
      queryFn: async ({ pageParam = 1 }) => {
        const res = await fetch(
          `/api/posts?page=${pageParam}&limit=10${trending ? "&trending=true" : ""}`
        );
        if (!res.ok) throw new Error("Failed to fetch feed");
        return res.json();
      },
      getNextPageParam: (lastPage) =>
        lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
      initialPageParam: 1,
    });

  const posts: PostWithAuthor[] =
    data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-4">
      {!trending && <CreatePostBox />}

      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {hasNextPage && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
}
