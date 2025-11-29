"use client";

import { useEffect, useMemo, useState } from "react";
import ScoringBreakdown from "../components/ui/ScoringBreakdown";
import { useSession } from "next-auth/react";
import useUser from "../hooks/useUser";
import Link from "next/link";

type ScoreSummary = {
  score: number;
  percentile: number;
  total_co2e: number;
  avg_co2_per_dollar: number;
  total_spend: number;
};

type TopCategory = {
  category_id: string;
  name: string;
  transaction_count: number;
  total_co2e: number;
  total_spend: number;
  percentile: number;
};

const FALLBACK_SUMMARY: ScoreSummary = {
  score: 72,
  percentile: 74,
  total_co2e: 144,
  avg_co2_per_dollar: 0.016,
  total_spend: 9400,
};

const formatCurrency = (value?: number | string | null) => {
  const numeric = Number(value ?? 0) || 0;
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: numeric >= 1000 ? 0 : 2,
  }).format(numeric);
};

const formatCO2 = (value?: number | string | null) => {
  const numeric = Number(value ?? 0) || 0;
  return `${numeric.toFixed(1)} kg CO₂e`;
};

export default function ScoringPage() {
  const { data, isLoading } = useUser();
  const { data: session } = useSession();

  const [topItems, setTopItems] = useState<TopCategory[] | null>(null);
  const [loadingTop, setLoadingTop] = useState(true);
  const [errorTop, setErrorTop] = useState<string | null>(null);

  const [scoreSummary, setScoreSummary] = useState<ScoreSummary | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [loadingScore, setLoadingScore] = useState(true);

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:5000";

  useEffect(() => {
    let mounted = true;
    const fetchTop = async () => {
      if (isLoading || !session) return;
      try {
        const res = await fetch(`${backend}/api/transactions/top?limit=8`);
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as TopCategory[];
        if (!mounted) return;
        setTopItems(json || []);
      } catch (err: any) {
        console.error("Error fetching top categories:", err);
        setErrorTop(err?.message ?? String(err));
      } finally {
        if (mounted) setLoadingTop(false);
      }
    };
    fetchTop();
    return () => {
      mounted = false;
    };
  }, [backend, isLoading, session]);

  useEffect(() => {
    let mounted = true;
    const fetchScore = async () => {
      if (isLoading || !session) return;
      try {
        const res = await fetch(`${backend}/api/score`);
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as ScoreSummary;
        if (!mounted) return;
        setScoreSummary(json);
      } catch (err: any) {
        console.error("Error fetching score summary:", err);
        setScoreError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoadingScore(false);
      }
    };
    fetchScore();
    return () => {
      mounted = false;
    };
  }, [backend, isLoading, session]);

  const topSpendTotal = useMemo(() => {
    if (!topItems || topItems.length === 0) return 0;
    return topItems.reduce((acc, item) => acc + (Number(item.total_spend) || 0), 0);
  }, [topItems]);

  if (isLoading) return <p className="text-center py-10">Loading scoring view…</p>;
  if (!session)
    return (
      <div className="text-center py-10">
        <p>You must be logged in</p>
        <Link href="/login" className="text-blue-500 hover:underline mt-4 inline-block">
          Go to login
        </Link>
      </div>
    );

  const summary = scoreSummary ?? FALLBACK_SUMMARY;
  const percentile = Math.round(summary.percentile ?? FALLBACK_SUMMARY.percentile);
  const gramsPerDollar = (summary.avg_co2_per_dollar ?? FALLBACK_SUMMARY.avg_co2_per_dollar) * 1000;
  const heroName = session?.user?.name?.split(" ")[0] ?? "EcoBank member";

  const metricCards = [
    {
      label: "Eco score",
      value: summary.score?.toFixed(0) ?? "72",
      suffix: "/100",
      helper: `Ahead of ${percentile}% of EcoBank households`,
    },
    {
      label: "Carbon intensity",
      value: `${gramsPerDollar.toFixed(1)} g`,
      helper: "CO₂e per dollar spent",
    },
    {
      label: "Tracked spend",
      value: formatCurrency(summary.total_spend),
      helper: "Trailing 12 months",
    },
  ];

  const insightCards = [
    {
      title: "Compare with the Eco Ranking League",
      body: "See where you land against similar households and unlock new badges.",
      href: "/ranking",
    },
    {
      title: "Set a stretch score goal",
      body: "Choose a milestone and auto-generate weekly nudges and partner rewards.",
      href: "/goals",
    },
    {
      title: "Audit recent purchases",
      body: "Drill into the transactions contributing the most CO₂e and mute the noise.",
      href: "/transactions",
    },
  ];

  return (
    <div className="space-y-10 pb-16 mt-20">
      <section
        className="rounded-3xl bg-emerald-700 text-white p-10 shadow-xl"
        style={{ background: "linear-gradient(135deg,#0ea769,#0d8e5a,#066141)" }}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="uppercase tracking-[0.4em] text-xs text-emerald-100">Eco scoring</p>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              {heroName}, here&apos;s your impact pulse
            </h1>
            <p className="text-lg text-emerald-50/80 max-w-2xl">
              Live metrics from your recent spending plus guidance on how to climb the leaderboard.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur p-6 text-center border border-white/20 w-full max-w-sm self-stretch">
            <p className="text-sm text-emerald-100">Percentile</p>
            <p className="text-6xl font-bold mt-2">{percentile}</p>
            <p className="text-emerald-100/80 mt-1">Outperforming {percentile}% of EcoBank members</p>
            <Link
              href="/ranking"
              className="inline-flex items-center justify-center mt-6 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold hover:bg-white/30 transition"
            >
              View leaderboard ↗
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {metricCards.map((card) => (
            <div key={card.label} className="rounded-2xl bg-white/10 p-5 backdrop-blur border border-white/15">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-100">{card.label}</p>
              <div className="mt-3 flex items-end gap-1 text-3xl font-semibold">
                <span>{card.value}</span>
                {card.suffix && <span className="text-lg text-emerald-100/70">{card.suffix}</span>}
              </div>
              <p className="text-sm text-emerald-100/80 mt-2">{card.helper}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">Top impact watchlist</h2>
              <p className="text-sm text-neutral-500">Updated live from your latest transactions</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Live
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {loadingTop && <div className="p-4 text-sm text-neutral-500">Loading top categories…</div>}
            {errorTop && <div className="p-4 text-sm text-red-600">Error loading top categories: {errorTop}</div>}
            {!loadingTop && !errorTop && (!topItems || topItems.length === 0) && (
              <div className="p-4 text-sm text-neutral-500">No category data yet.</div>
            )}
            {!loadingTop && topItems && topItems.length > 0 && (
              <ul className="space-y-4">
                {topItems.map((category) => (
                  <li key={category.category_id} className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4 shadow-inner">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{category.category_id}</p>
                        <p className="text-lg font-semibold text-neutral-900">{category.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-500">Spend</p>
                        <p className="text-xl font-semibold text-neutral-900">
                          {formatCurrency(category.total_spend)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-neutral-600 flex flex-wrap gap-3">
                      <span>Transactions: {category.transaction_count}</span>
                      <span>CO₂e: {Number(category.total_co2e || 0).toFixed(1)} kg</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>Percentile</span>
                        <span className="font-semibold text-neutral-800">{category.percentile}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            background: "linear-gradient(90deg,#34d399,#10b981,#047857)",
                            width: `${Math.min(100, Number(category.percentile) || 0)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {topSpendTotal > 0 && (
            <div className="mt-6 rounded-2xl bg-neutral-900 text-white p-4 flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Watchlist spend</p>
                <p className="text-2xl font-semibold">{formatCurrency(topSpendTotal)}</p>
              </div>
              <p className="text-sm text-neutral-300 max-w-sm">
                Focus on these categories to unlock the quickest score gains.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Score drivers</h2>
                <p className="text-sm text-neutral-500">See which pillars help or hurt the most</p>
              </div>
              <Link href="/goals" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                Improve score →
              </Link>
            </div>
            <div className="mt-6">
              <ScoringBreakdown data={data?.scores} />
            </div>
          </div>

          <div
            className="rounded-2xl border border-neutral-200 bg-slate-50 p-6 shadow-inner"
            style={{ background: "linear-gradient(135deg,#f8fafc,#ffffff)" }}
          >
            <p className="text-sm text-neutral-500">Total CO₂e tracked</p>
            <p className="text-3xl font-semibold text-neutral-900 mt-2">{formatCO2(summary.total_co2e)}</p>
            {scoreError ? (
              <p className="mt-2 text-sm text-red-600">{scoreError}</p>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">
                Includes every categorized purchase synced with EcoBank.
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-neutral-400">Next best moves</p>
            <h2 className="text-2xl font-semibold text-neutral-900">Keep climbing with guided actions</h2>
          </div>
          <Link href="/coach" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
            Talk to Eco Coach →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {insightCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Action</p>
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
