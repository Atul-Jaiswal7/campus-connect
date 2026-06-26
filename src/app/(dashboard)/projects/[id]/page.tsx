"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, ExternalLink } from "lucide-react";
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
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (!project) {
    return <Card><CardContent className="py-12 text-center">Project not found</CardContent></Card>;
  }

  return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <Link
                  href={`/profile/${project.owner.id}`}
                  className="text-sm text-linkedin hover:underline"
                >
                  by {project.owner.profile?.firstName} {project.owner.profile?.lastName}
                </Link>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-sm">
                {project.domain}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="rounded-full bg-linkedin/10 px-3 py-1 text-sm text-linkedin"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Live Demo
                  </Button>
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {project.viewCount} views · {project.likeCount} likes · {project.members?.length ?? 0} members
            </p>
          </CardContent>
        </Card>

        {project.members?.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-accent"
                >
                  <Avatar>
                    <AvatarImage src={m.user.profile?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-linkedin text-white">
                      {getInitials(
                        m.user.profile?.firstName ?? "U",
                        m.user.profile?.lastName ?? "S"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {m.user.profile?.firstName} {m.user.profile?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
  );
}
