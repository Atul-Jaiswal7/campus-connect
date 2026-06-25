"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageSquare } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const conversations = data?.data ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Messages</h1>
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-10" />
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 rounded-lg" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No conversations yet
                </p>
              ) : (
                <div className="space-y- 1">
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
                    const otherMember = conv.members[0]?.user;
                    const lastMessage = conv.messages[0];
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent ${
                          selectedConversation === conv.id ? "bg-accent" : ""
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherMember?.profile?.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-linkedin text-white text-xs">
                            {getInitials(
                              otherMember?.profile?.firstName ?? "U",
                              otherMember?.profile?.lastName ?? "S"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium">
                            {otherMember?.profile?.firstName}{" "}
                            {otherMember?.profile?.lastName}
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
            <CardContent className="flex h-full flex-col items-center justify-center p-8">
              {selectedConversation ? (
                <p className="text-muted-foreground">
                  Chat interface for conversation {selectedConversation}
                </p>
              ) : (
                <>
                  <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Select a conversation to start messaging
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
