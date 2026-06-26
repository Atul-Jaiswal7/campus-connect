"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  UsersRound,
  MessageSquare,
  Plus,
  X,
  FilePlus,
  UserPlus2,
  PenTool,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/network", label: "Network", icon: Users },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/teams", label: "Teams", icon: UsersRound },
  ];

  return (
    <>
      {/* Quick Action Overlay Menu */}
      <AnimatePresence>
        {menuOpen && (
          <div className="fixed inset-0 z-40">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Menu Box */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="absolute bottom-20 left-4 right-4 bg-card border shadow-2xl rounded-2xl p-4 overflow-hidden z-50 glass"
            >
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground px-2">Quick Actions</h3>
              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/projects/new"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-accent/80 transition-colors text-center text-xs gap-1.5"
                >
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <FilePlus className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-foreground">New Project</span>
                </Link>

                <Link
                  href="/teams/new"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-accent/80 transition-colors text-center text-xs gap-1.5"
                >
                  <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
                    <UserPlus2 className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-foreground">Recruit</span>
                </Link>

                <Link
                  href="/feed"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-accent/80 transition-colors text-center text-xs gap-1.5"
                >
                  <div className="h-10 w-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-foreground">Post Feed</span>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action Button & Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/90 backdrop-blur-md border-t z-40 px-4 pb-safe-bottom flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.06)]">
        {/* Left tabs (2 items) */}
        <div className="flex w-[40%] justify-around">
          {tabs.slice(0, 2).map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href !== "/feed" && pathname.startsWith(tab.href));
            return (
              <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center py-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Center Floating Action Button (FAB) */}
        <div className="relative -top-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-colors duration-300 relative z-50 button-ripple",
              menuOpen ? "bg-slate-800 dark:bg-slate-700" : "bg-primary"
            )}
          >
            <AnimatePresence mode="wait">
              {menuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="add"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Plus className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Right tabs (2 items) */}
        <div className="flex w-[40%] justify-around">
          {tabs.slice(2, 4).map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || (tab.href !== "/feed" && pathname.startsWith(tab.href));
            return (
              <Link key={tab.href} href={tab.href} className="flex flex-col items-center justify-center py-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
