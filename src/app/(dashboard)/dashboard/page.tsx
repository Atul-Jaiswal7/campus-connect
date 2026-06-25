"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Bookmark,
  Flame,
} from "lucide-react";
import type { DashboardStats } from "@/types";

const statCards = [
  { key: "profileViews", label: "Profile Views", icon: Eye, color: "text-blue-500" },
  { key: "connections", label: "Connections", icon: Users, color: "text-green-500" },
  { key: "appliedProjects", label: "Applied Projects", icon: Briefcase, color: "text-purple-500" },
  { key: "savedOpportunities", label: "Saved Opportunities", icon: Bookmark, color: "text-orange-500" },
  { key: "unreadMessages", label: "Unread Messages", icon: MessageSquare, color: "text-cyan-500" },
  { key: "unreadNotifications", label: "Notifications", icon: Bell, color: "text-red-500" },
] as const;

export default function DashboardPage() {
  const { data, isLoading } = useQuery<{ data: DashboardStats }>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  const stats = data?.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Your campus networking overview</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map(({ key, label, icon: Icon, color }) => (
              <Card key={key} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.[key] ?? 0}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-semibold text-linkedin">
                    {stats?.profileCompletion ?? 0}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-secondary">
                  <div
                    className="h-3 rounded-full bg-linkedin transition-all"
                    style={{ width: `${stats?.profileCompletion ?? 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Engagement Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.streakDays ?? 0}{" "}
                <span className="text-lg font-normal text-muted-foreground">days</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep engaging to maintain your streak!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
