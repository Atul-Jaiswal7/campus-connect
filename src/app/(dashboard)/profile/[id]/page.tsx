"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ConnectButton } from "@/components/shared/connect-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  UserPlus,
  UserMinus,
  Github,
  Linkedin,
  ExternalLink,
  MapPin,
  Sparkles,
  Link2,
  Calendar,
  Building,
  Award,
  Users,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Profile not found");
      return res.json();
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to follow");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast({ title: "Follow status updated" });
    },
  });

  const messageMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to start conversation");
      return res.json();
    },
    onSuccess: (result) => {
      router.push(`/messages?conversation=${result.data.id}`);
    },
    onError: () => toast({ title: "Failed to open chat", variant: "destructive" }),
  });

  const profile = data?.data;
  const p = profile?.profile;
  const isOwn = profile?.isOwnProfile;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Card className="glass-card">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-6 w-full rounded-lg" />
            <Skeleton className="h-6 w-2/3 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || !p) {
    return (
      <Card className="glass-card max-w-xl mx-auto">
        <CardContent className="py-16 text-center text-muted-foreground font-semibold">
          Profile not found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 select-none">
      {/* Cover Header and Avatar profile section */}
      <Card className="glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
        <div className="h-44 bg-gradient-to-r from-primary via-indigo-600 to-accent relative overflow-hidden">
          {/* Subtle circles background */}
          <div className="absolute top-10 right-10 h-32 w-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-8 left-20 h-24 w-24 bg-white/5 rounded-full blur-lg" />
        </div>
        
        <CardContent className="relative px-6 pb-6 pt-2">
          {/* Avatar frame */}
          <div className="absolute -top-16 left-6 rounded-full p-1 bg-background shadow-md">
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage src={p.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary text-white text-3xl font-extrabold">
                {getInitials(p.firstName, p.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mt-14 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                {p.firstName} {p.lastName}
              </h1>
              {p.headline && (
                <p className="text-sm font-semibold text-muted-foreground">{p.headline}</p>
              )}
              
              {/* Dynamic location/details line */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 text-xs font-semibold text-muted-foreground">
                {p.department && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {p.department}
                  </span>
                )}
                {p.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Year {p.year}
                  </span>
                )}
                {p.hostel && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.hostel}
                  </span>
                )}
              </div>

              {/* Connections/Follower Counts */}
              <div className="flex gap-4 pt-3 text-xs font-bold">
                <span className="text-foreground">
                  <strong className="text-sm font-extrabold text-primary">{profile.connectionCount}</strong> connections
                </span>
                <span className="text-foreground">
                  <strong className="text-sm font-extrabold text-primary">{profile._count?.followers ?? 0}</strong> followers
                </span>
              </div>
            </div>

            {/* Action buttons (Connect/Message/Follow) */}
            {!isOwn && (
              <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                <ConnectButton
                  userId={userId}
                  connectionStatus={profile.connectionStatus}
                  size="default"
                />
                
                <Button
                  variant="outline"
                  className="rounded-xl font-bold hover:bg-accent/40 text-xs"
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinus className="mr-1.5 h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1.5 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl font-bold hover:bg-accent/40 text-xs"
                  onClick={() => messageMutation.mutate()}
                  disabled={messageMutation.isPending}
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Message
                </Button>
              </div>
            )}
          </div>

          {/* Badges pills (Apple tags style) */}
          <div className="mt-4 flex flex-wrap gap-2 pt-2">
            {p.openToWork && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold border border-emerald-200/50 dark:border-emerald-900/30">
                <Award className="h-3.5 w-3.5" />
                Open to Work
              </span>
            )}
            {p.openToTeam && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-bold border border-blue-200/50 dark:border-blue-900/30">
                <Users className="h-3.5 w-3.5" />
                Open to Team
              </span>
            )}
            {p.lookingForInternship && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-3 py-1 text-xs font-bold border border-purple-200/50 dark:border-purple-900/30">
                <Sparkles className="h-3.5 w-3.5" />
                Looking for Internship
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid wrapper for About / Links / Skills / Projects */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Side: About, Skills, Projects */}
        <div className="md:col-span-8 space-y-6">
          {/* About Bio */}
          {p.bio && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">{p.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {profile.ownedProjects?.length > 0 && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Showcase Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.ownedProjects.map((proj: { id: string; title: string; description: string; technologies: string[] }) => (
                  <Link key={proj.id} href={`/projects/${proj.id}`}>
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 transition-all hover:bg-accent/40 hover:shadow-md cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{proj.title}</h3>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground mt-1 font-medium leading-relaxed">{proj.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {proj.technologies.slice(0, 4).map((t: string) => (
                          <span key={t} className="text-[10px] font-bold tracking-tight rounded-full px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Skills, Social Links */}
        <div className="md:col-span-4 space-y-6">
          {/* Social Links */}
          {(p.githubUrl || p.linkedinUrl || p.portfolioUrl) && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <Github className="h-4 w-4" />
                      GitHub Profile
                    </Button>
                  </a>
                )}
                {p.linkedinUrl && (
                  <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </Button>
                  </a>
                )}
                {p.portfolioUrl && (
                  <a href={p.portfolioUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <ExternalLink className="h-4 w-4" />
                      Personal Portfolio
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills Badges */}
          {profile.skills?.length > 0 && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {profile.skills.map((s: { skill: { name: string }; level: string }) => (
                  <span
                    key={s.skill.name}
                    className="text-[11px] font-bold tracking-tight rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2.5 py-1"
                  >
                    {s.skill.name} <span className="text-muted-foreground font-medium">· {s.level.toLowerCase()}</span>
                  </span>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
