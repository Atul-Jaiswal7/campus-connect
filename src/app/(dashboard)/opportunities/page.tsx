"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, MapPin, Building2, Pencil, Trash2, ExternalLink, Plus } from "lucide-react";
import { OPPORTUNITY_TYPES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";

export default function OpportunitiesPage() {
  const [type, setType] = useState("");
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["opportunities", type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : "";
      const res = await fetch(`/api/opportunities${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      toast({ title: "Opportunity deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete opportunity", variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this opportunity?")) {
      deleteMutation.mutate(id);
    }
  };

  const opportunities = data?.data ?? [];

  return (
    <div className="space-y-6 select-none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Opportunities</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Discover internships, hackathons, workshops, and research listings
          </p>
        </div>
        <Link href="/opportunities/new">
          <Button variant="linkedin" className="rounded-xl font-bold gap-1.5 shadow-md">
            <Plus className="h-4 w-4" />
            Post Opportunity
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={type === "" ? "linkedin" : "outline"}
          size="sm"
          onClick={() => setType("")}
          className="rounded-xl font-bold"
        >
          All
        </Button>
        {OPPORTUNITY_TYPES.map((t) => (
          <Button
            key={t.value}
            variant={type === t.value ? "linkedin" : "outline"}
            size="sm"
            onClick={() => setType(t.value)}
            className="rounded-xl font-bold"
          >
            {t.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-muted-foreground font-semibold text-xs">
            No opportunities available right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {opportunities.map((opp: {
            id: string;
            title: string;
            description: string;
            type: string;
            company: string | null;
            location: string | null;
            stipend: string | null;
            deadline: string | null;
            createdAt: string;
            postedById: string | null;
            applyUrl: string | null;
          }) => {
            const isOwner = session?.user?.id === opp.postedById;
            return (
              <Card key={opp.id} className="glass-card flex flex-col justify-between overflow-hidden relative">
                <div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base font-extrabold tracking-tight leading-snug">{opp.title}</CardTitle>
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider shrink-0 text-slate-600 dark:text-slate-400">
                        {opp.type.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    <p className="line-clamp-3 text-xs text-muted-foreground font-medium leading-relaxed">
                      {opp.description}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-bold">
                      {opp.company && (
                        <span className="flex items-center gap-1 text-slate-800 dark:text-slate-300">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {opp.company}
                        </span>
                      )}
                      {opp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {opp.location}
                        </span>
                      )}
                      {opp.stipend && <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold">{opp.stipend}</span>}
                    </div>
                  </CardContent>
                </div>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-900 pt-3">
                    <span className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-wide">
                      Posted {formatRelativeTime(opp.createdAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      {opp.applyUrl && (
                        <a href={opp.applyUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="linkedin" className="h-7 rounded-lg text-xs font-bold gap-1 px-2.5">
                            Apply <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                      {isOwner && (
                        <>
                          <Link href={`/opportunities/${opp.id}/edit`}>
                            <Button size="sm" variant="outline" className="h-7 rounded-lg text-xs font-bold p-1 w-7 border-slate-200 dark:border-slate-800">
                              <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 rounded-lg text-xs font-bold p-1 w-7"
                            onClick={() => handleDelete(opp.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

