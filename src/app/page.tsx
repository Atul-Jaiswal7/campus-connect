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
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Professional Profiles",
    description:
      "Build LinkedIn-style profiles with skills, projects, certifications, and resume uploads.",
  },
  {
    icon: FolderKanban,
    title: "Project Discovery",
    description:
      "Browse and showcase college projects, open-source work, and startup ideas.",
  },
  {
    icon: Users,
    title: "Team Formation",
    description:
      "Post recruitment needs, apply to teams, and collaborate on hackathons.",
  },
  {
    icon: MessageSquare,
    title: "Real-time Messaging",
    description: "Chat with peers, team members, and club groups with file sharing.",
  },
  {
    icon: Briefcase,
    title: "Opportunities",
    description:
      "Discover internships, hackathons, workshops, and club recruitments.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description:
      "Get teammate recommendations and skill-based project matching.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="border-b bg-gradient-to-br from-linkedin/10 via-background to-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-linkedin" />
            <span className="text-xl font-bold text-linkedin">Campus Connect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="linkedin">Join Now</Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            Your Campus{" "}
            <span className="text-linkedin">Professional Network</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Connect with peers, showcase your projects, form teams, and discover
            opportunities — all within your college ecosystem.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button variant="linkedin" size="lg" className="gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-center text-3xl font-bold">Everything You Need to Succeed</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          A complete platform designed exclusively for college students to network,
          collaborate, and grow professionally.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="glass-card transition-shadow hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-linkedin/10">
                    <Icon className="h-6 w-6 text-linkedin" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-linkedin py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Connect?</h2>
          <p className="mt-4 text-linkedin-light">
            Join thousands of students building their professional network on campus.
          </p>
          <Link href="/register" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Your Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Campus Connect. Built for students, by students.</p>
      </footer>
    </div>
  );
}
