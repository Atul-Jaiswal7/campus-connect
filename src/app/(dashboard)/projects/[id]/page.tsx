"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Globe, ArrowLeft, Users2, Code2, ShieldAlert } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const project = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="glass-card max-w-xl mx-auto border border-red-500/10">
        <CardContent className="py-16 text-center flex flex-col items-center gap-3">
          <ShieldAlert className="h-10 w-10 text-destructive" />
          <p className="font-semibold text-muted-foreground">Project not found</p>
          <Link href="/projects">
            <Button size="sm" variant="outline" className="rounded-xl mt-2 font-bold">
              Back to Projects
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 select-none">
      {/* Back Button */}
      <div className="flex items-center">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Hub
          </Button>
        </Link>
      </div>

      {/* Main Showcase Panel */}
      <Card className="glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        {/* Banner Decoration */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-primary to-cyan-500 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[10px] font-extrabold tracking-widest text-white/50 uppercase rounded-full px-2 py-0.5 border border-white/20 backdrop-blur-xs">
            {project.type}
          </div>
        </div>

        <CardContent className="relative px-6 pb-6 pt-5 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20">
                {project.domain.replace("_", " ")}
              </span>
              <CardTitle className="text-2xl font-extrabold tracking-tight pt-1.5">{project.title}</CardTitle>
              <p className="text-xs text-muted-foreground font-semibold">
                Project owned by{" "}
                <Link
                  href={`/profile/${project.owner.id}`}
                  className="text-primary hover:underline font-bold"
                >
                  {project.owner.profile?.firstName} {project.owner.profile?.lastName}
                </Link>
              </p>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-3 shrink-0 text-xs font-bold text-muted-foreground">
              <span>{project.viewCount} views</span>
              <span>·</span>
              <span>{project.likeCount} likes</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-900 pt-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Description</h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground font-medium">{project.description}</p>
          </div>

          {/* Tech chips */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="h-4 w-4" />
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 border"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-xl font-bold h-10 px-4 text-xs gap-1.5 hover:bg-accent/40">
                  <Github className="h-4 w-4" />
                  GitHub Repository
                </Button>
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-xl font-bold h-10 px-4 text-xs gap-1.5 hover:bg-accent/40">
                  <Globe className="h-4 w-4" />
                  Live Deployment
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Collaborators list */}
      {project.members?.length > 0 && (
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users2 className="h-5 w-5 text-muted-foreground" />
              Project Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 pt-2">
            {project.members.map((m: {
              user: {
                id: string;
                profile: {
                  firstName: string;
                  lastName: string;
                  avatarUrl: string | null;
                } | null;
              };
              role: string;
            }) => (
              <Link
                key={m.user.id}
                href={`/profile/${m.user.id}`}
                className="flex items-center gap-3 rounded-2xl border p-3 hover:bg-accent/40 transition-colors cursor-pointer group"
              >
                <Avatar className="h-9 w-9 ring-offset-background group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={m.user.profile?.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary text-white text-xs font-bold">
                    {getInitials(
                      m.user.profile?.firstName ?? "U",
                      m.user.profile?.lastName ?? "S"
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {m.user.profile?.firstName} {m.user.profile?.lastName}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold truncate uppercase tracking-wider">{m.role}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
