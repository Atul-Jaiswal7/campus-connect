"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  FolderKanban,
  UsersRound,
  Briefcase,
  MessageSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

const navItems = [
  { href: "/feed", label: "Feed", icon: Home, badge: null },
  { href: "/network", label: "My Network", icon: Users, badge: "Pending" },
  { href: "/projects", label: "Projects", icon: FolderKanban, badge: null },
  { href: "/teams", label: "Teams", icon: UsersRound, badge: "Recruiting" },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase, badge: "New" },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: null },
  { href: "/notifications", label: "Notifications", icon: Bell, badge: null },
  { href: "/settings", label: "Settings", icon: Settings, badge: null },
];

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="hidden md:flex flex-col border-r bg-card h-[calc(100vh-3.5rem)] sticky top-14 z-30 select-none overflow-hidden"
    >
      <div className="flex-1 py-4 flex flex-col justify-between">
        {/* Navigation List */}
        <div className="space-y-6 px-3">
          {/* Quick Create Button (Linear-like) */}
          <div className="px-1">
            <Link href="/projects/new">
              <Button
                variant="linkedin"
                className={cn(
                  "w-full rounded-xl transition-all shadow-md duration-300 font-medium button-ripple gap-2 flex items-center justify-center",
                  collapsed ? "h-10 w-10 p-0" : "h-10 px-4"
                )}
              >
                <Plus className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-semibold truncate">New Project</span>}
              </Button>
            </Link>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/feed" && pathname.startsWith(item.href));
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                    
                    {!collapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}

                    {/* Subtly show dot or badges */}
                    {!collapsed && item.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground">
                        {item.badge}
                      </span>
                    )}

                    {/* Tooltip for collapsed mode */}
                    {collapsed && (
                      <div className="absolute left-16 bg-slate-950 text-slate-50 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-md">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="px-3 space-y-4">
          {/* AI Banner */}
          {!collapsed && (
            <div className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-xl space-y-2 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 h-12 w-12 bg-primary/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>CC Premium AI</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Unlock teammate matching and custom review.
              </p>
            </div>
          )}

          {/* Sidebar Toggle Chevron */}
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
