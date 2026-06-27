"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, User, Briefcase, Code2, Award, MessageSquare, Users } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchTerm, type],
    queryFn: async () => {
      if (!searchTerm) return { data: {} };
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchTerm)}&type=${type}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
    enabled: !!searchTerm,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const results = data?.data ?? {};

  const searchTypes = [
    { value: "all", label: "All" },
    { value: "student", label: "Students", icon: User },
    { value: "project", label: "Projects", icon: Briefcase },
    { value: "skill", label: "Skills", icon: Code2 },
    { value: "club", label: "Clubs", icon: Award },
    { value: "opportunity", label: "Opportunities", icon: Code2 },
    { value: "post", label: "Posts", icon: MessageSquare },
    { value: "team", label: "Teams", icon: Users },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Search Campus Connect</h1>
        <p className="text-sm text-muted-foreground font-medium">Find students, projects, teams, opportunities, and more</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for anything..."
            className="pl-10 rounded-xl font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" variant="linkedin" className="rounded-xl font-bold">
          Search
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {searchTypes.map((t) => {
          const Icon = t.icon;
          return (
            <Button
              key={t.value}
              variant={type === t.value ? "linkedin" : "outline"}
              size="sm"
              onClick={() => setType(t.value)}
              className="rounded-xl font-bold gap-1.5"
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {t.label}
            </Button>
          );
        })}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground font-semibold">Searching...</p>
        </div>
      )}

      {!isLoading && searchTerm && Object.keys(results).length === 0 && (
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground font-semibold">No results found for "{searchTerm}"</p>
          </CardContent>
        </Card>
      )}

      {/* Students */}
      {results.students && (results.students as Array<any>).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4" /> Students
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(results.students as Array<any>).map((s) => (
              <Link key={s.id} href={`/profile/${s.id}`}>
                <Card className="glass-card hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={s.profile?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary text-white text-xs font-bold">
                        {getInitials(s.profile?.firstName ?? "U", s.profile?.lastName ?? "S")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">
                        {s.profile?.firstName} {s.profile?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium truncate">
                        {s.profile?.department} · Year {s.profile?.year}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {results.projects && (results.projects as Array<any>).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Projects
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(results.projects as Array<any>).map((p) => (
              <Link key={p.id} href={`/projects/${p.id}`}>
                <Card className="glass-card hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800/50">
                  <CardContent className="p-4">
                    <p className="font-bold text-sm text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      by {p.owner?.profile?.firstName} {p.owner?.profile?.lastName}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {results.posts && (results.posts as Array<any>).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Posts
          </h2>
          <div className="space-y-2">
            {(results.posts as Array<any>).map((p) => (
              <Link key={p.id} href={`/feed`}>
                <Card className="glass-card hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.author?.profile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-primary text-white text-xs font-bold">
                          {getInitials(p.author?.profile?.firstName ?? "U", p.author?.profile?.lastName ?? "S")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-foreground">
                          {p.author?.profile?.firstName} {p.author?.profile?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium line-clamp-2 mt-1">
                          {p.content}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      {results.teams && (results.teams as Array<any>).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4" /> Teams
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(results.teams as Array<any>).map((t) => (
              <Link key={t.id} href={`/teams/${t.id}`}>
                <Card className="glass-card hover:shadow-md transition-all cursor-pointer border border-slate-200/50 dark:border-slate-800/50">
                  <CardContent className="p-4">
                    <p className="font-bold text-sm text-foreground truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                      by {t.leader?.profile?.firstName} {t.leader?.profile?.lastName}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {results.opportunities && (results.opportunities as Array<any>).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4" /> Opportunities
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(results.opportunities as Array<any>).map((o) => (
              <Card key={o.id} className="glass-card border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                  <p className="font-bold text-sm text-foreground truncate">{o.title}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {o.company} · {o.type.toLowerCase().replace("_", " ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {results.skills && (results.skills as Array<any>).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Code2 className="h-4 w-4" /> Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {(results.skills as Array<any>).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border"
              >
                {s.name}
                <span className="text-muted-foreground text-[10px]">({s._count?.userSkills || 0})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clubs */}
      {results.clubs && (results.clubs as Array<any>).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4" /> Clubs
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(results.clubs as Array<any>).map((c) => (
              <Card key={c.id} className="glass-card border border-slate-200/50 dark:border-slate-800/50">
                <CardContent className="p-4">
                  <p className="font-bold text-sm text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{c.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
