"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Github, ExternalLink } from "lucide-react";
import { PROJECT_DOMAINS } from "@/lib/constants";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("");
  const [type, setType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["projects", search, domain, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (domain) params.set("domain", domain);
      if (type) params.set("type", type);
      const res = await fetch(`/api/projects?${params}`);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const projects = data?.data ?? [];

  return (
    <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Project Hub</h1>
            <p className="text-muted-foreground">Discover and showcase campus projects</p>
          </div>
          <Link href="/projects/new">
            <Button variant="linkedin">Create Project</Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          >
            <option value="">All Domains</option>
            {PROJECT_DOMAINS.map((d) => (
              <option key={d} value={d}>
                {d.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="COLLEGE">College</option>
            <option value="OPEN_SOURCE">Open Source</option>
            <option value="STARTUP">Startup</option>
            <option value="HACKATHON">Hackathon</option>
            <option value="RESEARCH">Research</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center text-muted-foreground">
              No projects found. Be the first to showcase your work!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project: {
              id: string;
              title: string;
              description: string;
              domain: string;
              type: string;
              technologies: string[];
              githubUrl: string | null;
              owner: { profile: { firstName: string; lastName: string } | null };
            }) => (
              <Card key={project.id} className="glass-card transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                      {project.domain}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    by {project.owner.profile?.firstName} {project.owner.profile?.lastName}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.slice(0, 4).map((tech: string) => (
                      <span
                        key={tech}
                        className="rounded-full bg-linkedin/10 px-2 py-0.5 text-xs text-linkedin"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/projects/${project.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="mr-1 h-3 w-3" />
                        View
                      </Button>
                    </Link>
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Github className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
  );
}
