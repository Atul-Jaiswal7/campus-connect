"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Plus, Inbox, ClipboardList } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <div className="space-y-8 select-none">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Team Formation</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Find peer collaborators or recruit team candidates for your projects
          </p>
        </div>
        <Link href="/teams/new">
          <Button variant="linkedin" className="rounded-xl font-bold gap-1.5 button-ripple shadow-md">
            <Plus className="h-5 w-5" />
            Post Recruitment
          </Button>
        </Link>
      </div>

      {/* Recruitment list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : recruitments.length === 0 ? (
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-muted-foreground">
              <Inbox className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Active Recruitments</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              There are no recruitment openings posted on campus at the moment. Create a posting to find teammates for your startup, project, or hackathon!
            </p>
            <Link href="/teams/new">
              <Button size="sm" variant="linkedin" className="rounded-xl font-bold button-ripple mt-2">
                Post Team Recruitment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } }
          }}
          className="space-y-4"
        >
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
            <motion.div
              key={rec.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="glass-card hover-lift border border-slate-200/50 dark:border-slate-800/50 group overflow-hidden relative">
                {/* Horizontal left indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary to-indigo-500" />
                
                <CardHeader className="pb-2 pl-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <CardTitle className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {rec.title}
                      </CardTitle>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        by {rec.leader.profile?.firstName} {rec.leader.profile?.lastName} · {formatRelativeTime(rec.createdAt)}
                      </p>
                    </div>
                    {rec.hackathonName && (
                      <span className="inline-flex shrink-0 self-start text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                        {rec.hackathonName}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pl-6 pt-1">
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground font-medium">
                    {rec.problemStatement}
                  </p>

                  {/* Required Roles Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {rec.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold rounded-full bg-slate-100 dark:bg-slate-900 px-2.5 py-0.5 border"
                      >
                        {s.roleNeeded} · <span className="text-primary">{s.skill.name}</span>
                      </span>
                    ))}
                  </div>

                  {/* Footer items */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 dark:border-slate-900 pt-3.5">
                    <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
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
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" />
                        {rec._count.applications} applications
                      </span>
                    </div>

                    <Link href={`/teams/${rec.id}`}>
                      <Button variant="outline" size="sm" className="rounded-xl font-bold h-9 hover:bg-primary/10 hover:text-primary hover:border-primary/20 text-xs">
                        View Details & Apply
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
