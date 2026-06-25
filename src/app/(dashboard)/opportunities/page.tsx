"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, MapPin, Building2 } from "lucide-react";
import { OPPORTUNITY_TYPES } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/utils";

export default function OpportunitiesPage() {
  const [type, setType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["opportunities", type],
    queryFn: async () => {
      const params = type ? `?type=${type}` : "";
      const res = await fetch(`/api/opportunities${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const opportunities = data?.data ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Internships, hackathons, workshops, and more
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={type === "" ? "linkedin" : "outline"}
            size="sm"
            onClick={() => setType("")}
          >
            All
          </Button>
          {OPPORTUNITY_TYPES.map((t) => (
            <Button
              key={t.value}
              variant={type === t.value ? "linkedin" : "outline"}
              size="sm"
              onClick={() => setType(t.value)}
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
            <CardContent className="py-12 text-center text-muted-foreground">
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
            }) => (
              <Card key={opp.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{opp.title}</CardTitle>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize">
                      {opp.type.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {opp.description}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {opp.company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {opp.company}
                      </span>
                    )}
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {opp.location}
                      </span>
                    )}
                    {opp.stipend && <span>{opp.stipend}</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Posted {formatRelativeTime(opp.createdAt)}
                    </span>
                    <Button variant="outline" size="sm">
                      <Bookmark className="mr-1 h-3 w-3" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
