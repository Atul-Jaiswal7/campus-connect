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

      {!isLoading && posts.length === 0 && (
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-muted-foreground">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">No Posts Yet</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              {trending 
                ? "No trending posts at the moment. Check back later!"
                : "Be the first to share something with your campus community!"}
            </p>
          </CardContent>
        </Card>
      )}

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
