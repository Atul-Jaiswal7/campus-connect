"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, Share2, Bookmark, TrendingUp, MoreHorizontal } from "lucide-react";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { CommentSection } from "@/components/feed/comment-section";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import type { PostWithAuthor } from "@/types";

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);

  const author = post.author.profile;
  const authorName = author
    ? `${author.firstName} ${author.lastName}`
    : "Unknown User";

  const isOwner = session?.user?.id === post.author.id;

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

  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post updated successfully!" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update post", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete post", variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (editContent.trim() === "") return;
    updateMutation.mutate(editContent);
  };

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
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
          <div className="flex items-center gap-2 relative">
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 border px-2.5 py-0.5 text-xs capitalize shrink-0 text-slate-600 dark:text-slate-400">
              {post.type.toLowerCase().replace("_", " ")}
            </span>
            {isOwner && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                {showMenu && (
                  <div className="absolute right-0 top-9 w-28 bg-card border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                    <button
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                    >
                      Edit Post
                    </button>
                    <button
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400 transition-colors"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this post?")) {
                          deleteMutation.mutate();
                        }
                        setShowMenu(false);
                      }}
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full rounded-xl bg-card border border-slate-200 dark:border-slate-800 text-sm p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-medium text-foreground animate-pulse"
              rows={3}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" className="rounded-lg h-7 font-bold text-xs" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="linkedin" className="rounded-lg h-7 font-bold text-xs px-3" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        )}

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
