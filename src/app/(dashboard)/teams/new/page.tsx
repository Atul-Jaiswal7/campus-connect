"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teamRecruitmentSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Plus, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";

type TeamFormValues = z.infer<typeof teamRecruitmentSchema>;

export default function NewTeamPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; title: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamRecruitmentSchema),
    defaultValues: {
      title: "",
      problemStatement: "",
      teamSize: 2,
      workload: "",
      duration: "",
      hackathonName: "",
      deadline: undefined,
      projectId: undefined,
      roles: [{ roleNeeded: "", skillName: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "roles",
  });

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.success) {
          setProjects(data.data);
        }
      } catch {
        console.error("Failed to load user projects");
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, []);

  const onSubmit = async (values: TeamFormValues) => {
    setSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
        projectId: values.projectId === "" ? undefined : values.projectId,
      };

      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!res.ok) throw new Error();
      toast({ title: "Team recruitment posted successfully!" });
      router.push("/teams");
    } catch {
      toast({ title: "Failed to post recruitment", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teams">
          <Button variant="ghost" size="icon" className="rounded-xl border bg-card">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Post Team Recruitment</h1>
          <p className="text-xs text-muted-foreground">Find collaborators with matching skills for your next venture</p>
        </div>
      </div>

      <Card className="glass-card shadow-lg border-slate-200/50 dark:border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Recruitment Information</CardTitle>
          <CardDescription className="text-xs">Describe the problems your team aims to solve, timeline, and open roles.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recruitment Title</label>
              <Input
                placeholder="Looking for Frontend Developers for Campus Connect"
                className="rounded-xl font-medium"
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Problem Statement & Scope</label>
              <Textarea
                placeholder="Explain what the project is about, target user group, goals, and what the team will build..."
                className="min-h-[160px] rounded-xl font-medium resize-y"
                {...register("problemStatement")}
              />
              {errors.problemStatement && <p className="text-xs text-red-500 font-semibold">{errors.problemStatement.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Link Project (Optional)</label>
                <select
                  className="w-full rounded-xl bg-card border border-slate-200 dark:border-slate-800 text-xs font-semibold p-2.5 outline-none focus:ring-4 focus:ring-primary/5"
                  {...register("projectId")}
                >
                  <option value="">Do not link project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Team Size</label>
                <Input
                  type="number"
                  placeholder="5"
                  className="rounded-xl font-medium"
                  {...register("teamSize")}
                />
                {errors.teamSize && <p className="text-xs text-red-500 font-semibold">{errors.teamSize.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workload / Commitment</label>
                <Input
                  placeholder="5-10 hrs/week"
                  className="rounded-xl font-medium"
                  {...register("workload")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Duration</label>
                <Input
                  placeholder="3 months"
                  className="rounded-xl font-medium"
                  {...register("duration")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hackathon Name (Optional)</label>
                <Input
                  placeholder="Google Solution Challenge"
                  className="rounded-xl font-medium"
                  {...register("hackathonName")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Application Deadline (Optional)</label>
              <Input
                type="date"
                className="rounded-xl font-medium"
                onChange={(e) => {
                  const val = e.target.value;
                  setValue("deadline", val ? new Date(val).toISOString() : undefined);
                }}
              />
            </div>

            {/* Dynamic Roles Fields */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roles Needed</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold text-xs gap-1"
                  onClick={() => append({ roleNeeded: "", skillName: "" })}
                >
                  <Plus className="h-3.5 w-3.5" /> Add Role
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 relative">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Role Name</span>
                      <Input
                        placeholder="Frontend Engineer"
                        className="rounded-lg h-9 text-xs"
                        {...register(`roles.${index}.roleNeeded` as const)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Primary Skill Needed</span>
                      <Input
                        placeholder="React / Next.js"
                        className="rounded-lg h-9 text-xs"
                        {...register(`roles.${index}.skillName` as const)}
                      />
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 h-9 w-9 rounded-lg"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.roles && <p className="text-xs text-red-500 font-semibold">{errors.roles.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/teams">
                <Button type="button" variant="ghost" className="rounded-xl font-bold">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="linkedin"
                className="rounded-xl font-bold px-6 shadow-md"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Recruitment"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
