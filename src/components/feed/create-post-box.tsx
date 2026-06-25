"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { ImageIcon, Send } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function CreatePostBox() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();
  const nameParts = session?.user?.name?.split(" ") ?? ["U", "S"];

  const mutation = useMutation({
    mutationFn: async (postContent: string) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: postContent, type: "TEXT" }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  return (
    <Card className="glass-card">
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={session?.user?.image ?? undefined} />
            <AvatarFallback className="bg-linkedin text-white">
              {getInitials(nameParts[0] ?? "U", nameParts[1] ?? "S")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share an update, project, or opportunity..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm">
                <ImageIcon className="mr-2 h-4 w-4" />
                Photo
              </Button>
              <Button
                variant="linkedin"
                size="sm"
                disabled={!content.trim() || mutation.isPending}
                onClick={() => mutation.mutate(content)}
              >
                <Send className="mr-2 h-4 w-4" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
