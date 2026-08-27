"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Heart,
  Share2,
  Bookmark,
  TrendingUp,
  MoreHorizontal,
  Briefcase,
  UserCheck,
  MessageCircle,
} from "lucide-react";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { CommentSection, CommentToggleButton } from "@/components/feed/comment-section";
import { toast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import type { PostWithAuthor } from "@/types";

const FEED_REASONS: Record<
  number,
  { label: string; icon: typeof Briefcase; className: string }
> = {
  0: { label: "Opportunity for you", icon: Briefcase, className: "text-emerald-600" },
  1: { label: "From someone you follow", icon: UserCheck, className: "text-primary" },
  2: { label: "Someone you follow commented", icon: MessageCircle, className: "text-primary" },
  3: { label: "Someone you follow liked this", icon: Heart, className: "text-rose-500" },
  4: { label: "Trending on campus", icon: TrendingUp, className: "text-orange-500" },
};

interface PostCardProps {
  post: PostWithAuthor;
}

export function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showMenu, setShowMenu] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

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

  const reason = FEED_REASONS[post.feedPriority ?? -1];

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
        {reason && (
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <reason.icon className={cn("h-3.5 w-3.5 shrink-0", reason.className)} />
            {reason.label}
          </p>
        )}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/profile/${post.author.id}`} className="shrink-0">
              <Avatar>
                <AvatarImage src={author?.avatarUrl ?? undefined} />
                <AvatarFallback className="bg-linkedin text-white">
                  {getInitials(author?.firstName ?? "U", author?.lastName ?? "S")}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0">
              <Link
                href={`/profile/${post.author.id}`}
                className="font-semibold hover:text-linkedin hover:underline block truncate"
              >
                {authorName}
              </Link>
              {author?.headline && (
                <p className="text-xs text-muted-foreground truncate">{author.headline}</p>
              )}
              <p className="text-xs text-muted-foreground truncate">
                {formatRelativeTime(post.createdAt)}
                {post.isTrending && (
                  <span className="ml-2 inline-flex items-center text-orange-500">
                    <TrendingUp className="mr-1 h-3 w-3 shrink-0" />
                    Trending
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 relative shrink-0">
            <span className="hidden sm:inline-flex rounded-full bg-slate-100 dark:bg-slate-800 border px-2.5 py-0.5 text-xs capitalize shrink-0 text-slate-600 dark:text-slate-400">
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

        <div className="grid grid-cols-4 border-t pt-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full gap-1.5 px-1 sm:gap-2 sm:px-3", post.isLiked && "text-red-500")}
            onClick={() => likeMutation.mutate()}
            disabled={likeMutation.isPending}
          >
            <Heart className={cn("h-4 w-4 shrink-0", post.isLiked && "fill-current")} />
            <span className="hidden sm:inline">Like</span>
          </Button>
          <CommentToggleButton
            commentCount={post.commentCount}
            open={commentsOpen}
            onToggle={() => setCommentsOpen((v) => !v)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1.5 px-1 sm:gap-2 sm:px-3"
            onClick={() => shareMutation.mutate()}
          >
            <Share2 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full gap-1.5 px-1 sm:gap-2 sm:px-3", post.isBookmarked && "text-linkedin")}
            onClick={() => bookmarkMutation.mutate()}
            disabled={bookmarkMutation.isPending}
          >
            <Bookmark className={cn("h-4 w-4 shrink-0", post.isBookmarked && "fill-current")} />
            <span className="hidden sm:inline">Save</span>
          </Button>
        </div>

        <CommentSection postId={post.id} open={commentsOpen} />
      </CardContent>
    </Card>
  );
}
