"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { ImageIcon, Send, Loader2, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function CreatePostBox() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const nameParts = session?.user?.name?.split(" ") ?? ["U", "S"];

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        if (data.success) {
          setImageUrls((prev) => [...prev, data.url]);
        }
      }
      toast({ title: "Images uploaded successfully!" });
    } catch {
      toast({ title: "Failed to upload images", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async (postContent: string) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postContent,
          type: imageUrls.length > 0 ? "IMAGE" : "TEXT",
          imageUrls,
        }),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      setImageUrls([]);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast({ title: "Post created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create post", variant: "destructive" });
    },
  });

  return (
    <Card className="glass-card">
      <CardContent className="p-4 sm:p-6 pt-6 sm:pt-6">
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

            {uploading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading media files...
              </div>
            )}

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-1">
                {imageUrls.map((url, index) => (
                  <div key={url} className="relative aspect-video rounded-lg overflow-hidden border group">
                    <img src={url} alt="post preview" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 font-bold"
                  onClick={handlePhotoClick}
                  disabled={uploading}
                >
                  <ImageIcon className="mr-2 h-4 w-4 text-slate-500" />
                  Photo
                </Button>
              </div>
              <Button
                variant="linkedin"
                size="sm"
                className="rounded-xl font-bold px-4 shadow-sm"
                disabled={(!content.trim() && imageUrls.length === 0) || mutation.isPending || uploading}
                onClick={() => mutation.mutate(content)}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
