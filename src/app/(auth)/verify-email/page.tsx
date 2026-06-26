"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push("/feed"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-linkedin/5 to-background p-4">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-linkedin/10">
            <GraduationCap className="h-6 w-6 text-linkedin" />
          </div>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-linkedin border-t-transparent" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <div>
                <h3 className="text-lg font-semibold">Email Verified!</h3>
                <p className="text-sm text-muted-foreground">
                  Redirecting you to your dashboard...
                </p>
              </div>
              <Button onClick={() => router.push("/feed")}>Go to Dashboard</Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <XCircle className="mx-auto h-16 w-16 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Verification Failed</h3>
                <p className="text-sm text-muted-foreground">
                  The verification link is invalid or has expired.
                </p>
              </div>
              <Button onClick={() => router.push("/login")}>Back to Login</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
