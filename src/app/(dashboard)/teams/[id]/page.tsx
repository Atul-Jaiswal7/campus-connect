"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Check, X } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function TeamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [introduction, setIntroduction] = useState("");
  const [showApply, setShowApply] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const applyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/teams/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ introduction }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Application submitted!" });
      setShowApply(false);
      queryClient.invalidateQueries({ queryKey: ["team", id] });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: "ACCEPTED" | "REJECTED" | "SHORTLISTED";
    }) => {
      const res = await fetch(`/api/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", id] });
      toast({ title: "Application updated" });
    },
  });

  const team = data?.data;
  const isLeader = team?.leaderId === session?.user?.id;

  if (isLoading) {
    return (
      <DashboardLayout>
        <Skeleton className="h-64 w-full rounded-xl" />
      </DashboardLayout>
    );
  }

  if (!team) {
    return (
      <DashboardLayout>
        <Card><CardContent className="py-12 text-center">Team not found</CardContent></Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">{team.title}</CardTitle>
                <Link
                  href={`/profile/${team.leader.id}`}
                  className="text-sm text-linkedin hover:underline"
                >
                  by {team.leader.profile?.firstName} {team.leader.profile?.lastName}
                </Link>
              </div>
              {team.hackathonName && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                  {team.hackathonName}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{team.problemStatement}</p>
            <div className="flex flex-wrap gap-2">
              {team.skills.map((s: { roleNeeded: string; skill: { name: string } }, i: number) => (
                <span key={i} className="rounded-full border px-3 py-1 text-sm">
                  {s.roleNeeded} · {s.skill.name}
                </span>
              ))}
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {team.currentMembers}/{team.teamSize} members
              </span>
              {team.duration && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {team.duration}
                </span>
              )}
            </div>

            {!isLeader && team.isActive && (
              <div>
                {!showApply ? (
                  <Button variant="linkedin" onClick={() => setShowApply(true)}>
                    Apply to Join
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Introduce yourself and why you'd be a great fit..."
                      value={introduction}
                      onChange={(e) => setIntroduction(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="linkedin"
                        disabled={introduction.length < 20 || applyMutation.isPending}
                        onClick={() => applyMutation.mutate()}
                      >
                        Submit Application
                      </Button>
                      <Button variant="outline" onClick={() => setShowApply(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {isLeader && team.applications?.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Applications ({team.applications.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {team.applications.map((app: {
                id: string;
                introduction: string;
                status: string;
                applicant: {
                  id: string;
                  profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                    headline: string | null;
                  } | null;
                };
              }) => (
                <div key={app.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <Link href={`/profile/${app.applicant.id}`} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={app.applicant.profile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-linkedin text-white">
                          {getInitials(
                            app.applicant.profile?.firstName ?? "U",
                            app.applicant.profile?.lastName ?? "S"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {app.applicant.profile?.firstName} {app.applicant.profile?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {app.applicant.profile?.headline}
                        </p>
                      </div>
                    </Link>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                      {app.status.toLowerCase()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm">{app.introduction}</p>
                  {app.status === "PENDING" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="linkedin"
                        onClick={() =>
                          reviewMutation.mutate({ applicationId: app.id, status: "ACCEPTED" })
                        }
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          reviewMutation.mutate({ applicationId: app.id, status: "SHORTLISTED" })
                        }
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          reviewMutation.mutate({ applicationId: app.id, status: "REJECTED" })
                        }
                      >
                        <X className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
