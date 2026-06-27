"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Check, X, ArrowLeft, Send, Sparkles, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      toast({ title: "Application submitted successfully!" });
      setShowApply(false);
      setIntroduction("");
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
      toast({ title: "Application status updated!" });
    },
  });

  const team = data?.data;
  const isLeader = team?.leaderId === session?.user?.id;

  const handleDeleteRecruitment = async () => {
    if (!confirm("Are you sure you want to delete this recruitment posting?")) return;
    try {
      const res = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Recruitment posting deleted successfully" });
      router.push("/teams");
    } catch {
      toast({ title: "Failed to delete recruitment posting", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!team) {
    return (
      <Card className="glass-card max-w-xl mx-auto border border-red-500/10 select-none">
        <CardContent className="py-16 text-center flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-destructive animate-bounce" />
          <p className="font-semibold text-muted-foreground">Team recruitment post not found</p>
          <Link href="/teams">
            <Button size="sm" variant="outline" className="rounded-xl mt-2 font-bold">
              Back to Team Listings
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 select-none">
      {/* Back Button & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/teams">
          <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Team Formation
          </Button>
        </Link>

        {isLeader && (
          <div className="flex items-center gap-2">
            <Link href={`/teams/${id}/edit`}>
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold gap-1.5 h-8 px-3 border-slate-200 dark:border-slate-800">
                <Pencil className="h-3.5 w-3.5 text-slate-500" />
                Edit Posting
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 h-8 px-3"
              onClick={handleDeleteRecruitment}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Posting
            </Button>
          </div>
        )}
      </div>

      {/* Main Details Panel */}
      <Card className="glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        {/* Banner Decoration */}
        <div className="h-28 bg-gradient-to-r from-primary/10 via-indigo-500/5 to-transparent relative overflow-hidden p-6 flex items-end">
          <div className="absolute top-4 right-4">
            {team.hackathonName ? (
              <span className="text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50">
                {team.hackathonName}
              </span>
            ) : (
              <span className="text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                General Recruitment
              </span>
            )}
          </div>
        </div>

        <CardContent className="px-6 pb-6 pt-5 space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold tracking-tight text-foreground">{team.title}</h1>
            <p className="text-xs text-muted-foreground font-semibold">
              Recruitment posted by{" "}
              <Link
                href={`/profile/${team.leader.id}`}
                className="text-primary hover:underline font-bold"
              >
                {team.leader.profile?.firstName} {team.leader.profile?.lastName}
              </Link>
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Problem Statement</h4>
            <p className="text-sm leading-relaxed text-muted-foreground font-medium">{team.problemStatement}</p>
          </div>

          {/* Roles/Skills section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Required Teammates</h4>
            <div className="flex flex-wrap gap-1.5">
              {team.skills.map((s: { roleNeeded: string; skill: { name: string } }, i: number) => (
                <span key={i} className="text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 border">
                  {s.roleNeeded} · <span className="text-primary">{s.skill.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Members Stats */}
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-900">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              {team.currentMembers}/{team.teamSize} members filled
            </span>
            {team.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {team.duration} project length
              </span>
            )}
          </div>

          {/* Application input block */}
          {!isLeader && team.isActive && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-900">
              {!showApply ? (
                <Button variant="linkedin" className="rounded-xl font-bold button-ripple h-10 px-5" onClick={() => setShowApply(true)}>
                  Apply to Join Team
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Textarea
                    placeholder="Introduce yourself! List your skills, portfolio links, and why you are interested in this project..."
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    className="min-h-[120px] rounded-xl text-xs font-semibold"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="linkedin"
                      className="rounded-xl font-bold gap-1.5 h-10 button-ripple text-xs"
                      disabled={introduction.length < 20 || applyMutation.isPending}
                      onClick={() => applyMutation.mutate()}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Submit Application
                    </Button>
                    <Button variant="outline" className="rounded-xl font-semibold h-10 text-xs" onClick={() => setShowApply(false)}>
                      Cancel
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-semibold">
                    * Minimum 20 characters required. Submitting will alert the project owner.
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Candidate applicants board (only for leader) */}
      {isLeader && (
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Incoming Applications ({team.applications?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!team.applications || team.applications.length === 0 ? (
              <p className="text-xs font-semibold text-muted-foreground text-center py-6">
                No active applications received for this recruitment yet.
              </p>
            ) : (
              team.applications.map((app: {
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
                <div key={app.id} className="rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 space-y-3 relative overflow-hidden group">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <Link href={`/profile/${app.applicant.id}`} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-offset-background group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={app.applicant.profile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary text-white text-xs font-bold">
                          {getInitials(
                            app.applicant.profile?.firstName ?? "U",
                            app.applicant.profile?.lastName ?? "S"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {app.applicant.profile?.firstName} {app.applicant.profile?.lastName}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-semibold truncate leading-none">
                          {app.applicant.profile?.headline}
                        </p>
                      </div>
                    </Link>
                    
                    {/* Status Pill */}
                    <span className={`inline-flex shrink-0 self-start text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2 py-0.5 border ${
                      app.status === "PENDING"
                        ? "bg-slate-100 dark:bg-slate-900 border-slate-200"
                        : app.status === "ACCEPTED"
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200/50"
                        : app.status === "SHORTLISTED"
                        ? "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200/50"
                        : "bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/50"
                    }`}>
                      {app.status.toLowerCase()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground bg-slate-50/50 dark:bg-slate-950/40 rounded-xl p-3 border font-semibold leading-relaxed">
                    {app.introduction}
                  </p>

                  {/* Actions buttons */}
                  {app.status === "PENDING" && (
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      <Button
                        size="sm"
                        variant="linkedin"
                        className="rounded-xl font-bold text-xs h-8 gap-1 button-ripple"
                        onClick={() =>
                          reviewMutation.mutate({ applicationId: app.id, status: "ACCEPTED" })
                        }
                      >
                        <Check className="h-3.5 w-3.5" />
                        Accept Candidate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl font-bold text-xs h-8 hover:bg-indigo-500/10 hover:text-indigo-500"
                        onClick={() =>
                          reviewMutation.mutate({ applicationId: app.id, status: "SHORTLISTED" })
                        }
                      >
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl font-semibold text-xs h-8 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          reviewMutation.mutate({ applicationId: app.id, status: "REJECTED" })
                        }
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
