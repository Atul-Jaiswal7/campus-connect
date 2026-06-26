"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck } from "lucide-react";
import { formatRelativeTime, getInitials } from "@/lib/utils";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            {data?.unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {data.unreadCount} unread
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center py-12">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No notifications yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif: {
              id: string;
              title: string;
              message: string;
              isRead: boolean;
              createdAt: string;
              actor: {
                profile: {
                  firstName: string;
                  lastName: string;
                  avatarUrl: string | null;
                } | null;
              } | null;
            }) => (
              <Card
                key={notif.id}
                className={`glass-card transition-colors ${
                  !notif.isRead ? "border-linkedin/30 bg-linkedin/5" : ""
                }`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notif.actor?.profile?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-linkedin text-white text-xs">
                      {getInitials(
                        notif.actor?.profile?.firstName ?? "S",
                        notif.actor?.profile?.lastName ?? "Y"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="h-2 w-2 rounded-full bg-linkedin" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
