"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Plus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default function TeamsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const res = await fetch("/api/teams");
      if (!res.ok) throw new Error("Failed to fetch teams");
      return res.json();
    },
  });

  const recruitments = data?.data ?? [];

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Team Formation</h1>
            <p className="text-muted-foreground">
              Find teammates or recruit for your project
            </p>
          </div>
          <Link href="/teams/new">
            <Button variant="linkedin">
              <Plus className="mr-2 h-4 w-4" />
              Post Recruitment
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : recruitments.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              No active recruitments. Post one to find teammates!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recruitments.map((rec: {
              id: string;
              title: string;
              problemStatement: string;
              teamSize: number;
              currentMembers: number;
              duration: string | null;
              hackathonName: string | null;
              createdAt: string;
              leader: { profile: { firstName: string; lastName: string } | null };
              skills: Array<{ roleNeeded: string; skill: { name: string } }>;
              _count: { applications: number };
            }) => (
              <Card key={rec.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{rec.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by {rec.leader.profile?.firstName} {rec.leader.profile?.lastName} •{" "}
                        {formatRelativeTime(rec.createdAt)}
                      </p>
                    </div>
                    {rec.hackathonName && (
                      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {rec.hackathonName}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-2 text-sm">{rec.problemStatement}</p>

                  <div className="flex flex-wrap gap-2">
                    {rec.skills.map((s, i) => (
                      <span
                        key={i}
                        className="rounded-full border px-3 py-1 text-xs"
                      >
                        {s.roleNeeded} • {s.skill.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {rec.currentMembers}/{rec.teamSize} members
                    </span>
                    {rec.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {rec.duration}
                      </span>
                    )}
                    <span>{rec._count.applications} applications</span>
                  </div>

                  <Link href={`/teams/${rec.id}`}>
                    <Button variant="linkedin" size="sm">
                      View & Apply
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
