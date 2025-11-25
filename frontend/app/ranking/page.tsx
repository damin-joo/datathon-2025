"use client";

import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import RankingLeaderboard from "../components/ui/RankingLeaderboard";
import { useSession } from "next-auth/react";
import { DEMO_LEADERBOARD, GUEST_ACCOUNTS, BADGE_DESCRIPTIONS, type LeaderboardDemoEntry } from "../lib/demoData";

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
        setLeaderboard(
          (json || []).map((row) => ({
            ...row,
            display_name: row.display_name ?? row.user_id,
            badge: row.badge ?? "Earth Ally",
            eco_points: row.eco_points ?? 0,
          }))
        );
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

  return (
    <>
      <Head>
        <title>Eco Ranking</title>
      </Head>
      <div className="mt-20 pb-16 space-y-10 px-4 md:px-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium">Community challenge</span>
            {loading && <span className="text-sm text-neutral-500">Refreshing…</span>}
            {error && <span className="text-sm text-amber-700">{error}</span>}
          </div>
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Eco Ranking League</h1>
              <p className="text-neutral-600 mt-2 max-w-2xl">
                Track how each persona keeps emissions low across food, transit, and shopping. Use the guest logins below to tour different lifestyles.
              </p>
            </div>
            <button
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-800"
              onClick={() => window.location.reload()}
            >
              Refresh data
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RankingLeaderboard data={leaderboard} currentUserId={currentUser} />
          </div>
          <aside className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold">Guest accounts</h2>
            <p className="text-sm text-neutral-500">Use these personas on the login page to explore preset dashboards.</p>
            <div className="space-y-3">
              {guestList.map((acct) => (
                <div key={acct.username} className="border border-neutral-200 rounded-xl p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{acct.username}</span>
                    <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded">{acct.password}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{acct.persona}</p>
                </div>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">Badge guide</h2>
          <p className="text-sm text-neutral-500">Each ranking tier reflects how diversified someone&apos;s low-carbon habits are.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(BADGE_DESCRIPTIONS).map(([badge, description]) => (
              <div key={badge} className="border border-neutral-100 rounded-xl p-4 bg-neutral-50">
                <p className="text-sm font-semibold">{badge}</p>
                <p className="text-xs text-neutral-500 mt-1">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
