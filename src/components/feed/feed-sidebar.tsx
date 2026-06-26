"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ConnectButton } from "@/components/shared/connect-button";
import { TrendingUp, Users, Eye } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function FeedSidebar() {
  const { data: session } = useSession();

  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: suggested, isLoading } = useQuery({
    queryKey: ["suggested-users"],
    queryFn: async () => {
      const res = await fetch("/api/users/suggested");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const completion = dashboard?.data?.profileCompletion ?? 0;
  const users = suggested?.data ?? [];

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Complete your profile</span>
              <span className="font-semibold text-linkedin">{completion}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-linkedin transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <Link href={`/profile/${session?.user?.id}`}>
              <Button variant="outline" size="sm" className="w-full mt-2">
                View Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            Trending Hashtags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {["hackathon2024", "react", "placement", "internship", "opensource"].map(
            (tag) => (
              <Link
                key={tag}
                href={`/search?q=${tag}`}
                className="block text-sm text-linkedin hover:underline"
              >
                #{tag}
              </Link>
            )
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Suggested Connections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No suggestions right now</p>
          ) : (
            users.map((user: {
              id: string;
              profile: {
                firstName: string;
                lastName: string;
                department: string | null;
                year: number | null;
              } | null;
            }) => (
              <div key={user.id} className="flex items-center justify-between">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-linkedin text-white">
                      {getInitials(
                        user.profile?.firstName ?? "U",
                        user.profile?.lastName ?? "S"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.profile?.department}
                      {user.profile?.year ? ` · Year ${user.profile.year}` : ""}
                    </p>
                  </div>
                </Link>
                <ConnectButton userId={user.id} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4" />
            Your Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Profile Views</span>
            <span className="font-semibold">{dashboard?.data?.profileViews ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Connections</span>
            <span className="font-semibold">{dashboard?.data?.connections ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Streak</span>
            <span className="font-semibold">{dashboard?.data?.streakDays ?? 0} days</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
