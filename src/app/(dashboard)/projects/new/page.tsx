"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Upload, X, Globe, Github, Tag } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [techs, setTechs] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      domain: "WEB",
      type: "COLLEGE",
      status: "PLANNING",
      demoUrl: "",
      githubUrl: "",
      technologies: [],
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        if (data.success) {
          setImageUrls((prev) => [...prev, data.url]);
        }
      }
      toast({ title: "Images uploaded successfully!" });
    } catch {
      toast({ title: "Failed to upload images", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = techInput.trim().replace(",", "");
      if (value && !techs.includes(value)) {
        const updated = [...techs, value];
        setTechs(updated);
        setValue("technologies", updated, { shouldValidate: true });
        setTechInput("");
      }
    }
  };

  const removeTech = (tech: string) => {
    const updated = techs.filter((t) => t !== tech);
    setTechs(updated);
    setValue("technologies", updated, { shouldValidate: true });
  };

  const onSubmit = async (values: ProjectFormValues) => {
    if (techs.length === 0) {
      toast({ title: "Please add at least one technology tag", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          imageUrls,
        }),
      });

      if (!res.ok) throw new Error();
      toast({ title: "Project created successfully!" });
      router.push("/projects");
    } catch {
      toast({ title: "Failed to create project", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="rounded-xl border bg-card">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Project</h1>
          <p className="text-xs text-muted-foreground">Showcase your hard work and invite peers to connect</p>
        </div>
      </div>

      <Card className="glass-card shadow-lg border-slate-200/50 dark:border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Project Details</CardTitle>
          <CardDescription className="text-xs">Provide details about your project, technologies, and repositories.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Title</label>
              <Input
                placeholder="Campus Connect"
                className="rounded-xl font-medium"
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <Textarea
                placeholder="Describe your project, why you built it, the stack, and key features..."
                className="min-h-[160px] rounded-xl font-medium resize-y"
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-red-500 font-semibold">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domain</label>
                <select
                  className="w-full rounded-xl bg-card border border-slate-200 dark:border-slate-800 text-xs font-semibold p-2.5 outline-none focus:ring-4 focus:ring-primary/5"
                  {...register("domain")}
                >
                  <option value="WEB">Web Development</option>
                  <option value="MOBILE">Mobile Applications</option>
                  <option value="AI">Artificial Intelligence</option>
                  <option value="ML">Machine Learning</option>
                  <option value="DATA_SCIENCE">Data Science</option>
                  <option value="BLOCKCHAIN">Blockchain</option>
                  <option value="CYBERSECURITY">Cybersecurity</option>
                  <option value="IOT">IoT</option>
                  <option value="ROBOTICS">Robotics</option>
                  <option value="OTHER">Other Domain</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Type</label>
                <select
                  className="w-full rounded-xl bg-card border border-slate-200 dark:border-slate-800 text-xs font-semibold p-2.5 outline-none focus:ring-4 focus:ring-primary/5"
                  {...register("type")}
                >
                  <option value="COLLEGE">College Project</option>
                  <option value="OPEN_SOURCE">Open Source</option>
                  <option value="STARTUP">Startup Initiative</option>
                  <option value="HACKATHON">Hackathon Submission</option>
                  <option value="RESEARCH">Academic Research</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                <select
                  className="w-full rounded-xl bg-card border border-slate-200 dark:border-slate-800 text-xs font-semibold p-2.5 outline-none focus:ring-4 focus:ring-primary/5"
                  {...register("status")}
                >
                  <option value="PLANNING">Planning</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Technologies used
              </label>
              <Input
                placeholder="Type tech name (e.g. Next.js) and press Enter or comma"
                className="rounded-xl font-medium"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
              />
              <div className="flex flex-wrap gap-2 pt-1.5">
                {techs.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)}>
                      <X className="h-3 w-3 hover:text-red-500 transition-colors" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.technologies && <p className="text-xs text-red-500 font-semibold">{errors.technologies.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Github className="h-3.5 w-3.5" /> Repository Link
                </label>
                <Input
                  placeholder="https://github.com/user/repo"
                  className="rounded-xl font-medium"
                  {...register("githubUrl")}
                />
                {errors.githubUrl && <p className="text-xs text-red-500 font-semibold">{errors.githubUrl.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Live Demo Link
                </label>
                <Input
                  placeholder="https://demo.example.com"
                  className="rounded-xl font-medium"
                  {...register("demoUrl")}
                />
                {errors.demoUrl && <p className="text-xs text-red-500 font-semibold">{errors.demoUrl.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Upload className="h-3.5 w-3.5" /> Thumbnails & Screenshots
              </label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Click or drag images here to upload</p>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG or WebP up to 5MB</p>
                </div>
              </div>

              {uploading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground pt-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading media files...
                </div>
              )}

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-4">
                  {imageUrls.map((url, index) => (
                    <div key={url} className="relative aspect-video rounded-lg overflow-hidden border group">
                      <img src={url} alt="screenshot preview" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/projects">
                <Button type="button" variant="ghost" className="rounded-xl font-bold">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                variant="linkedin"
                className="rounded-xl font-bold px-6 shadow-md"
                disabled={submitting || uploading}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Publish Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
