"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

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

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">Search Campus Connect</h1>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students, projects, skills..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="linkedin">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {["all", "student", "project", "skill", "club", "opportunity"].map((t) => (
            <Button
              key={t}
              variant={type === t ? "linkedin" : "outline"}
              size="sm"
              onClick={() => setType(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {isLoading && <p className="text-muted-foreground">Searching...</p>}

        {results.students && (results.students as Array<{ id: string; profile: { firstName: string; lastName: string; department: string | null } | null }>).length > 0 && (
          <div>
            <h2 className="mb-3 font-semibold">Students</h2>
            <div className="space-y-2">
              {(results.students as Array<{ id: string; profile: { firstName: string; lastName: string; department: string | null } | null }>).map((s) => (
                <Link key={s.id} href={`/profile/${s.id}`}>
                  <Card className="glass-card hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <p className="font-medium">
                        {s.profile?.firstName} {s.profile?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {s.profile?.department}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {results.projects && (results.projects as Array<{ id: string; title: string }>).length > 0 && (
          <div>
            <h2 className="mb-3 font-semibold">Projects</h2>
            <div className="space-y-2">
              {(results.projects as Array<{ id: string; title: string }>).map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`}>
                  <Card className="glass-card hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <p className="font-medium">{p.title}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
