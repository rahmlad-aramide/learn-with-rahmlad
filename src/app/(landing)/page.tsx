import {
  ArrowRight,
  BookOpen,
  Users,
  Trophy,
  Zap,
  CheckCircle2,
  Star,
  Rocket,
  Code2,
  Heart,
} from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { createServerClientInstance } from "@/lib/supabase/server";
import Badge from "@/components/ui/badge/Badge";
import Button from "@/components/ui/button/Button";
import GridShape from "@/components/common/GridShape";

export default async function Home() {
  const cookieStore = await cookies()
  const supabase = await createServerClientInstance()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="bg-background text-foreground min-h-screen">
      {/* Navigation */}
      <nav className="border-border bg-background/50 sticky top-0 z-20 border-b backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/">
              <>
                <Image
                  className="dark:hidden"
                  src="/images/logo/logo.svg"
                  alt="Logo"
                  width={150}
                  height={40}
                />
                <Image
                  className="hidden dark:block"
                  src="/images/logo/logo-dark.svg"
                  alt="Logo"
                  width={150}
                  height={40}
                />
              </>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/browse">
              <Button variant={user ? "outline" : "ghost"}>
                Browse Resources
              </Button>
            </Link>
            {user ? (
              <>
                <Link href="/my-learning">
                  <Button variant="primary">My Learning</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="bg-background min-h-screen">
        <section className="relative z-1 overflow-hidden pt-24 pb-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 text-center">
              <Badge
                variant="light"
                className="rounded-full px-4 py-1.5 text-sm font-medium"
              >
                <Rocket /> Built by engineers, for the next generation
              </Badge>
              <hgroup className="text-6xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-7xl">
                <h1>
                  Stop scrolling.{" "}
                  <span className="from-primary bg-linear-to-r to-blue-600 bg-clip-text text-transparent">
                    Start building.
                  </span>
                </h1>
                <h1>
                  Learn Tech{" "}
                  <span className="from-primary bg-linear-to-r to-blue-600 bg-clip-text text-transparent">
                    Your Way
                  </span>
                </h1>
              </hgroup>

              <p className="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
                Ditch the "tutorial hell." We've hand-picked the best resources
                and organized them into clear, actionable paths. Learn the
                skills that actually get you hired.
              </p>

              <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                <Link href="/browse">
                  <Button
                    size="xl"
                    className="hover:shadow-primary/20 h-14 gap-2 rounded-full px-8 text-lg shadow-lg transition-all"
                  >
                    Start Your Journey <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="xl"
                    variant="outline"
                    className="h-14 rounded-full px-8 text-lg"
                  >
                    Join Other Learners
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <GridShape />
          <GridShape />
        </section>

        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="mb-12 text-2xl font-semibold italic opacity-70">
              "There's too much information, but not enough direction." — Every
              beginner ever.
            </h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {[
                {
                  text: "No more decision fatigue",
                  sub: "We pick the best videos/articles so you don't have to.",
                },
                {
                  text: "Zero fluff curriculum",
                  sub: "We focus on what you'll actually use in a real job.",
                },
                {
                  text: "Proof of work",
                  sub: "Build a portfolio that makes recruiters take notice.",
                },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <CheckCircle2 className="text-primary mb-4 h-8 w-8" />
                  <h4 className="mb-2 font-bold">{item.text}</h4>
                  <p className="text-muted-foreground text-sm">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-border border-t py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need, nothing you don't.
              </h2>
              <p className="text-muted-foreground">
                We designed LearnWithRahmlad to be the mentor we wish we had.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Guided Roadmaps</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Step-by-step paths from "Hello World" to your first technical
                  interview.
                </p>
              </Card>
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Multiple Resources</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Video tutorials, articles, and interactive content in one
                  place.
                </p>
              </Card>
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Earn Certificates</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complete paths and earn certificates to boast about.
                </p>
              </Card>
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <BookOpen className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Track Progress</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor your learning journey with detailed progress tracking.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                What are you curious about?
              </h2>
              <p className="text-muted-foreground mt-2">
                Join thousands of students in these top-rated tracks.
              </p>
            </div>
            <Button variant="link" className="hidden sm:flex">
              View all paths
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: "The Modern Full Stack",
                tag: "Most Popular",
                desc: "From React basics to deploying scalable cloud apps.",
                students: "4.2k learners",
              },
              {
                title: "The Logic of Backend",
                tag: "Trending",
                desc: "Master APIs, Databases, and System Design.",
                students: "2.8k learners",
              },
              {
                title: "UI/UX for Developers",
                tag: "Essential",
                desc: "Learn to build interfaces that don't look like developer tools.",
                students: "1.5k learners",
              },
            ].map((path, i) => (
              <Card
                key={i}
                className="group hover:border-primary overflow-hidden border-2 p-0 transition-all"
              >
                <div className="p-8">
                  <Badge className="mb-4">{path.tag}</Badge>
                  <h3 className="mb-3 text-2xl font-bold">{path.title}</h3>
                  <p className="text-muted-foreground mb-6">{path.desc}</p>
                  <div className="mb-6 flex items-center gap-2 text-sm font-medium">
                    <Users className="text-primary h-4 w-4" />
                    {path.students}
                  </div>
                  <Button className="group-hover:bg-primary w-full transition-colors">
                    Start Learning
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <footer className="border-border bg-muted/20 border-t py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-center gap-2 text-xl font-bold">
              <>
                <Image
                  className="dark:hidden"
                  src="/images/logo/logo.svg"
                  alt="Logo"
                  width={150}
                  height={40}
                />
                <Image
                  className="hidden dark:block"
                  src="/images/logo/logo-dark.svg"
                  alt="Logo"
                  width={150}
                  height={40}
                />
              </>
            </div>
            <p className="text-muted-foreground mx-auto mb-8 max-w-md">
              Made with{" "}
              <Heart className="mx-1 -mt-1 inline h-4 w-4 text-red-500" /> by
              developers who remember what it's like to be a beginner.
            </p>
            <div className="text-muted-foreground mb-8 flex justify-center gap-8 text-sm">
              <Link href="#" className="hover:text-primary">
                Twitter
              </Link>
              <Link href="#" className="hover:text-primary">
                Discord
              </Link>
              <Link href="#" className="hover:text-primary">
                GitHub
              </Link>
            </div>
            <p className="text-muted-foreground/60 text-xs">
              &copy; 2025 LearnWithRahmlad. No cookies, no trackers, just
              learning.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
