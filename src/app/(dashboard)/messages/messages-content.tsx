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
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
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
    <div className="space-y-6 select-none max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground font-medium">Keep up-to-date with direct collaborations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr] items-start">
        {/* Left Side: Active Threads list */}
        <Card className={cn(
          "glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/50",
          selectedConversation ? "hidden md:block" : "block"
        )}>
          <CardContent className="p-3">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-muted-foreground">
                No conversations yet. Message a classmate from their profile!
              </div>
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
                  const active = selectedConversation === conv.id;
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 relative group overflow-hidden border border-transparent",
                        active
                          ? "bg-primary/10 border-primary/10 text-primary"
                          : "hover:bg-accent/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 ring-offset-background group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={other?.profile?.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-primary text-white text-xs font-bold">
                            {getInitials(
                              other?.profile?.firstName ?? "U",
                              other?.profile?.lastName ?? "S"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        {/* Mock Online dot */}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-extrabold text-foreground truncate">
                          {other?.profile?.firstName} {other?.profile?.lastName}
                        </p>
                        {lastMessage && (
                          <p className="truncate text-[10px] font-semibold text-muted-foreground mt-0.5">
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

        {/* Right Side: Chat box window */}
        <Card className={cn(
          "glass-card border border-slate-200/50 dark:border-slate-800/50 overflow-hidden flex flex-col justify-between min-h-[480px] h-[520px]",
          selectedConversation ? "block" : "hidden md:flex"
        )}>
          {selectedConversation && otherUser ? (
            <div className="flex flex-col justify-between h-full">
              {/* Header */}
              <div className="border-b border-slate-100 dark:border-slate-900 px-4 py-3 flex items-center justify-between bg-card/60 backdrop-blur-xs">
                <div className="flex items-center gap-3">
                  {/* Back to list trigger for narrow viewports */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8 rounded-lg text-muted-foreground"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-4.5 w-4.5" />
                  </Button>
                  
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={otherUser.profile?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary text-white text-xs font-bold">
                        {getInitials(otherUser.profile?.firstName ?? "U", otherUser.profile?.lastName ?? "S")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-foreground">
                      {otherUser.profile?.firstName} {otherUser.profile?.lastName}
                    </p>
                    <span className="text-[9px] font-bold text-emerald-500">Active now</span>
                  </div>
                </div>
              </div>

              {/* Message History Scroller */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messagesLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-1/3 rounded-xl" />
                    <Skeleton className="h-10 w-1/4 rounded-xl ml-auto" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 text-xs font-semibold text-muted-foreground">
                    Start the conversation! Say hello to {otherUser.profile?.firstName}.
                  </div>
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
                            "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs font-semibold shadow-sm leading-normal border",
                            isMine
                              ? "bg-primary border-primary text-white rounded-br-sm"
                              : "bg-slate-100 dark:bg-slate-900 border-slate-200/50 dark:border-slate-800 text-foreground rounded-bl-sm"
                          )}
                        >
                          <p>{msg.content}</p>
                          <span
                            className={cn(
                              "text-[8px] font-bold block mt-1 tracking-wider text-right uppercase",
                              isMine ? "text-white/60" : "text-muted-foreground"
                            )}
                          >
                            {formatRelativeTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Dock */}
              <div className="border-t border-slate-100 dark:border-slate-900 p-4 bg-card/60 backdrop-blur-xs flex items-center gap-2">
                <Input
                  placeholder="Write a message..."
                  className="rounded-xl h-10 border border-slate-200 dark:border-slate-800 bg-background/50 focus:bg-background text-xs font-semibold focus:ring-4 focus:ring-primary/5"
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
                  className="h-10 w-10 shrink-0 rounded-xl shadow-md button-ripple"
                  disabled={!messageText.trim() || sendMutation.isPending}
                  onClick={() => sendMutation.mutate(messageText)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-muted-foreground">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Select a Conversation</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-xs leading-relaxed">
                Choose a classmate chat thread from the left menu to view, reply, and coordinate collaborations.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
