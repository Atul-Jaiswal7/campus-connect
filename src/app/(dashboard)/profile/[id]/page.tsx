"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
  Briefcase,
  MapPin,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { data: session } = useSession();
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
      <>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="mt-4 h-32 w-full rounded-xl" />
      </>
    );
  }

  if (!profile || !p) {
    return (
      <Card className="glass-card">
        <CardContent className="py-12 text-center">Profile not found</CardContent>
      </Card>
    );
  }

  return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Cover + Avatar */}
        <Card className="glass-card overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-linkedin to-linkedin-dark" />
          <CardContent className="relative px-6 pb-6">
            <Avatar className="absolute -top-12 h-24 w-24 border-4 border-background">
              <AvatarImage src={p.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-linkedin text-white text-2xl">
                {getInitials(p.firstName, p.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {p.firstName} {p.lastName}
                </h1>
                {p.headline && (
                  <p className="text-muted-foreground">{p.headline}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  {p.department && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {p.department}
                    </span>
                  )}
                  {p.year && <span>Year {p.year}</span>}
                  {p.hostel && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {p.hostel}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex gap-4 text-sm">
                  <span>
                    <strong>{profile.connectionCount}</strong> connections
                  </span>
                  <span>
                    <strong>{profile._count?.followers ?? 0}</strong> followers
                  </span>
                </div>
              </div>

              {!isOwn && (
                <div className="flex flex-wrap gap-2">
                  <ConnectButton
                    userId={userId}
                    connectionStatus={profile.connectionStatus}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                  >
                    {profile.isFollowing ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => messageMutation.mutate()}
                    disabled={messageMutation.isPending}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message
                  </Button>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {p.openToWork && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Open to Work
                </span>
              )}
              {p.openToTeam && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Open to Team
                </span>
              )}
              {p.lookingForInternship && (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  Looking for Internship
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About */}
        {p.bio && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{p.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s: { skill: { name: string }; level: string }) => (
                  <span
                    key={s.skill.name}
                    className="rounded-full bg-linkedin/10 px-3 py-1 text-sm text-linkedin"
                  >
                    {s.skill.name} · {s.level.toLowerCase()}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links */}
        {(p.githubUrl || p.linkedinUrl || p.portfolioUrl) && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              )}
              {p.linkedinUrl && (
                <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </Button>
                </a>
              )}
              {p.portfolioUrl && (
                <a href={p.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Portfolio
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projects */}
        {profile.ownedProjects?.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.ownedProjects.map((proj: { id: string; title: string; description: string; technologies: string[] }) => (
                <Link key={proj.id} href={`/projects/${proj.id}`}>
                  <div className="rounded-lg border p-4 transition-colors hover:bg-accent">
                    <h3 className="font-semibold">{proj.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{proj.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {proj.technologies.slice(0, 4).map((t: string) => (
                        <span key={t} className="text-xs text-linkedin">
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
  );
}
