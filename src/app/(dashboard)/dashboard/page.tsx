"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  Bookmark,
  Flame,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FolderKanban,
  Plus,
} from "lucide-react";
import type { DashboardStats } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

// Count-up helper component for metric counters
function CountUp({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setCount(end);
      return;
    }
    const duration = 1.2; // seconds
    const totalMiliseconds = duration * 1000;
    const intervalTime = 30; // ms
    const step = (end / totalMiliseconds) * intervalTime;

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useQuery<{ data: DashboardStats }>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });

  const stats = data?.data;

  const statCards = [
    { key: "profileViews", label: "Profile Views", icon: Eye, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
    { key: "connections", label: "Connections", icon: Users, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
    { key: "appliedProjects", label: "Applied Projects", icon: Briefcase, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
    { key: "savedOpportunities", label: "Saved Opportunities", icon: Bookmark, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
    { key: "unreadMessages", label: "Unread Messages", icon: MessageSquare, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
    { key: "unreadNotifications", label: "Notifications", icon: Bell, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  ] as const;

  return (
    <div className="space-y-8 select-none">
      {/* Dashboard Top Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground font-medium">Your college collaboration and networking statistics</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/projects/new">
            <Button size="sm" variant="linkedin" className="rounded-xl gap-1.5 font-bold button-ripple shadow-md">
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </Link>
          <Link href="/teams/new">
            <Button size="sm" variant="outline" className="rounded-xl font-bold hover:bg-accent/40">
              Recruit Team
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial="hidden" 
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.05 } }
          }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {statCards.map(({ key, label, icon: Icon, color }) => {
            const val = stats?.[key] ?? 0;
            return (
              <motion.div
                key={key}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <Card className="glass-card hover-lift border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      {label}
                    </CardTitle>
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-3xl font-extrabold tracking-tight">
                      <CountUp value={val} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Profile progress + engagement sections */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Profile Completion */}
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50 lg:col-span-8 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Profile Strength
            </CardTitle>
            <p className="text-xs text-muted-foreground">Complete your profiles to unlock AI matching logs</p>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Progress Checklist</span>
                <span className="text-primary">{stats?.profileCompletion ?? 0}% Completed</span>
              </div>
              
              {/* Premium Progress Bar */}
              <div className="h-4 w-full rounded-full bg-slate-200/60 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-800/40">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.profileCompletion ?? 0}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-primary via-indigo-500 to-accent shadow-inner"
                />
              </div>
            </div>

            {/* Completion tasks hint */}
            <div className="bg-slate-100/55 dark:bg-slate-900/40 rounded-xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-foreground">Next Suggested Milestone</h4>
                <p className="text-[11px] text-muted-foreground">Add certifications and upload a professional resume PDF.</p>
              </div>
              <Link href={`/profile/${session?.user?.id}`}>
                <Button size="sm" variant="ghost" className="text-primary hover:text-primary-dark font-bold gap-1 text-xs px-2 h-8">
                  Update Profile
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Streak */}
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50 lg:col-span-4 flex flex-col justify-between overflow-hidden relative">
          {/* Subtle background glow */}
          <div className="absolute right-[-10%] bottom-[-10%] h-32 w-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-500 animate-bounce" />
              Daily Streak
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600">
                <CountUp value={stats?.streakDays ?? 0} />
              </span>
              <span className="text-sm font-bold text-muted-foreground uppercase">days active</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal font-medium">
              Maintain your streak by signing in, posting projects, and engaging with peers daily!
            </p>
            <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-2/3" />
          </CardContent>
        </Card>
      </div>

      {/* Modular Quick Actions Dock */}
      <div className="space-y-4">
        <h3 className="text-base font-bold tracking-tight">Quick Connect Docks</h3>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          <Link href="/feed">
            <div className="p-4 rounded-2xl border bg-card hover-lift cursor-pointer flex flex-col items-center justify-center text-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Explore Feed</span>
            </div>
          </Link>
          <Link href="/network">
            <div className="p-4 rounded-2xl border bg-card hover-lift cursor-pointer flex flex-col items-center justify-center text-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Grow Network</span>
            </div>
          </Link>
          <Link href="/projects">
            <div className="p-4 rounded-2xl border bg-card hover-lift cursor-pointer flex flex-col items-center justify-center text-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderKanban className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Search Projects</span>
            </div>
          </Link>
          <Link href="/messages">
            <div className="p-4 rounded-2xl border bg-card hover-lift cursor-pointer flex flex-col items-center justify-center text-center gap-2 group">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-foreground">Direct Chat</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
