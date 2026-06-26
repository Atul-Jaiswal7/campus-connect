"use client";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function DashboardLayout({ 
  children 
}: { 
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky top navbar */}
      <Navbar />

      {/* Main shell split */}
      <div className="flex-1 flex relative">
        {/* Left Desktop Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* Content Wrapper */}
        <main className="flex-1 overflow-x-hidden pb-20 md:pb-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="container mx-auto px-4 py-6 md:px-6 md:py-8"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Bottom Nav for mobile screens */}
      <BottomNav />
    </div>
  );
}
