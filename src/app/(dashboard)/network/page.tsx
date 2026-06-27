"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Users, Sparkles, Inbox } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function NetworkPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await fetch("/api/connections");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "ACCEPTED" | "REJECTED" }) => {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({
        title: action === "ACCEPTED" ? "Connection request accepted!" : "Connection request ignored",
      });
    },
    onError: () => toast({ title: "Action failed", variant: "destructive" }),
  });

  const connections = data?.data ?? [];
  const pending = connections.filter(
    (c: { status: string; receiverId: string }) =>
      c.status === "PENDING"
  );
  const accepted = connections.filter(
    (c: { status: string }) => c.status === "ACCEPTED"
  );

  return (
    <div className="space-y-8 select-none max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Network</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Manage your classmates and expand your campus network
        </p>
      </div>

      {/* Network Stats Cards */}
      <div className="grid gap-4 grid-cols-2">
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight">{accepted.length}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Connections</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight">{pending.length}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Pending Invites</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations list */}
      {pending.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Pending Invitations
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((conn: {
              id: string;
              receiverId: string;
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
              <Card key={conn.id} className="glass-card border border-slate-200/50 dark:border-slate-800/50 group overflow-hidden">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={`/profile/${conn.requester.id}`} className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                    <Avatar className="h-10 w-10 shrink-0 group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={conn.requester.profile?.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary text-white text-xs font-bold">
                        {getInitials(
                          conn.requester.profile?.firstName ?? "U",
                          conn.requester.profile?.lastName ?? "S"
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden flex-1 sm:flex-initial">
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {conn.requester.profile?.firstName}{" "}
                        {conn.requester.profile?.lastName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold truncate leading-none">
                        {conn.requester.profile?.headline}
                      </p>
                    </div>
                  </Link>
                  
                  <div className="flex items-center gap-1.5 shrink-0 justify-end w-full sm:w-auto">
                    <Button
                      variant="linkedin"
                      size="sm"
                      className="rounded-xl font-bold h-8 text-xs button-ripple"
                      onClick={() =>
                        respondMutation.mutate({ id: conn.id, action: "ACCEPTED" })
                      }
                      disabled={respondMutation.isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl font-semibold h-8 text-xs hover:bg-destructive/10 text-destructive"
                      onClick={() =>
                        respondMutation.mutate({ id: conn.id, action: "REJECTED" })
                      }
                      disabled={respondMutation.isPending}
                    >
                      Ignore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main connections grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Your Connections</h2>
        
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : accepted.length === 0 ? (
          <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
            <CardContent className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-muted-foreground">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Build Your Network</h3>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                You haven&apos;t connected with anyone yet. Explore the campus feed or use the search dock to add classmates, project partners, and peer groups!
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.04 } }
            }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {accepted.map((conn: {
              id: string;
              requester: { id: string; profile: { firstName: string; lastName: string; avatarUrl: string | null; department: string | null } | null };
              receiver: { id: string; profile: { firstName: string; lastName: string; avatarUrl: string | null; department: string | null } | null };
            }) => {
              const person = conn.requester.profile ? conn.requester : conn.receiver;
              return (
                <motion.div
                  key={conn.id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    show: { opacity: 1, scale: 1 }
                  }}
                >
                  <Link href={`/profile/${person.id}`}>
                    <Card className="glass-card hover-lift border border-slate-200/50 dark:border-slate-800/50 group cursor-pointer">
                      <CardContent className="flex items-center gap-3 p-4">
                        <Avatar className="h-11 w-11 ring-offset-background group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                          <AvatarImage src={person.profile?.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-primary text-white text-xs font-bold">
                            {getInitials(
                              person.profile?.firstName ?? "U",
                              person.profile?.lastName ?? "S"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {person.profile?.firstName} {person.profile?.lastName}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-semibold truncate leading-none mt-0.5">
                            {person.profile?.department ?? "Student"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
