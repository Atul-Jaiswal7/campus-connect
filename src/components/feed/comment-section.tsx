"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getInitials, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CommentSectionProps {
  postId: string;
  commentCount: number;
}

export function CommentSection({ postId, commentCount }: CommentSectionProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to load comments");
      return res.json();
    },
    enabled: open,
  });

  const commentMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error("Failed to comment");
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Comment added!" });
    },
    onError: () => toast({ title: "Failed to comment", variant: "destructive" }),
  });

  const comments = data?.data ?? [];

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        Comment {commentCount > 0 && `(${commentCount})`}
      </Button>

      {open && (
        <div className="mt-3 space-y-4 border-t pt-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[60px] resize-none"
            />
            <Button
              variant="linkedin"
              size="icon"
              disabled={!content.trim() || commentMutation.isPending}
              onClick={() => commentMutation.mutate(content)}
            >
              {commentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment: {
                id: string;
                content: string;
                createdAt: string;
                author: {
                  id: string;
                  profile: { firstName: string; lastName: string; avatarUrl: string | null } | null;
                };
              }) => (
                <div key={comment.id} className="flex gap-2">
                  <Link href={`/profile/${comment.author.id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.author.profile?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-linkedin text-white text-xs">
                        {getInitials(
                          comment.author.profile?.firstName ?? "U",
                          comment.author.profile?.lastName ?? "S"
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2">
                    <Link
                      href={`/profile/${comment.author.id}`}
                      className="text-sm font-semibold hover:text-linkedin"
                    >
                      {comment.author.profile?.firstName} {comment.author.profile?.lastName}
                    </Link>
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
