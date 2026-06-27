"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Shield,
  Eye,
  Palette,
  Bell,
  Trash2,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

type SettingsTab =
  | "account"
  | "security"
  | "privacy"
  | "appearance"
  | "notifications"
  | "danger";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  // Mock Form States
  const [username, setUsername] = useState(session?.user?.name ?? "Alex Kumar");
  const [email, setEmail] = useState(session?.user?.email ?? "alex.kumar@college.edu");
  const [showEmailNotifications, setShowEmailNotifications] = useState(true);
  const [showMatchSuggestions, setShowMatchSuggestions] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  const tabs = [
    { id: "account", label: "Account", icon: User, danger: false },
    { id: "security", label: "Security & Login", icon: Shield, danger: false },
    { id: "privacy", label: "Privacy", icon: Eye, danger: false },
    { id: "appearance", label: "Appearance", icon: Palette, danger: false },
    { id: "notifications", label: "Notifications", icon: Bell, danger: false },
    { id: "danger", label: "Danger Zone", icon: Trash2, danger: true },
  ] as const;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Settings saved successfully!" });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Customize your profile controls, configurations, and theme aesthetics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
        {/* Left Side: Settings Navigation tabs (horizontal scroll on mobile) */}
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50 p-1.5 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 md:flex-col md:space-y-1 md:gap-0 min-w-max md:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-auto md:w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? tab.danger
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                      : tab.danger
                      ? "text-destructive hover:bg-destructive/5"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right Side: Tab Panel Content */}
        <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                {/* ACCOUNT SECTION */}
                {activeTab === "account" && (
                  <form onSubmit={handleSave} className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Account Information</h3>
                      <p className="text-xs text-muted-foreground">Manage details relating to your student registry profile.</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="fullname" className="text-xs font-bold">Full Name</Label>
                        <Input
                          id="fullname"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="rounded-xl h-10 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs font-bold">College Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="rounded-xl h-10 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                      <Button type="submit" variant="linkedin" className="rounded-xl font-bold h-10 text-xs button-ripple">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                )}

                {/* SECURITY SECTION */}
                {activeTab === "security" && (
                  <form onSubmit={handleSave} className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Security & Login</h3>
                      <p className="text-xs text-muted-foreground">Update password keys and manage authentication credentials.</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="currpass" className="text-xs font-bold">Current Password</Label>
                        <Input
                          id="currpass"
                          type="password"
                          placeholder="••••••••"
                          className="rounded-xl h-10 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newpass" className="text-xs font-bold">New Password</Label>
                        <Input
                          id="newpass"
                          type="password"
                          placeholder="••••••••"
                          className="rounded-xl h-10 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                      <Button type="submit" variant="linkedin" className="rounded-xl font-bold h-10 text-xs button-ripple">
                        Update Password
                      </Button>
                    </div>
                  </form>
                )}

                {/* PRIVACY SECTION */}
                {activeTab === "privacy" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Privacy Controls</h3>
                      <p className="text-xs text-muted-foreground">Control who views your connection profiles and portfolios.</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                      {/* Toggle card 1 */}
                      <div className="flex items-center justify-between p-3 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40">
                        <div>
                          <p className="text-xs font-bold">Public Student Profile</p>
                          <p className="text-[10px] text-muted-foreground">Allow students outside your mutual circle to search your profile.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={profilePublic}
                          onChange={(e) => setProfilePublic(e.target.checked)}
                          className="h-4 w-8 bg-slate-200 text-primary border-slate-350 focus:ring-0 rounded cursor-pointer"
                        />
                      </div>

                      {/* Toggle card 2 */}
                      <div className="flex items-center justify-between p-3 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40">
                        <div>
                          <p className="text-xs font-bold">Teammate Recommendations</p>
                          <p className="text-[10px] text-muted-foreground">Allow AI matches to suggest you to teammate recruitment posts.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={showMatchSuggestions}
                          onChange={(e) => setShowMatchSuggestions(e.target.checked)}
                          className="h-4 w-8 bg-slate-200 text-primary border-slate-350 focus:ring-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* APPEARANCE SECTION */}
                {activeTab === "appearance" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Appearance System</h3>
                      <p className="text-xs text-muted-foreground">Tailor your interface theme styling logs.</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                      <Label className="text-xs font-bold">Select Interface Style</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Light Card */}
                        <div
                          onClick={() => setTheme("light")}
                          className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between h-24 hover-lift ${
                            theme === "light"
                              ? "border-primary bg-primary/5"
                              : "border-slate-200 dark:border-slate-800 bg-card"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">Light Mode</span>
                            {theme === "light" && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground">Soft backgrounds, high contrast text</span>
                        </div>

                        {/* Dark Card */}
                        <div
                          onClick={() => setTheme("dark")}
                          className={`p-4 rounded-2xl border cursor-pointer flex flex-col justify-between h-24 hover-lift ${
                            theme === "dark"
                              ? "border-primary bg-primary/5"
                              : "border-slate-200 dark:border-slate-800 bg-card"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">Dark Mode</span>
                            {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <span className="text-[10px] text-muted-foreground">Apple-like slate theme modes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTIFICATIONS SECTION */}
                {activeTab === "notifications" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-foreground">Notification Preferences</h3>
                      <p className="text-xs text-muted-foreground">Select how and when you receive collaboration updates.</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                      {/* Email alerts */}
                      <div className="flex items-center justify-between p-3 rounded-2xl border bg-slate-50/50 dark:bg-slate-950/40">
                        <div>
                          <p className="text-xs font-bold">Email Digest Alerts</p>
                          <p className="text-[10px] text-muted-foreground">Weekly summaries of connections and trending projects.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={showEmailNotifications}
                          onChange={(e) => setShowEmailNotifications(e.target.checked)}
                          className="h-4 w-8 bg-slate-200 text-primary border-slate-350 focus:ring-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* DANGER ZONE */}
                {activeTab === "danger" && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-destructive">Danger Zone</h3>
                      <p className="text-xs text-muted-foreground">Irreversible account termination processes.</p>
                    </div>

                    <div className="space-y-4 pt-2 border-t">
                      <div className="p-4 rounded-2xl border border-destructive/20 bg-destructive/5 space-y-3">
                        <h4 className="text-xs font-bold text-destructive">Delete My Campus Account</h4>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          This deletes your entire student registry record: connections list, owned projects, recruitment logs, and messages. This action is final and cannot be undone.
                        </p>
                        <Button
                          variant="ghost"
                          className="rounded-xl font-bold h-9 text-xs bg-destructive text-white hover:bg-destructive/95 button-ripple"
                          onClick={() => toast({ title: "Termination process holds a demo lock.", variant: "destructive" })}
                        >
                          Delete Account Permanently
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
