"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Clock, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConnectButtonProps {
  userId: string;
  connectionStatus?: string | null;
  size?: "sm" | "default";
  onSuccess?: () => void;
}

export function ConnectButton({
  userId,
  connectionStatus,
  size = "sm",
  onSuccess,
}: ConnectButtonProps) {
  const queryClient = useQueryClient();

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Connection request sent!" });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["suggested-users"] });
      onSuccess?.();
    },
    onError: (err: Error) => {
      toast({ title: err.message, variant: "destructive" });
    },
  });

  if (connectionStatus === "ACCEPTED") {
    return (
      <Button variant="outline" size={size} disabled>
        <UserCheck className="mr-2 h-4 w-4" />
        Connected
      </Button>
    );
  }

  if (connectionStatus === "PENDING") {
    return (
      <Button variant="outline" size={size} disabled>
        <Clock className="mr-2 h-4 w-4" />
        Pending
      </Button>
    );
  }

  return (
    <Button
      variant="linkedin"
      size={size}
      disabled={connectMutation.isPending}
      onClick={() => connectMutation.mutate()}
    >
      {connectMutation.isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      Connect
    </Button>
  );
}
