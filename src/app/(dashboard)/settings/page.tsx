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
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

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
  const { data: session, update } = useSession();

  // Form States
  const [username, setUsername] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showEmailNotifications, setShowEmailNotifications] = useState(true);
  const [showMatchSuggestions, setShowMatchSuggestions] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [deletePassword, setDeletePassword] = useState("");

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Settings saved successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      const res = await fetch("/api/settings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("Failed to delete account");
      return res.json();
    },
    onSuccess: async () => {
      toast({ title: "Account deleted successfully" });
      await signOut({ callbackUrl: "/" });
    },
    onError: () => {
      toast({ title: "Failed to delete account. Check your password.", variant: "destructive" });
    },
  });

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({ emailNotifications: showEmailNotifications });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast({ title: "Please fill in all password fields", variant: "destructive" });
      return;
    }
    // Password change would need a separate API endpoint
    toast({ title: "Password change requires additional verification" });
  };

  const handleSavePrivacy = () => {
    updateSettingsMutation.mutate({ matchSuggestions: showMatchSuggestions, profilePublic });
  };

  const handleSaveNotifications = () => {
    updateSettingsMutation.mutate({ emailNotifications: showEmailNotifications });
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast({ title: "Please enter your password to confirm", variant: "destructive" });
      return;
    }
    if (!confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }
    deleteAccountMutation.mutate(deletePassword);
  };

  const tabs = [
    { id: "account", label: "Account", icon: User, danger: false },
    { id: "security", label: "Security & Login", icon: Shield, danger: false },
    { id: "privacy", label: "Privacy", icon: Eye, danger: false },
    { id: "appearance", label: "Appearance", icon: Palette, danger: false },
    { id: "notifications", label: "Notifications", icon: Bell, danger: false },
    { id: "danger", label: "Danger Zone", icon: Trash2, danger: true },
  ] as const;

  return (
    <div className="mx-auto max-w-4xl space-y-8 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Customize your profile controls, configurations, and theme aesthetics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr] items-start">
        {/* Left Side: Settings Navigation tabs */}
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
                  <form onSubmit={handleSaveAccount} className="space-y-5">
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
                      <Button 
                        type="submit" 
                        variant="linkedin" 
                        className="rounded-xl font-bold h-10 text-xs button-ripple"
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? (
                          <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Saving...</>
                        ) : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                )}

                {/* SECURITY SECTION */}
                {activeTab === "security" && (
                  <form onSubmit={handleSavePassword} className="space-y-5">
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
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="rounded-xl h-10 border border-slate-200 dark:border-slate-800 text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newpass" className="text-xs font-bold">New Password</Label>
                        <Input
                          id="newpass"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
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

                    <div className="pt-4 border-t flex justify-end">
                      <Button 
                        onClick={handleSavePrivacy}
                        variant="linkedin" 
                        className="rounded-xl font-bold h-10 text-xs button-ripple"
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? (
                          <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Saving...</>
                        ) : "Save Privacy Settings"}
                      </Button>
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

                    <div className="pt-4 border-t flex justify-end">
                      <Button 
                        onClick={handleSaveNotifications}
                        variant="linkedin" 
                        className="rounded-xl font-bold h-10 text-xs button-ripple"
                        disabled={updateSettingsMutation.isPending}
                      >
                        {updateSettingsMutation.isPending ? (
                          <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Saving...</>
                        ) : "Save Notification Settings"}
                      </Button>
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
                        <div className="space-y-2">
                          <Input
                            type="password"
                            placeholder="Enter your password to confirm"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            className="rounded-xl h-10 border border-destructive/30 text-xs font-semibold"
                          />
                          <Button
                            variant="destructive"
                            className="rounded-xl font-bold h-9 text-xs button-ripple w-full"
                            onClick={handleDeleteAccount}
                            disabled={deleteAccountMutation.isPending}
                          >
                            {deleteAccountMutation.isPending ? (
                              <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Deleting...</>
                            ) : "Delete Account Permanently"}
                          </Button>
                        </div>
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

