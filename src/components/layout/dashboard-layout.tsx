import { Navbar } from "@/components/layout/navbar";
import type { User } from "next-auth";

export function DashboardLayout({ 
  children, 
  user 
}: { 
  children: React.ReactNode;
  user: User;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
