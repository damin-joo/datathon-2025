"use client";

import Card from "../components/ui/Card";
import Goals from "../components/ui/Goals";
import useUser from "../hooks/useUser";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowUpRight, CalendarClock, Flag, Sparkles } from "lucide-react";

type GoalItem = {
  id: number;
  title: string;
  current: number;
  target: number;
};

export default function GoalsPage() {
  const { data, isLoading } = useUser();
  const { data: session, status: sessionStatus } = useSession();
  const goalsList: GoalItem[] = Array.isArray(data?.goals) ? (data?.goals as GoalItem[]) : [];

  const completedGoals = goalsList.filter((goal: GoalItem) => goal.target > 0 && goal.current >= goal.target).length;
  const activeGoals = Math.max(0, goalsList.length - completedGoals);
  const avgProgress = goalsList.length
    ? Math.round(
        (goalsList.reduce((acc: number, goal: GoalItem) => {
          const target = goal.target || 1;
          return acc + Math.min(goal.current / target, 1);
        }, 0) /
          goalsList.length) *
          100
      )
    : 0;
  const heroName = session?.user?.name?.split(" ")[0] ?? "EcoBank member";

  const heroMetrics = [
    {
      label: "Active goals",
      value: activeGoals,
      helper: completedGoals ? `${completedGoals} completed` : "Just getting started",
      icon: Flag,
    },
    {
      label: "Avg progress",
      value: `${avgProgress}%`,
      helper: "Across all targets",
      icon: Sparkles,
    },
    {
      label: "Next milestone",
      value: goalsList[0]?.target ? `${Math.max(goalsList[0].target - goalsList[0].current, 0)} pts` : "Set one",
      helper: goalsList[0]?.title ?? "Add your first goal",
      icon: CalendarClock,
    },
  ];

  const inspirationCards = [
    {
      title: "Unlock new Eco badges",
      body: "Stack short-term challenges so every purchase nudges the leaderboard.",
      href: "/ranking",
    },
    {
      title: "Meet with Eco Coach",
      body: "Book a 15-minute session to rewrite next month's plan.",
      href: "/coach",
    },
    {
      title: "Refresh your automations",
      body: "Audit alerts and habit trackers to remove noise and double wins.",
      href: "/scoring",
    },
  ];

  if (isLoading) return <p className="text-center py-10">Loading goals...</p>;
  if (!session) 
    return (
      <div className="text-center py-10">
        <p>You must be logged in</p>
        <Link href="/login" className="text-blue-500 hover:underline mt-4 inline-block">
          Go to login
        </Link>
      </div>
    );

  return (
    <div className="space-y-12 pb-16">
      <section
        className="rounded-3xl text-white p-8 md:p-10 shadow-xl"
        style={{ background: "linear-gradient(135deg,#0ea769,#0d8e5a,#066141)" }}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">Goal planner</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">{heroName}, scale change on your terms</h1>
            <p className="text-lg text-white/80 max-w-2xl">
              Keep every retrofit, transport tweak, and shopping shift in one playbook. Celebrate progress and spot gaps instantly.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/coach"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-900 shadow-sm"
              >
                Meet Eco Coach
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/scoring"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white"
              >
                View scoring insights
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6 w-full max-w-md">
            <p className="text-sm text-white/70">Status at a glance</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl bg-white/5 p-4 space-y-2">
                  <metric.icon className="h-4 w-4 text-white/70" />
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">{metric.label}</p>
                  <p className="text-2xl font-semibold">{metric.value}</p>
                  <p className="text-xs text-white/70">{metric.helper}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Active plans</p>
              <h2 className="text-2xl font-semibold text-neutral-900">Your goal board</h2>
            </div>
            <Link href="/transactions" className="text-sm font-semibold text-emerald-600">
              Sync more activity
            </Link>
          </div>
          <div className="mt-6">
            <Goals data={goalsList} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Pace</p>
            <h3 className="text-lg font-semibold text-neutral-900 mt-2">Goal health</h3>
            <p className="text-sm text-neutral-500 mt-1">
              {avgProgress >= 75
                ? "You're tracking confidently toward your plan."
                : "Add a focused challenge to boost next week's progress."}
            </p>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-neutral-600">
                <span>Average progress</span>
                <span className="font-semibold text-neutral-900">{avgProgress}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${avgProgress}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Quick actions</p>
            <div className="mt-4 space-y-3 text-sm">
              {[{
                title: "Update targets",
                body: "Tune current + target values to stay ambitious.",
                href: "/dashboard",
              }, {
                title: "Invite a teammate",
                body: "Share a goal to split accountability.",
                href: "/transactions",
              }, {
                title: "Review nudges",
                body: "Open Eco Coach to swap out suggestions.",
                href: "/coach",
              }].map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="block rounded-2xl border border-neutral-100 px-4 py-3 hover:border-neutral-400 transition"
                >
                  <p className="font-semibold text-neutral-900 flex items-center gap-2">
                    {action.title}
                    <ArrowUpRight className="h-4 w-4" />
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">{action.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-400">Stay inspired</p>
            <h2 className="text-2xl font-semibold text-neutral-900">Guided moves</h2>
          </div>
          <Link href="/ranking" className="text-sm font-semibold text-emerald-600">
            See leaderboard tips
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {inspirationCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Playbook</p>
              <h3 className="mt-3 text-xl font-semibold text-neutral-900">{card.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{card.body}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-600">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
