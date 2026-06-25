"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Users } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function NetworkPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await fetch("/api/connections");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const connections = data?.data ?? [];
  const pending = connections.filter(
    (c: { status: string }) => c.status === "PENDING"
  );
  const accepted = connections.filter(
    (c: { status: string }) => c.status === "ACCEPTED"
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Network</h1>
          <p className="text-muted-foreground">
            Manage your connections and grow your network
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-8 w-8 text-linkedin" />
              <div>
                <p className="text-2xl font-bold">{accepted.length}</p>
                <p className="text-sm text-muted-foreground">Connections</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="flex items-center gap-4 p-6">
              <UserPlus className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{pending.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {pending.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold">Pending Invitations</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {pending.map((conn: {
                id: string;
                requester: {
                  id: string;
                  profile: {
                    firstName: string;
                    lastName: string;
                    avatarUrl: string | null;
                    headline: string | null;
                  } | null;
                };
              }) => (
                <Card key={conn.id} className="glass-card">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={conn.requester.profile?.avatarUrl ?? undefined} />
                        <AvatarFallback className="bg-linkedin text-white">
                          {getInitials(
                            conn.requester.profile?.firstName ?? "U",
                            conn.requester.profile?.lastName ?? "S"
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {conn.requester.profile?.firstName}{" "}
                          {conn.requester.profile?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {conn.requester.profile?.headline}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="linkedin" size="sm">Accept</Button>
                      <Button variant="outline" size="sm">Ignore</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-lg font-semibold">Your Connections</h2>
            {accepted.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-8 text-center text-muted-foreground">
                  Start connecting with your classmates!
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accepted.map((conn: {
                  id: string;
                  requester: { id: string; profile: { firstName: string; lastName: string; avatarUrl: string | null; department: string | null } | null };
                  receiver: { id: string; profile: { firstName: string; lastName: string; avatarUrl: string | null; department: string | null } | null };
                }) => {
                  const person = conn.requester.profile ? conn.requester : conn.receiver;
                  return (
                    <Card key={conn.id} className="glass-card">
                      <CardContent className="flex items-center gap-3 p-4">
                        <Avatar>
                          <AvatarImage src={person.profile?.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-linkedin text-white">
                            {getInitials(
                              person.profile?.firstName ?? "U",
                              person.profile?.lastName ?? "S"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {person.profile?.firstName} {person.profile?.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {person.profile?.department}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
