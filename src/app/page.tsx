"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  Users,
  FolderKanban,
  MessageSquare,
  Briefcase,
  Sparkles,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Users,
    title: "Professional Profiles",
    description:
      "Build dynamic LinkedIn-style profiles showcasing your skills, projects, certifications, and resume uploads.",
    color: "from-blue-500/10 to-indigo-500/10 text-primary",
  },
  {
    icon: FolderKanban,
    title: "Project Discovery",
    description:
      "Browse and showcase academic projects, open-source work, and start-up ideas within your campus network.",
    color: "from-indigo-500/10 to-purple-500/10 text-indigo-600",
  },
  {
    icon: Users,
    title: "Team Formation",
    description:
      "Post recruitment alerts, evaluate team applications, and assemble candidates for hackathons and contests.",
    color: "from-green-500/10 to-emerald-500/10 text-green-600",
  },
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description: "Exchange direct coordinates, discuss ideas, and share documents with peers and campus groups.",
    color: "from-cyan-500/10 to-blue-500/10 text-cyan-600",
  },
  {
    icon: Briefcase,
    title: "Opportunities Center",
    description:
      "Discover active internships, hackathon boards, university events, and club recruitments on one platform.",
    color: "from-orange-500/10 to-amber-500/10 text-orange-600",
  },
  {
    icon: Sparkles,
    title: "Smart AI Matching",
    description:
      "Receive personalized teammate matches and project recommendation logs tailored to your core skills.",
    color: "from-pink-500/10 to-purple-500/10 text-purple-600",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-foreground relative overflow-hidden select-none">
      {/* Background radial spotlights (Apple style) */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-accent/15 blur-[150px] pointer-events-none" />

      {/* Header Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-slate-50/75 dark:bg-slate-900/75 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shadow-primary/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent tracking-tight">
              Campus Connect
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="rounded-full text-sm font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="linkedin" className="rounded-full px-5 text-sm font-semibold button-ripple">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16 text-center max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          {/* Tag badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary animate-pulse">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Campus Network Built for Students</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-none">
            Where student projects meet <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-accent">
              professional networks.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
            Connect with peers, showcase your portfolios, form hackathon teams, and discover exclusive opportunities — all within your college ecosystem.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" variant="linkedin" className="rounded-full gap-2 px-8 text-sm font-bold shadow-lg shadow-primary/20 button-ripple">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-sm font-bold hover:bg-accent/40 transition-colors">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20 relative z-10 max-w-6xl">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need to Succeed</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-sm font-semibold">
            An ecosystem built explicitly for college networks to connect, team up, and accelerate careers.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="glass-card hover-lift border border-slate-200/50 dark:border-slate-800/50">
                  <CardContent className="pt-6 pb-8 px-6 space-y-4">
                    <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-current shadow-inner`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA Box */}
      <section className="container mx-auto px-6 py-16 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gradient-to-br from-primary to-accent p-8 md:p-12 text-white text-center space-y-6 relative overflow-hidden shadow-xl shadow-primary/10"
        >
          {/* Subtle overlay shapes */}
          <div className="absolute top-0 right-0 h-48 w-48 bg-white/5 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 bg-slate-900/10 rounded-full blur-2xl" />

          <h2 className="text-3xl font-extrabold sm:text-4xl tracking-tight">Ready to Connect on Campus?</h2>
          <p className="mx-auto max-w-xl text-primary-foreground/90 text-sm md:text-base font-medium leading-normal">
            Join students building their portfolios, organizing hackathons, and finding collaborators today.
          </p>
          <div className="inline-block mt-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="rounded-full gap-2 font-bold px-8 text-slate-900 shadow-md bg-white hover:bg-slate-100 transition-colors">
                Create Your Profile
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-slate-800/50 py-10 text-center text-xs font-semibold text-muted-foreground relative z-10">
        <p>&copy; {new Date().getFullYear()} Campus Connect. Built for students, by students.</p>
      </footer>
    </div>
  );
}
