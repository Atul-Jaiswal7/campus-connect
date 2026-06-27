"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, CheckCheck } from "lucide-react";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import { isToday, isYesterday, parseISO } from "date-fns";

interface NotificationItem {
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
}

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

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.data ?? [];

  // Group notifications helper by Date
  const groupNotifications = (notifs: NotificationItem[]) => {
    const groups: { [key: string]: NotificationItem[] } = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    notifs.forEach((notif) => {
      try {
        const date = parseISO(notif.createdAt);
        if (isToday(date)) {
          groups.Today.push(notif);
        } else if (isYesterday(date)) {
          groups.Yesterday.push(notif);
        } else {
          groups.Earlier.push(notif);
        }
      } catch {
        groups.Earlier.push(notif);
      }
    });

    return groups;
  };

  const grouped = groupNotifications(notifications);
  const hasNotifications = notifications.length > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6 select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
          {data?.unreadCount > 0 && (
            <p className="text-xs font-bold text-muted-foreground mt-0.5">
              You have <span className="text-primary">{data.unreadCount}</span> unread notices
            </p>
          )}
        </div>
        
        {hasNotifications && (
          <Button
            variant="outline"
            className="rounded-xl font-bold h-9 text-xs hover:bg-accent/40 gap-1.5"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List Layout */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : !hasNotifications ? (
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-muted-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">All Caught Up!</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              No new alerts right now. We will notify you when connections request links, peers comment on posts, or team details update.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([title, list]) => {
            if (list.length === 0) return null;
            
            return (
              <div key={title} className="space-y-3">
                {/* Section Separator */}
                <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pl-2">
                  {title}
                </h4>
                
                <div className="space-y-2">
                  {list.map((notif: {
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
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card
                        className={`glass-card border transition-all duration-200 relative overflow-hidden group cursor-pointer ${
                          !notif.isRead
                            ? "border-primary/30 bg-primary/5 hover:border-primary/40"
                            : "border-slate-200/50 dark:border-slate-800/50 hover:bg-accent/20"
                        }`}
                        onClick={() => !notif.isRead && markAsRead.mutate(notif.id)}
                      >
                        {/* Unread Left Border Highlight */}
                        {!notif.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                        )}

                        <CardContent className="flex items-start gap-4 p-4 pl-5">
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={notif.actor?.profile?.avatarUrl ?? undefined} />
                            <AvatarFallback className="bg-primary text-white text-xs font-bold">
                              {getInitials(
                                notif.actor?.profile?.firstName ?? "S",
                                notif.actor?.profile?.lastName ?? "Y"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-0.5 overflow-hidden">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-bold text-foreground truncate">{notif.title}</p>
                              <span className="text-[9px] font-bold text-muted-foreground shrink-0">
                                {formatRelativeTime(notif.createdAt)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                              {notif.message}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
