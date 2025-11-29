"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import RankingLeaderboard from "../components/ui/RankingLeaderboard";
import {
  DEMO_LEADERBOARD,
  GUEST_ACCOUNTS,
  BADGE_DESCRIPTIONS,
  type LeaderboardDemoEntry,
} from "../lib/demoData";
import { ArrowRight, ArrowUpRight, Trophy } from "lucide-react";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:5000";

type ApiLeaderboard = LeaderboardDemoEntry & { eco_points: number | null };

export default function RankingPage() {
  const { data: session } = useSession();
  const currentUser = session?.user?.email ?? session?.user?.name ?? "guest";
  const [leaderboard, setLeaderboard] = useState<LeaderboardDemoEntry[]>(DEMO_LEADERBOARD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND_BASE}/api/leaderboard`);
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ApiLeaderboard[];
        const normalized = (json || []).map((row) => ({
          ...row,
          display_name: row.display_name ?? row.user_id,
          badge: row.badge ?? "Earth Ally",
          eco_points: row.eco_points ?? 0,
        }));

        const hasLiveData = normalized.length > 0;
        const merged = hasLiveData
          ? [
              ...normalized,
              ...DEMO_LEADERBOARD.filter(
                (demoEntry) => !normalized.some((liveEntry) => liveEntry.user_id === demoEntry.user_id)
              ),
            ].slice(0, DEMO_LEADERBOARD.length)
          : DEMO_LEADERBOARD;

        if (!hasLiveData || normalized.length < Math.min(3, DEMO_LEADERBOARD.length)) {
          setError("Filling remaining ranks with demo eco league data");
        }

        const sorted = [...merged].sort((a, b) => {
          const aIsGuest = a.user_id === "guest";
          const bIsGuest = b.user_id === "guest";
          if (aIsGuest && !bIsGuest) return 1;
          if (bIsGuest && !aIsGuest) return -1;
          return (b.eco_points ?? 0) - (a.eco_points ?? 0);
        });
        setLeaderboard(sorted);
      } catch (err) {
        console.error("Failed to load leaderboard", err);
        setError("Showing demo eco league data");
        setLeaderboard(DEMO_LEADERBOARD);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const guestList = useMemo(() => GUEST_ACCOUNTS, []);
  const userPlacement = useMemo(() => {
    const idx = leaderboard.findIndex((row) => row.user_id === currentUser);
    if (idx === -1) return null;
    return { rank: idx + 1, entry: leaderboard[idx] };
  }, [leaderboard, currentUser]);

  const topPlacement = useMemo(() => {
    if (!leaderboard.length) return null;
    const topIndex = leaderboard.findIndex((entry) => entry.user_id !== "guest");
    if (topIndex === -1) {
      return { rank: 1, entry: leaderboard[0] };
    }
    return { rank: topIndex + 1, entry: leaderboard[topIndex] };
  }, [leaderboard]);

  const heroName = session?.user?.name?.split(" ")[0] ?? "EcoBank member";
  const highlightPlacement = session?.user ? userPlacement : topPlacement;
  const highlightTitle = session?.user ? "Your highlight" : "Today’s leader";
  const highlightCopy = session?.user
    ? userPlacement
      ? `You’re currently #${userPlacement.rank} with ${userPlacement.entry.eco_points ?? 0} Eco points.`
      : "Start transacting with EcoCard to appear in the live standings."
    : topPlacement
    ? `${topPlacement.entry.display_name} leads with ${topPlacement.entry.eco_points ?? 0} Eco points.`
    : "Log in or use a guest persona to highlight your rank automatically.";

  return (
    <>
      <Head>
        <title>Eco Ranking</title>
      </Head>
      <div className="mt-20 pb-16 space-y-10 px-4 md:px-8">
        <section
          className="rounded-3xl text-white p-8 md:p-10 shadow-xl"
          style={{ background: "linear-gradient(135deg,#0ea769,#0d8e5a,#066141)" }}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">Eco ranking league</p>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                {heroName}, see who’s leading the climate race
              </h1>
              <p className="text-lg text-white/80 max-w-2xl">
                Compare personas, unlock badges, and borrow playbooks from members who lower emissions without losing momentum.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-900 shadow-sm"
                  onClick={() => window.location.reload()}
                >
                  Refresh data
                  <ArrowRight className="h-4 w-4" />
                </button>
                {!session?.user && (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2 text-sm font-semibold text-white"
                  >
                    Try a guest login
                  </Link>
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/20 p-6 w-full max-w-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-white/20 p-3">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">{highlightTitle}</p>
                  <p className="text-sm text-white/90">{highlightCopy}</p>
                </div>
              </div>
              {highlightPlacement ? (
                <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">Rank</p>
                      <p className="text-4xl font-semibold">#{highlightPlacement.rank}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/60">Eco points</p>
                      <p className="text-3xl font-semibold">{highlightPlacement.entry.eco_points ?? 0}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs">
                    {highlightPlacement.entry.badge && (
                      <span className="rounded-full bg-white/20 px-3 py-1 font-semibold">{highlightPlacement.entry.badge}</span>
                    )}
                    {typeof highlightPlacement.entry.total_co2 === "number" && (
                      <span className="rounded-full bg-white/10 px-3 py-1">{highlightPlacement.entry.total_co2.toFixed(1)} kg CO₂</span>
                    )}
                  </div>
                </div>
              ) : !session?.user ? (
                <Link
                  href="/ranking/champions"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white"
                >
                  Explore champion stories
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium">Community challenge</span>
              {loading && <span className="text-sm text-neutral-500">Refreshing…</span>}
              {error && <span className="text-sm text-amber-700">{error}</span>}
            </div>
            <RankingLeaderboard data={leaderboard} currentUserId={currentUser} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Badge guide</h2>
              <p className="text-sm text-neutral-500">Each tier reflects how diversified someone’s low-carbon habits are.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {Object.entries(BADGE_DESCRIPTIONS).map(([badge, description]) => (
                  <div key={badge} className="border border-neutral-100 rounded-2xl p-4 bg-neutral-50">
                    <p className="text-sm font-semibold">{badge}</p>
                    <p className="text-xs text-neutral-500 mt-1">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Guest accounts</h2>
              <p className="text-sm text-neutral-500">Use these on the login page to explore preset dashboards.</p>
              <div className="mt-4 space-y-3">
                {guestList.map((acct) => (
                  <div key={acct.username} className="border border-neutral-200 rounded-2xl p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">{acct.username}</span>
                      <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">{acct.password}</span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">{acct.persona}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}
