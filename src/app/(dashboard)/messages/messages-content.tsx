"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, MessageSquare } from "lucide-react";
import { getInitials, formatRelativeTime, cn } from "@/lib/utils";

export default function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get("conversation")
  );
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conv = searchParams.get("conversation");
    if (conv) setSelectedConversation(conv);
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${selectedConversation}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const conversations = data?.data ?? [];
  const messages = messagesData?.data ?? [];

  const getOtherMember = (conv: {
    members: Array<{
      user: {
        id: string;
        profile: { firstName: string; lastName: string; avatarUrl: string | null } | null;
      };
    }>;
  }) => conv.members.find((m) => m.user.id !== session?.user?.id)?.user;

  const selectedConv = conversations.find(
    (c: { id: string }) => c.id === selectedConversation
  );
  const otherUser = selectedConv ? getOtherMember(selectedConv) : null;

  return (
    <div className="space-y-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="glass-card">
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No conversations yet. Message someone from their profile!
                </p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv: {
                    id: string;
                    members: Array<{
                      user: {
                        id: string;
                        profile: {
                          firstName: string;
                          lastName: string;
                          avatarUrl: string | null;
                        } | null;
                      };
                    }>;
                    messages: Array<{ content: string; createdAt: string }>;
                  }) => {
                    const other = getOtherMember(conv);
                    const lastMessage = conv.messages[0];
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent",
                          selectedConversation === conv.id && "bg-accent"
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={other?.profile?.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-linkedin text-white text-xs">
                            {getInitials(
                              other?.profile?.firstName ?? "U",
                              other?.profile?.lastName ?? "S"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium">
                            {other?.profile?.firstName} {other?.profile?.lastName}
                          </p>
                          {lastMessage && (
                            <p className="truncate text-xs text-muted-foreground">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card min-h-[500px]">
            <CardContent className="flex h-full flex-col p-0">
              {selectedConversation && otherUser ? (
                <>
                  <div className="border-b px-4 py-3">
                    <p className="font-semibold">
                      {otherUser.profile?.firstName} {otherUser.profile?.lastName}
                    </p>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "400px" }}>
                    {messagesLoading ? (
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    ) : messages.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">
                        Start the conversation!
                      </p>
                    ) : (
                      messages.map((msg: {
                        id: string;
                        content: string;
                        createdAt: string;
                        senderId: string;
                      }) => {
                        const isMine = msg.senderId === session?.user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={cn("flex", isMine ? "justify-end" : "justify-start")}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                                isMine ? "bg-linkedin text-white" : "bg-muted"
                              )}
                            >
                              <p>{msg.content}</p>
                              <p
                                className={cn(
                                  "mt-1 text-xs",
                                  isMine ? "text-white/70" : "text-muted-foreground"
                                )}
                              >
                                {formatRelativeTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2 border-t p-4">
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (messageText.trim()) sendMutation.mutate(messageText);
                        }
                      }}
                    />
                    <Button
                      variant="linkedin"
                      size="icon"
                      disabled={!messageText.trim() || sendMutation.isPending}
                      onClick={() => sendMutation.mutate(messageText)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center p-8">
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
