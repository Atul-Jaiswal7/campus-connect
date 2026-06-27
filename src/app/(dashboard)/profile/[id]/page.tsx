"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, use } from "react";
import { ConnectButton } from "@/components/shared/connect-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  UserPlus,
  UserMinus,
  Github,
  Linkedin,
  ExternalLink,
  MapPin,
  Sparkles,
  Link2,
  Calendar,
  Building,
  Award,
  Users,
  Pencil,
  Trash2,
  Plus,
  Upload,
  Loader2,
  Briefcase,
  BookOpen,
  Check,
  X,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState(1);
  const [hostel, setHostel] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [codeforcesUrl, setCodeforcesUrl] = useState("");
  const [openToWork, setOpenToWork] = useState(false);
  const [openToTeam, setOpenToTeam] = useState(false);
  const [lookingForInternship, setLookingForInternship] = useState(false);

  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error("Profile not found");
      return res.json();
    },
  });

  const profile = data?.data;
  const p = profile?.profile;
  const isOwn = profile?.isOwnProfile;

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to follow");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast({ title: "Follow status updated" });
    },
  });

  const messageMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to start conversation");
      return res.json();
    },
    onSuccess: (result) => {
      router.push(`/messages?conversation=${result.data.id}`);
    },
    onError: () => toast({ title: "Failed to open chat", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast({ title: "Profile updated successfully!" });
      setIsEditing(false);
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const handleEditClick = () => {
    if (!profile || !p) return;
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setHeadline(p.headline ?? "");
    setBio(p.bio ?? "");
    setAvatarUrl(p.avatarUrl ?? "");
    setCoverUrl(p.coverUrl ?? "");
    setDepartment(p.department ?? "");
    setYear(p.year ?? 1);
    setHostel(p.hostel ?? "");
    setRollNumber(p.rollNumber ?? "");
    setPhone(p.phone ?? "");
    setResumeUrl(p.resumeUrl ?? "");
    setPortfolioUrl(p.portfolioUrl ?? "");
    setGithubUrl(p.githubUrl ?? "");
    setLinkedinUrl(p.linkedinUrl ?? "");
    setLeetcodeUrl(p.leetcodeUrl ?? "");
    setCodeforcesUrl(p.codeforcesUrl ?? "");
    setOpenToWork(p.openToWork);
    setOpenToTeam(p.openToTeam);
    setLookingForInternship(p.lookingForInternship);

    setSkills(profile.skills?.map((s: any) => s.skill.name) ?? []);
    setExperiences(
      profile.experiences?.map((e: any) => ({
        id: e.id,
        title: e.title,
        company: e.company,
        location: e.location ?? "",
        description: e.description ?? "",
        startDate: e.startDate ? e.startDate.split("T")[0] : "",
        endDate: e.endDate ? e.endDate.split("T")[0] : "",
        isCurrent: e.isCurrent,
      })) ?? []
    );
    setEducations(
      profile.educations?.map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field ?? "",
        startDate: edu.startDate ? edu.startDate.split("T")[0] : "",
        endDate: edu.endDate ? edu.endDate.split("T")[0] : "",
        grade: edu.grade ?? "",
        description: edu.description ?? "",
      })) ?? []
    );

    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "avatar") setUploadingAvatar(true);
    if (type === "cover") setUploadingCover(true);
    if (type === "resume") setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.success) {
        if (type === "avatar") setAvatarUrl(data.url);
        if (type === "cover") setCoverUrl(data.url);
        if (type === "resume") setResumeUrl(data.url);
        toast({ title: "File uploaded successfully!" });
      }
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      setUploadingCover(false);
      setUploadingResume(false);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      firstName,
      lastName,
      headline,
      bio,
      avatarUrl,
      coverUrl,
      department,
      year,
      hostel,
      rollNumber,
      phone,
      resumeUrl,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      leetcodeUrl,
      codeforcesUrl,
      openToWork,
      openToTeam,
      lookingForInternship,
      skills,
      experiences,
      educations,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Card className="glass-card">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-6 w-full rounded-lg" />
            <Skeleton className="h-6 w-2/3 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || !p) {
    return (
      <Card className="glass-card max-w-xl mx-auto">
        <CardContent className="py-16 text-center text-muted-foreground font-semibold">
          Profile not found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 select-none relative">
      {/* Cover Header and Avatar profile section */}
      <Card className="glass-card overflow-hidden border border-slate-200/50 dark:border-slate-800/50 relative">
        <div className="h-44 bg-gradient-to-r from-primary via-indigo-600 to-accent relative overflow-hidden">
          {p.coverUrl ? (
            <img src={p.coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" />
          )}
          <div className="absolute top-10 right-10 h-32 w-32 bg-white/10 rounded-full blur-xl" />
        </div>

        <CardContent className="relative px-6 pb-6 pt-2">
          {/* Avatar frame */}
          <div className="absolute -top-16 left-6 rounded-full p-1 bg-background shadow-md">
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage src={p.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary text-white text-3xl font-extrabold">
                {getInitials(p.firstName, p.lastName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="mt-14 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                {p.firstName} {p.lastName}
                {isOwn && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleEditClick}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                )}
              </h1>
              {p.headline && (
                <p className="text-sm font-semibold text-muted-foreground">{p.headline}</p>
              )}

              {/* Dynamic location/details line */}
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2 text-xs font-semibold text-muted-foreground">
                {p.department && (
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {p.department}
                  </span>
                )}
                {p.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Year {p.year}
                  </span>
                )}
                {p.hostel && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {p.hostel}
                  </span>
                )}
              </div>

              {/* Connections/Follower Counts */}
              <div className="flex gap-4 pt-3 text-xs font-bold">
                <span className="text-foreground">
                  <strong className="text-sm font-extrabold text-primary">{profile.connectionCount}</strong> connections
                </span>
                <span className="text-foreground">
                  <strong className="text-sm font-extrabold text-primary">{profile._count?.followers ?? 0}</strong> followers
                </span>
              </div>
            </div>

            {/* Action buttons (Connect/Message/Follow) */}
            {!isOwn ? (
              <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                <ConnectButton
                  userId={userId}
                  connectionStatus={profile.connectionStatus}
                  size="default"
                />

                <Button
                  variant="outline"
                  className="rounded-xl font-bold hover:bg-accent/40 text-xs"
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                >
                  {profile.isFollowing ? (
                    <>
                      <UserMinus className="mr-1.5 h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-1.5 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="rounded-xl font-bold hover:bg-accent/40 text-xs"
                  onClick={() => messageMutation.mutate()}
                  disabled={messageMutation.isPending}
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" />
                  Message
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                  {p.resumeUrl && (
                    <a href={p.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="rounded-xl font-bold text-xs h-8">
                        View Resume
                      </Button>
                    </a>
                  )}
                  <Button variant="linkedin" className="rounded-xl font-bold text-xs h-8" onClick={handleEditClick}>
                    Edit Profile
                  </Button>
                </div>
                {/* Profile Completion percentage */}
                <div className="w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border">
                  <div
                    className="bg-gradient-to-r from-primary to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.profileCompletion}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-extrabold uppercase">
                  Profile Complete: {p.profileCompletion}%
                </span>
              </div>
            )}
          </div>

          {/* Badges pills */}
          <div className="mt-4 flex flex-wrap gap-2 pt-2">
            {p.openToWork && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold border border-emerald-200/50 dark:border-emerald-900/30">
                <Award className="h-3.5 w-3.5" />
                Open to Work
              </span>
            )}
            {p.openToTeam && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 px-3 py-1 text-xs font-bold border border-blue-200/50 dark:border-blue-900/30">
                <Users className="h-3.5 w-3.5" />
                Open to Team
              </span>
            )}
            {p.lookingForInternship && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 px-3 py-1 text-xs font-bold border border-purple-200/50 dark:border-purple-900/30">
                <Sparkles className="h-3.5 w-3.5" />
                Looking for Internship
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid wrapper for About / Links / Skills / Projects */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Side: About, Experience, Education, Projects */}
        <div className="md:col-span-8 space-y-6">
          {/* About Bio */}
          {p.bio && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">{p.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experiences Section */}
          {profile.experiences?.length > 0 && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.experiences.map((exp: any) => (
                  <div key={exp.id} className="border-b last:border-b-0 pb-3 last:pb-0 relative">
                    <h3 className="font-extrabold text-foreground text-sm">{exp.title}</h3>
                    <p className="text-xs text-muted-foreground font-bold">{exp.company} · {exp.location}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold pt-0.5">
                      {exp.startDate.split("T")[0]} — {exp.isCurrent ? "Present" : exp.endDate?.split("T")[0] ?? ""}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground font-medium pt-1 whitespace-pre-wrap leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education Section */}
          {profile.educations?.length > 0 && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  Education History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.educations.map((edu: any) => (
                  <div key={edu.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                    <h3 className="font-extrabold text-foreground text-sm">{edu.degree} in {edu.field}</h3>
                    <p className="text-xs text-muted-foreground font-bold">{edu.institution} {edu.grade ? `· Grade: ${edu.grade}` : ""}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold pt-0.5">
                      {edu.startDate.split("T")[0]} — {edu.endDate?.split("T")[0] ?? ""}
                    </p>
                    {edu.description && (
                      <p className="text-xs text-muted-foreground font-medium pt-1 whitespace-pre-wrap leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Showcase Projects */}
          {profile.ownedProjects?.length > 0 && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Showcase Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.ownedProjects.map((proj: { id: string; title: string; description: string; technologies: string[] }) => (
                  <Link key={proj.id} href={`/projects/${proj.id}`}>
                    <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 transition-all hover:bg-accent/40 hover:shadow-md cursor-pointer group">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{proj.title}</h3>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground mt-1 font-medium leading-relaxed">{proj.description}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {proj.technologies.slice(0, 4).map((t: string) => (
                          <span key={t} className="text-[10px] font-bold tracking-tight rounded-full px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Skills, Social Links */}
        <div className="md:col-span-4 space-y-6">
          {/* Social Links */}
          {(p.githubUrl || p.linkedinUrl || p.portfolioUrl || p.leetcodeUrl || p.codeforcesUrl) && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {p.githubUrl && (
                  <a href={p.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <Github className="h-4 w-4" />
                      GitHub Profile
                    </Button>
                  </a>
                )}
                {p.linkedinUrl && (
                  <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </Button>
                  </a>
                )}
                {p.portfolioUrl && (
                  <a href={p.portfolioUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <ExternalLink className="h-4 w-4" />
                      Personal Portfolio
                    </Button>
                  </a>
                )}
                {p.leetcodeUrl && (
                  <a href={p.leetcodeUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <Award className="h-4 w-4" />
                      LeetCode profile
                    </Button>
                  </a>
                )}
                {p.codeforcesUrl && (
                  <a href={p.codeforcesUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-semibold gap-2.5 h-10 hover:bg-accent/50 text-xs">
                      <Sparkles className="h-4 w-4" />
                      Codeforces profile
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Skills Badges */}
          {profile.skills?.length > 0 && (
            <Card className="glass-card border border-slate-200/50 dark:border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Skills</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {profile.skills.map((s: { skill: { name: string }; level: string }) => (
                  <span
                    key={s.skill.name}
                    className="text-[11px] font-bold tracking-tight rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-2.5 py-1"
                  >
                    {s.skill.name} <span className="text-muted-foreground font-medium">· {s.level.toLowerCase()}</span>
                  </span>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Editing Overlay Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Edit Profile Settings</h2>
                  <p className="text-[10px] text-muted-foreground">Keep your campus resume and collaboration bio current</p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Sub-tab navigation */}
              <div className="flex border-b text-xs font-bold text-muted-foreground bg-slate-50/50 dark:bg-slate-900/20 px-3.5 overflow-x-auto whitespace-nowrap gap-1">
                {["basic", "links", "skills", "experience", "education"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2.5 border-b-2 capitalize transition-colors ${
                      activeTab === tab ? "border-primary text-foreground" : "border-transparent hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {activeTab === "basic" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">First Name</label>
                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Last Name</label>
                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Headline</label>
                      <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Full Stack Developer | AI Enthusiast" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Bio / About</label>
                      <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="min-h-[100px] resize-none" />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Department</label>
                        <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="CSE" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Year</label>
                        <Input type="number" min={1} max={5} value={year} onChange={(e) => setYear(parseInt(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Hostel</label>
                        <Input value={hostel} onChange={(e) => setHostel(e.target.value)} placeholder="Hostel 4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Roll Number</label>
                        <Input value={rollNumber} onChange={(e) => setRollNumber(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Phone Number</label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase">Upload Profile Pictures</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Avatar */}
                        <div className="space-y-1 text-center border p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                          <span className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-2">Avatar image</span>
                          <div className="relative inline-block">
                            <Avatar className="h-14 w-14 mx-auto mb-2">
                              <AvatarImage src={avatarUrl} />
                              <AvatarFallback className="bg-primary text-white text-lg font-bold">
                                {getInitials(firstName, lastName)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="relative">
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "avatar")} className="hidden" id="avatar-up" />
                            <label htmlFor="avatar-up" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary cursor-pointer hover:underline">
                              {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              Choose Avatar
                            </label>
                          </div>
                        </div>

                        {/* Cover Banner */}
                        <div className="space-y-1 text-center border p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 col-span-2">
                          <span className="text-[10px] font-extrabold uppercase text-muted-foreground block mb-2">Cover image banner</span>
                          <div className="h-14 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border mb-2 flex items-center justify-center">
                            {coverUrl ? (
                              <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-muted-foreground">No banner uploaded</span>
                            )}
                          </div>
                          <div className="relative">
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, "cover")} className="hidden" id="cover-up" />
                            <label htmlFor="cover-up" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary cursor-pointer hover:underline">
                              {uploadingCover ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                              Choose Cover Banner
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase">Campus Status Indicators</h4>
                      <div className="flex flex-wrap gap-4 text-xs font-bold">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={openToWork} onChange={(e) => setOpenToWork(e.target.checked)} className="rounded" />
                          Open To Work
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={openToTeam} onChange={(e) => setOpenToTeam(e.target.checked)} className="rounded" />
                          Open To Team
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={lookingForInternship} onChange={(e) => setLookingForInternship(e.target.checked)} className="rounded" />
                          Looking for Internship
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground block">Professional Resume / CV File</label>
                      <div className="flex items-center gap-3">
                        <Input placeholder="Upload resume to obtain URL" value={resumeUrl} readOnly className="rounded-xl flex-1 bg-slate-50 dark:bg-slate-900" />
                        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleImageUpload(e, "resume")} className="hidden" id="resume-up" />
                        <label htmlFor="resume-up" className="inline-flex items-center justify-center gap-1.5 h-10 border rounded-xl px-4 font-bold text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 shrink-0">
                          {uploadingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                          Upload PDF
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "links" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">GitHub Profile URL</label>
                      <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">LinkedIn Profile URL</label>
                      <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Personal Portfolio URL</label>
                      <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://mywebsite.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">LeetCode Profile URL</label>
                      <Input value={leetcodeUrl} onChange={(e) => setLeetcodeUrl(e.target.value)} placeholder="https://leetcode.com/username" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Codeforces Profile URL</label>
                      <Input value={codeforcesUrl} onChange={(e) => setCodeforcesUrl(e.target.value)} placeholder="https://codeforces.com/profile/username" />
                    </div>
                  </div>
                )}

                {activeTab === "skills" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wide text-muted-foreground">Add Skills</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type skill name (e.g. Next.js) and press Add"
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (skillsInput.trim() && !skills.includes(skillsInput.trim())) {
                                setSkills([...skills, skillsInput.trim()]);
                                setSkillsInput("");
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (skillsInput.trim() && !skills.includes(skillsInput.trim())) {
                              setSkills([...skills, skillsInput.trim()]);
                              setSkillsInput("");
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => setSkills(skills.filter((s) => s !== skill))}
                          >
                            <X className="h-3 w-3 hover:text-red-500 transition-colors" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "experience" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Timeline Experiences</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold text-xs gap-1"
                        onClick={() =>
                          setExperiences([
                            ...experiences,
                            { title: "", company: "", location: "", description: "", startDate: "", endDate: "", isCurrent: false },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Experience
                      </Button>
                    </div>

                    {experiences.map((exp, index) => (
                      <div key={index} className="space-y-3 p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 relative">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-650"
                          onClick={() => setExperiences(experiences.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Job Title</span>
                            <Input
                              value={exp.title}
                              onChange={(e) => {
                                const copy = [...experiences];
                                copy[index].title = e.target.value;
                                setExperiences(copy);
                              }}
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Company</span>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const copy = [...experiences];
                                copy[index].company = e.target.value;
                                setExperiences(copy);
                              }}
                              placeholder="Google"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1 col-span-2">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Location</span>
                            <Input
                              value={exp.location}
                              onChange={(e) => {
                                const copy = [...experiences];
                                copy[index].location = e.target.value;
                                setExperiences(copy);
                              }}
                              placeholder="Bangalore, India"
                            />
                          </div>
                          <div className="space-y-1 flex items-end pb-3">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground cursor-pointer">
                              <input
                                type="checkbox"
                                checked={exp.isCurrent}
                                onChange={(e) => {
                                  const copy = [...experiences];
                                  copy[index].isCurrent = e.target.checked;
                                  setExperiences(copy);
                                }}
                              />
                              Is Current?
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</span>
                            <Input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => {
                                const copy = [...experiences];
                                copy[index].startDate = e.target.value;
                                setExperiences(copy);
                              }}
                            />
                          </div>
                          {!exp.isCurrent && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">End Date</span>
                              <Input
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => {
                                  const copy = [...experiences];
                                  copy[index].endDate = e.target.value;
                                  setExperiences(copy);
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Description</span>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => {
                              const copy = [...experiences];
                              copy[index].description = e.target.value;
                              setExperiences(copy);
                            }}
                            className="min-h-[60px]"
                            placeholder="Worked on designing core UI modules..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "education" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase">Institutions & Degrees</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl font-bold text-xs gap-1"
                        onClick={() =>
                          setEducations([
                            ...educations,
                            { institution: "", degree: "", field: "", startDate: "", endDate: "", grade: "", description: "" },
                          ])
                        }
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Education
                      </Button>
                    </div>

                    {educations.map((edu, index) => (
                      <div key={index} className="space-y-3 p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 relative">
                        <button
                          type="button"
                          className="absolute top-2 right-2 text-red-500 hover:text-red-650"
                          onClick={() => setEducations(educations.filter((_, i) => i !== index))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Institution</span>
                          <Input
                            value={edu.institution}
                            onChange={(e) => {
                              const copy = [...educations];
                              copy[index].institution = e.target.value;
                              setEducations(copy);
                            }}
                            placeholder="Indian Institute of Technology, Bombay"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Degree</span>
                            <Input
                              value={edu.degree}
                              onChange={(e) => {
                                const copy = [...educations];
                                copy[index].degree = e.target.value;
                                setEducations(copy);
                              }}
                              placeholder="Bachelor of Technology"
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Field of Study</span>
                            <Input
                              value={edu.field}
                              onChange={(e) => {
                                const copy = [...educations];
                                copy[index].field = e.target.value;
                                setEducations(copy);
                              }}
                              placeholder="Computer Science"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Start Date</span>
                            <Input
                              type="date"
                              value={edu.startDate}
                              onChange={(e) => {
                                const copy = [...educations];
                                copy[index].startDate = e.target.value;
                                setEducations(copy);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">End Date</span>
                            <Input
                              type="date"
                              value={edu.endDate}
                              onChange={(e) => {
                                const copy = [...educations];
                                copy[index].endDate = e.target.value;
                                setEducations(copy);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Grade / CGPA</span>
                            <Input
                              value={edu.grade}
                              onChange={(e) => {
                                const copy = [...educations];
                                copy[index].grade = e.target.value;
                                setEducations(copy);
                              }}
                              placeholder="9.2 CGPA"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Description</span>
                          <Textarea
                            value={edu.description}
                            onChange={(e) => {
                              const copy = [...educations];
                              copy[index].description = e.target.value;
                              setEducations(copy);
                            }}
                            className="min-h-[60px]"
                            placeholder="Describe relevant coursework, societies..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                <Button type="button" variant="ghost" className="rounded-xl font-bold text-xs h-9" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="linkedin"
                  className="rounded-xl font-bold text-xs h-9 px-6 shadow-sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || uploadingAvatar || uploadingCover || uploadingResume}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
