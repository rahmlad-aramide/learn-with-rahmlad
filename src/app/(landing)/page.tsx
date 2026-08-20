import {
  ArrowRight,
  Map,
  Flame,
  Trophy,
  Zap,
  CheckCircle2,
  Rocket,
  Heart,
  CalendarDays,
  Medal,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { createServerClientInstance } from "@/lib/supabase/server";
import Badge from "@/components/ui/badge/Badge";
import LandingNav from "@/components/landing/LandingNav";
import LandingContact from "@/components/landing/LandingContact";
import Button from "@/components/ui/button/Button";
import GridShape from "@/components/common/GridShape";

export default async function Home() {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="bg-background text-foreground min-h-screen">
      <LandingNav isLoggedIn={!!user} />

      <div className="bg-background min-h-screen">
        {/* Hero */}
        <section className="relative z-1 overflow-hidden pt-24 pb-24">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-8 text-center">
              <Badge
                variant="light"
                className="rounded-full px-4 py-1.5 text-sm font-medium"
              >
                <Rocket /> Built by engineers, for the next generation
              </Badge>
              <hgroup className="xsm:text-6xl text-5xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-7xl">
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
                Ditch the &quot;tutorial hell.&quot; We&apos;ve hand-picked the
                best resources and organised them into clear, actionable paths —
                with streaks, XP, and badges to keep you consistent.
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
                <Link href="/signup">
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

        {/* Problem statement */}
        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="mb-12 text-2xl font-semibold italic opacity-70">
              &quot;There&apos;s too much information, but not enough
              direction.&quot; — Every beginner ever.
            </h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
              {[
                {
                  text: "No more decision fatigue",
                  sub: "We pick the best videos and articles so you don't have to.",
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

        {/* Features */}
        <section className="border-border border-t py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need, nothing you don&apos;t.
              </h2>
              <p className="text-muted-foreground">
                We designed LearnWithRahmlad to be the mentor we wish we had.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Map className="text-primary h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Guided Roadmaps</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Step-by-step paths from &quot;Hello World&quot; to your first
                  technical interview.
                </p>
              </Card>

              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold">Streaks &amp; XP</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Build a daily habit. Earn XP for every resource you complete
                  and level up as you grow.
                </p>
              </Card>

              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-500/10">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold">Badges &amp; Certificates</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Hit milestones, unlock badges, and earn shareable certificates
                  on path completion.
                </p>
              </Card>

              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
                  <CalendarDays className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">1-on-1 Sessions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Book live sessions directly with the instructor. Personalised
                  guidance, your schedule.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Gamification showcase */}
        <section className="border-border bg-muted/30 border-t py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <Badge
                variant="light"
                color="warning"
                className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium"
              >
                New
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Built to keep you coming back
              </h2>
              <p className="text-muted-foreground">
                Learning is a habit. We built features to make it stick.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Streak card */}
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-500/10">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold">Daily Streak 🔥</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Show up every day and your flame grows. Miss a day and the
                  streak resets. Simple, effective, addictive.
                </p>
                {/* Visual mockup */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5">
                    {[true, true, true, true, true, false, false].map(
                      (active, i) => (
                        <div
                          key={i}
                          className={`h-5 w-5 rounded-sm ${active ? "bg-orange-400" : "bg-gray-100 dark:bg-gray-800"}`}
                        />
                      ),
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">5 day streak</p>
                </div>
              </Card>

              {/* XP card */}
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/10">
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">XP &amp; Levels ⚡</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every resource earns XP. Progress from Level 1 to Level 10 as
                  your skills compound.
                </p>
                {/* Visual mockup */}
                <div className="pt-2">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                      Lv 4
                    </span>
                    <span className="text-xs text-gray-500">640 XP</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className="h-full w-[40%] rounded-full bg-purple-500" />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    360 XP to Level 5
                  </p>
                </div>
              </Card>

              {/* Badges card */}
              <Card className="hover:border-primary/50 space-y-4 p-8 transition-colors">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-500/10">
                  <Medal className="h-6 w-6 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold">Milestone Badges 🏆</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Unlock badges for consistency and progress. Proof that your
                  effort is real.
                </p>
                {/* Visual mockup */}
                <div className="space-y-2 pt-2">
                  {[
                    { icon: "🎯", name: "First Step" },
                    { icon: "🔥", name: "Dedicated" },
                    { icon: "🏆", name: "Course Champion" },
                  ].map((badge) => (
                    <div
                      key={badge.name}
                      className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/50"
                    >
                      <span className="text-base leading-none">
                        {badge.icon}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Learning paths */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col justify-between md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold">
                What are you curious about?
              </h2>
              <p className="text-muted-foreground mt-2">
                Join thousands of students in these top-rated tracks.
              </p>
            </div>
            <Link href="/browse" className="hidden md:flex">
              <Button variant="link" className="hidden sm:flex">
                View all paths
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "The Modern Full Stack",
                tag: "Most Popular",
                desc: "From React basics to deploying scalable cloud apps.",
                students: "1.2k learners",
              },
              {
                title: "The Logic of Backend",
                tag: "Trending",
                desc: "Master APIs, Databases, and System Design.",
                students: "800 learners",
              },
              {
                title: "UI/UX for Developers",
                tag: "Essential",
                desc: "Learn to build interfaces that don't look like developer tools.",
                students: "500 learners",
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
                  <Link href="/browse">
                    <Button className="w-full transition-colors">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Golden Generation community callout */}
        <section className="border-border border-t py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-yellow-200 bg-linear-to-br from-yellow-50 to-amber-50 px-4 py-6 md:p-12 text-center dark:border-yellow-500/20 dark:from-yellow-500/5 dark:to-amber-500/5">
              <Badge
                variant="light"
                color="warning"
                className="mb-6 rounded-full px-4 py-1.5 text-sm font-medium"
              >
                Community Program
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl dark:text-white/90">
                Golden Generation Community
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-gray-600 dark:text-gray-300">
                A structured 32-week web development curriculum for members of
                the Golden Generation Community Development Club. Complete daily
                tasks, track your progress phase by phase, compete on the
                leaderboard, and earn XP alongside your cohort.
              </p>

              <div className="mb-10 grid grid-cols-3 gap-4 sm:mx-auto sm:max-w-sm">
                {[
                  { value: "32", label: "Weeks" },
                  { value: "10", label: "Phases" },
                  { value: "300+", label: "Daily Tasks" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white/60 p-4 text-center dark:bg-white/5"
                  >
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <Link href="/signup">
                <Button
                  size="xl"
                  className="h-14 gap-2 rounded-full bg-yellow-500 px-8 text-lg text-white hover:bg-yellow-600"
                >
                  Join the Program <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <LandingContact />

        {/* Footer */}
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
              developers who remember what it&apos;s like to be a beginner.
            </p>
            <div className="text-muted-foreground mb-8 flex justify-center gap-8 text-sm">
              <Link
                href="https://x.com/Dev_Rahmlad"
                className="hover:text-primary"
                target="_blank"
                rel="noreferrer noopener"
              >
                Twitter
              </Link>
              <Link
                href="https://discord.gg/MXsDuWthPN"
                className="hover:text-primary"
                target="_blank"
                rel="noreferrer noopener"
              >
                Discord
              </Link>
              <Link
                href="https://github.com/rahmlad-aramide/learn-with-rahmlad"
                className="hover:text-primary"
                target="_blank"
                rel="noreferrer noopener"
              >
                GitHub
              </Link>
            </div>
            <p className="text-muted-foreground/60 text-xs">
              &copy; {new Date().getFullYear()} LearnWithRahmlad. No cookies, no
              trackers, just learning.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
