"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opportunitySchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building2, MapPin, DollarSign, Calendar, Link2 } from "lucide-react";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

type OpportunityFormValues = z.infer<typeof opportunitySchema>;

interface EditOpportunityPageProps {
  params: Promise<{ id: string }>;
}

export default function EditOpportunityPage({ params }: EditOpportunityPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
  });

  useEffect(() => {
    async function loadOpportunity() {
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (data.success && data.data) {
          const opp = data.data;
          reset({
            title: opp.title,
            description: opp.description,
            type: opp.type,
            company: opp.company ?? "",
            location: opp.location ?? "",
            stipend: opp.stipend ?? "",
            deadline: opp.deadline ? opp.deadline.split("T")[0] : undefined,
            applyUrl: opp.applyUrl ?? "",
          });
        }
      } catch {
        toast({ title: "Failed to load opportunity details", variant: "destructive" });
        router.push("/opportunities");
      } finally {
        setLoading(false);
      }
    }
    loadOpportunity();
  }, [id, reset, router]);

  const onSubmit = async (values: OpportunityFormValues) => {
    setSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        deadline: values.deadline ? new Date(values.deadline).toISOString() : undefined,
        applyUrl: values.applyUrl || undefined,
        company: values.company || undefined,
        location: values.location || undefined,
        stipend: values.stipend || undefined,
      };

      const res = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!res.ok) throw new Error();
      toast({ title: "Opportunity updated successfully!" });
      router.push("/opportunities");
    } catch {
      toast({ title: "Failed to save changes", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-semibold">Loading opportunity data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/opportunities">
          <Button variant="ghost" size="icon" className="rounded-xl border bg-card">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Edit Opportunity</h1>
          <p className="text-xs text-muted-foreground">Keep the opportunity posting details up to date</p>
        </div>
      </div>

      <Card className="glass-card shadow-lg border-slate-200/50 dark:border-slate-800/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Opportunity Information</CardTitle>
          <CardDescription className="text-xs">Provide details about the opportunity, timeline, eligibility, and how to apply.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Opportunity Title</label>
              <Input
                placeholder="Software Engineering Intern"
                className="rounded-xl font-medium"
                {...register("title")}
              />
              {errors.title && <p className="text-xs text-red-500 font-semibold">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description & Requirements</label>
              <Textarea
                placeholder="Describe roles, responsibilities, eligibility requirements, coding challenge topics, and benefit schemes..."
                className="min-h-[160px] rounded-xl font-medium resize-y"
                {...register("description")}
              />
              {errors.description && <p className="text-xs text-red-500 font-semibold">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Opportunity Type</label>
                <select
                  className="w-full rounded-xl bg-card border border-slate-200 dark:border-slate-800 text-xs font-semibold p-2.5 outline-none focus:ring-4 focus:ring-primary/5"
                  {...register("type")}
                >
                  <option value="INTERNSHIP">Internship</option>
                  <option value="JOB">Full-Time Job</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="CODING_CONTEST">Coding Contest</option>
                  <option value="RESEARCH">Research Opportunity</option>
                  <option value="CLUB_RECRUITMENT">Club Recruitment</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Company / Organization Name
                </label>
                <Input
                  placeholder="Google / AI Club"
                  className="rounded-xl font-medium"
                  {...register("company")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </label>
                <Input
                  placeholder="Remote / Bangalore"
                  className="rounded-xl font-medium"
                  {...register("location")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" /> Stipend / Compensation
                </label>
                <Input
                  placeholder="₹25,000 / Month"
                  className="rounded-xl font-medium"
                  {...register("stipend")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Application Deadline
                </label>
                <Input
                  type="date"
                  className="rounded-xl font-medium"
                  onChange={(e) => {
                    const val = e.target.value;
                    setValue("deadline", val ? new Date(val).toISOString() : undefined);
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" /> Application URL
              </label>
              <Input
                placeholder="https://careers.google.com/jobs/..."
                className="rounded-xl font-medium"
                {...register("applyUrl")}
              />
              {errors.applyUrl && <p className="text-xs text-red-500 font-semibold">{errors.applyUrl.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Link href="/opportunities">
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
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
