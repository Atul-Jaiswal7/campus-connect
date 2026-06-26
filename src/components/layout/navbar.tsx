"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Moon,
  Sun,
  Bell,
  MessageSquare,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const nameParts = session?.user?.name?.split(" ") ?? ["U", "S"];

  // Fetch unread counts for message / notification badges
  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return { unreadCount: 0 };
      return res.json();
    },
    enabled: !!session,
    refetchInterval: 15000,
  });

  const { data: messagesData } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/messages");
      if (!res.ok) return { data: [] };
      return res.json();
    },
    enabled: !!session,
    refetchInterval: 15000,
  });

  const unreadNotifications = notifData?.unreadCount ?? 0;
  
  // Calculate unread message count
  const unreadMessagesCount = messagesData?.data?.filter((c: { messages?: Array<{ senderId: string; isRead: boolean }> }) => {
    // Basic unread state check
    return c.messages?.[0] && c.messages[0].senderId !== session?.user?.id && !c.messages[0].isRead;
  })?.length ?? 0;

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => setProfileOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-lg hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation();
              setMobileDrawerOpen(!mobileDrawerOpen);
            }}
          >
            {mobileDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/feed" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="hidden font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent sm:inline tracking-tight text-lg">
              Campus Connect
            </span>
          </Link>

          {/* Desktop Search Bar (Apple-style) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex relative items-center max-w-xs w-64 group"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="h-9 w-full rounded-full bg-accent/50 pl-9 pr-4 text-xs font-medium border border-transparent focus:bg-background focus:border-primary/20 transition-all outline-none"
            />
          </form>
        </div>

        {/* Right Side: Navigation Badges & User Sessions */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              {/* Messages Link */}
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-accent">
                  <MessageSquare className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </Link>

              {/* Notifications Link */}
              <Link href="/notifications">
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-accent">
                  <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Dark mode switch */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg hover:bg-accent"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground hover:text-foreground" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground hover:text-foreground" />
              </Button>

              {/* Profile Avatar Dropdown */}
              <div className="relative">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfileOpen(!profileOpen);
                  }}
                  className="cursor-pointer ring-offset-background hover:ring-2 hover:ring-primary/20 rounded-full transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? undefined} />
                    <AvatarFallback className="bg-primary text-white text-xs font-bold">
                      {getInitials(nameParts[0] ?? "U", nameParts[1] ?? "S")}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Glassmorphic Dropdown Panel */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border shadow-xl p-2 z-50 glass"
                    >
                      <div className="px-3 py-2 border-b">
                        <p className="text-xs text-muted-foreground">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-foreground">{session.user.name}</p>
                        <p className="text-xs truncate text-muted-foreground">{session.user.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href={`/profile/${session.user.id}`}>
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                            <Users className="h-4 w-4" />
                            <span>My Profile</span>
                          </div>
                        </Link>
                        <Link href="/settings">
                          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent/60 transition-colors cursor-pointer">
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </div>
                        </Link>
                      </div>
                      <div className="border-t pt-1">
                        <div
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="linkedin" size="sm" className="rounded-full">Join Now</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Notion/Discord menu) */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Slide Sheet */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-80 max-w-[85vw] h-full bg-card border-r shadow-2xl flex flex-col p-5"
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-foreground tracking-tight">CC Mobile</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search campus..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="h-9 w-full rounded-full bg-accent/60 pl-9 pr-4 text-xs font-medium border border-transparent focus:bg-background focus:border-primary/20 transition-all outline-none"
                />
              </form>

              {/* Navigation list */}
              <div className="flex-1 space-y-2">
                <Link
                  href="/feed"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname.startsWith("/feed") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Menu className="h-5 w-5" />
                  <span>Dashboard Feed</span>
                </Link>
                <Link
                  href="/network"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname.startsWith("/network") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Users className="h-5 w-5" />
                  <span>Network</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    pathname.startsWith("/settings") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
              </div>

              {/* User bottom metadata */}
              {session && (
                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback className="bg-primary text-white text-xs font-bold">
                        {getInitials(nameParts[0] ?? "U", nameParts[1] ?? "S")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden max-w-[120px]">
                      <p className="text-sm font-semibold truncate">{session.user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{session.user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-9 w-9 rounded-lg hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
