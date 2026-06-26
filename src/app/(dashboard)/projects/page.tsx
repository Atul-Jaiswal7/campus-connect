"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Github, ExternalLink, Filter, FolderPlus, Compass } from "lucide-react";
import { PROJECT_DOMAINS } from "@/lib/constants";
import { motion } from "framer-motion";

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
    <div className="space-y-8 select-none">
      {/* Header Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Project Hub</h1>
          <p className="text-sm text-muted-foreground font-medium">Discover and showcase peer collaborations on campus</p>
        </div>
        <Link href="/projects/new">
          <Button variant="linkedin" className="rounded-xl font-bold gap-1.5 button-ripple shadow-md">
            <FolderPlus className="h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>

      {/* Filter Row (Apple/Linear controls) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search projects, technologies..."
            className="pl-10 h-10 rounded-xl bg-card border border-slate-200 dark:border-slate-800 focus:border-primary/20 text-xs font-semibold focus:ring-4 focus:ring-primary/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-card border rounded-xl px-2 h-10 shadow-sm">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              className="bg-transparent border-0 text-xs font-bold text-muted-foreground focus:ring-0 cursor-pointer outline-none"
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
          </div>

          <div className="flex items-center gap-2 bg-card border rounded-xl px-2 h-10 shadow-sm">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              className="bg-transparent border-0 text-xs font-bold text-muted-foreground focus:ring-0 cursor-pointer outline-none"
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
        </div>
      </div>

      {/* Grid of Projects */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-muted-foreground">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Projects Found</h3>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
              We couldn&apos;t find any projects matching your filters. Be the pioneer on campus and post your academic work!
            </p>
            <Link href="/projects/new">
              <Button size="sm" variant="linkedin" className="rounded-xl font-bold button-ripple mt-2">
                Share New Project
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
            show: { transition: { staggerChildren: 0.05 } }
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
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
            <motion.div
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 15 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="glass-card hover-lift border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between h-full group relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <span className="text-[10px] font-extrabold uppercase tracking-wide rounded-full px-2 py-0.5 bg-primary/10 text-primary shrink-0 border border-primary/20">
                      {project.domain.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-0.5">
                    by {project.owner.profile?.firstName} {project.owner.profile?.lastName}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between pt-1">
                  <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground font-medium">
                    {project.description}
                  </p>
                  
                  <div className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 4).map((tech: string) => (
                        <span
                          key={tech}
                          className="text-[9px] font-bold rounded-full bg-slate-100 dark:bg-slate-900 px-2 py-0.5 border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-900">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full rounded-xl font-bold h-9 hover:bg-accent/40 text-xs gap-1">
                          <ExternalLink className="h-3.5 w-3.5" />
                          View Details
                        </Button>
                      </Link>
                      {project.githubUrl && (
                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 border text-muted-foreground hover:text-foreground">
                            <Github className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
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
