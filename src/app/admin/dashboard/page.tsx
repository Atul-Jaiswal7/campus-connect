"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Shield, FileText, Flag, Building2 } from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const stats = data?.data;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users },
    { label: "Verified Users", value: stats?.verifiedUsers, icon: Shield },
    { label: "Total Posts", value: stats?.totalPosts, icon: FileText },
    { label: "Pending Reports", value: stats?.pendingReports, icon: Flag },
    { label: "Active Clubs", value: stats?.totalClubs, icon: Building2 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform analytics and moderation</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map(({ label, value, icon: Icon }) => (
              <Card key={label} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-linkedin" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{value ?? 0}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
