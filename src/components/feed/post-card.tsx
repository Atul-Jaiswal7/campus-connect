"use client";

import Link from "next/link";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, Share2, Bookmark, TrendingUp } from "lucide-react";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { CommentSection } from "@/components/feed/comment-section";
import { toast } from "@/hooks/use-toast";
import type { PostWithAuthor } from "@/types";

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const author = post.author.profile;
  const authorName = author
    ? `${author.firstName} ${author.lastName}`
    : "Unknown User";

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to like");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}/bookmark`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to bookmark");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      await navigator.clipboard.writeText(
        `${window.location.origin}/feed?post=${post.id}`
      );
    },
    onSuccess: () => toast({ title: "Link copied to clipboard!" }),
  });

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author.id}`}>
              <Avatar>
                <AvatarImage src={author?.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-linkedin text-white">
                  {getInitials(author?.firstName ?? "U", author?.lastName ?? "S")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold hover:text-linkedin hover:underline"
              >
                {authorName}
              </Link>
              {author?.headline && (
                <p className="text-xs text-muted-foreground line-clamp-1">{author.headline}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatRelativeTime(post.createdAt)}
                {post.isTrending && (
                  <span className="ml-2 inline-flex items-center text-orange-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Trending
                  </span>
                )}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
            {post.type.toLowerCase().replace("_", " ")}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>

        {post.imageUrls.length > 0 && (
          <div className="grid gap-2">
            {post.imageUrls.map((url, i) => (
              <div key={i} className="relative aspect-video overflow-hidden rounded-lg">
                <Image src={url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${tag}&type=all`}
                className="text-sm text-linkedin hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
          <span>{post.likeCount} likes</span>
          <span>{post.commentCount} comments</span>
        </div>

        <div className="flex items-center justify-around border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(post.isLiked && "text-red-500")}
            onClick={() => likeMutation.mutate()}
          >
            <Heart className={cn("mr-2 h-4 w-4", post.isLiked && "fill-current")} />
            Like
          </Button>
          <CommentSection postId={post.id} commentCount={post.commentCount} />
          <Button variant="ghost" size="sm" onClick={() => shareMutation.mutate()}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(post.isBookmarked && "text-linkedin")}
            onClick={() => bookmarkMutation.mutate()}
          >
            <Bookmark className={cn("mr-2 h-4 w-4", post.isBookmarked && "fill-current")} />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
