"use client";

import { useEffect, useState, useCallback } from "react";

import Card from "../components/ui/Card";
import Chart from "../components//ui/Chart";
import CoachingSuggestions from "../components//ui/CoachingSuggestions";
import Goals from "../components//ui/Goals";
import TransactionList from "../components//ui/TransactionList";

import useUser from "../hooks/useUser";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";
import type { CoachingAckAction, CoachingPayload } from "../types/coaching";

type RawRecord = Record<string, unknown>;

type DashboardGoal = {
  id: number;
  title: string;
  current: number;
  target: number;
};

type MonthlyScorePoint = {
  month: string;
  score: number;
};

type ScoreResponse = {
  score?: number;
  percentile?: number;
  total_co2e?: number;
  avg_co2_per_dollar?: number;
  total_spend?: number;
};

type TransactionRow = {
  id: number;
  name: string;
  category: string;
  category_name: string;
  env_label: string;
  amount: number;
  date: string;
};

type EcoSummary = {
  user_id?: string;
  total_co2?: number | null;
  eco_score_percentile?: number | null;
  eco_points?: number | null;
};

type AckState = CoachingAckAction | "pending" | "error";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:5000";

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const { isLoading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useState<DashboardGoal[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<MonthlyScorePoint[]>([]);
  const [scores, setScores] = useState<ScoreResponse | null>(null);
  const [ecoSummary, setEcoSummary] = useState<EcoSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [totalSpend, setTotalSpend] = useState<number | null>(null);
  const [coaching, setCoaching] = useState<CoachingPayload | null>(null);
  const [coachingError, setCoachingError] = useState<string | null>(null);
  const [coachingLoading, setCoachingLoading] = useState(true);
  const [ackStatuses, setAckStatuses] = useState<Record<string, AckState>>({});
  const userId = session?.user?.email || session?.user?.name || "guest";
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    const monthParam = (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    })();

    const requests = [
      { key: "goals", url: `${BACKEND_BASE}/api/goals` },
      { key: "monthlyScores", url: `${BACKEND_BASE}/api/monthly-scores` },
      { key: "scores", url: `${BACKEND_BASE}/api/score` },
      { key: "transactions", url: `${BACKEND_BASE}/api/transactions` },
      { key: "ecoSummary", url: `${BACKEND_BASE}/api/transactions/eco-score?user_id=${encodeURIComponent(userId)}` },
      { key: "total", url: `${BACKEND_BASE}/api/transactions/total?month=${monthParam}` },
    ];

    try {
      const results = await Promise.all(
        requests.map(async ({ key, url }) => {
          const res = await fetch(url);
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`${key} request failed: ${res.status} ${res.statusText} ${text}`);
          }
          return { key, data: await res.json() };
        })
      );

      const map = results.reduce<Record<string, unknown>>((acc, curr) => {
        acc[curr.key] = curr.data;
        return acc;
      }, {});

      const toNumber = (value: unknown, fallback = 0) => {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
      };

      const toStringVal = (value: unknown, fallback = "") => {
        if (typeof value === "string" && value.trim().length) {
          return value;
        }
        return fallback;
      };

      const rawGoals = Array.isArray(map.goals) ? (map.goals as RawRecord[]) : [];
      const rawMonthly = Array.isArray(map.monthlyScores) ? (map.monthlyScores as RawRecord[]) : [];
      const rawTransactions = Array.isArray(map.transactions) ? (map.transactions as RawRecord[]) : [];

      const normalizedGoals: DashboardGoal[] = rawGoals.map((goal, idx) => {
        const title = toStringVal(goal.title ?? goal.name, `Goal ${idx + 1}`);
        const current = toNumber(goal.current ?? goal.progress ?? 0, 0);
        const target = Math.max(toNumber(goal.target ?? goal.goal ?? 100, 100), 1);
        return {
          id: toNumber(goal.id ?? idx + 1, idx + 1),
          title,
          current,
          target,
        };
      });

      const normalizedMonthly: MonthlyScorePoint[] = rawMonthly.map((point, idx) => ({
        month: toStringVal(point.month, `M${idx + 1}`),
        score: toNumber(point.score ?? point.value ?? 0, 0),
      }));

      const normalizedTransactions: TransactionRow[] = rawTransactions.map((tx, idx) => {
        const categoryLabel = toStringVal(tx.category_name ?? tx.category ?? tx.category_id, "Other");
        const envLabel = (() => {
          const val = toStringVal(tx.env_label, "neutral").toLowerCase();
          if (["good", "neutral", "bad"].includes(val)) return val;
          return "neutral";
        })();
        const isoToday = new Date().toISOString().split("T")[0];
        return {
          id: toNumber(tx.id ?? idx + 1, idx + 1),
          name: toStringVal(tx.name ?? tx.merchant, "Unknown Merchant"),
          category: toStringVal(tx.category ?? tx.category_id, categoryLabel),
          category_name: categoryLabel,
          env_label: envLabel,
          amount: toNumber(tx.amount ?? tx.price, 0),
          date: toStringVal(tx.date, isoToday) || isoToday,
        };
      });

      setGoals(normalizedGoals);
      setMonthlyScores(normalizedMonthly);
      setScores(typeof map.scores === "object" && map.scores !== null ? (map.scores as ScoreResponse) : null);
      setTransactions(normalizedTransactions);
      setEcoSummary(typeof map.ecoSummary === "object" && map.ecoSummary !== null ? (map.ecoSummary as EcoSummary) : null);
      if (typeof map.total === "object" && map.total !== null && "total" in map.total) {
        const totalValue = Number((map.total as Record<string, unknown>).total);
        setTotalSpend(Number.isFinite(totalValue) ? totalValue : 0);
      } else if (typeof map.total === "object" && map.total !== null && "total_spend" in map.total) {
        const totalValue = Number((map.total as Record<string, unknown>).total_spend);
        setTotalSpend(Number.isFinite(totalValue) ? totalValue : 0);
      } else {
        setTotalSpend(0);
      }
    } catch (err: unknown) {
      console.error("Error fetching dashboard data:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchCoaching = useCallback(async () => {
    if (!userId) return;
    setCoachingLoading(true);
    setCoachingError(null);
    try {
      const res = await fetch(
        `${BACKEND_BASE}/api/coaching/suggestions?user_id=${encodeURIComponent(userId)}`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as CoachingPayload;
      setCoaching(data);
      setAckStatuses((prev) => {
        const next: Record<string, AckState> = {};
        (data.suggestions || []).forEach((suggestion) => {
          if (prev[suggestion.suggestion_id]) {
            next[suggestion.suggestion_id] = prev[suggestion.suggestion_id];
          }
        });
        return next;
      });
    } catch (err: unknown) {
      console.error("Error fetching coaching data:", err);
      setCoaching(null);
      setCoachingError(err instanceof Error ? err.message : String(err));
    } finally {
      setCoachingLoading(false);
    }
  }, [userId]);

  const handleSuggestionAction = useCallback(
    async (suggestionId: string, action: CoachingAckAction) => {
      if (!suggestionId) return;
      setAckStatuses((prev) => ({ ...prev, [suggestionId]: "pending" }));
      try {
        const res = await fetch(`${BACKEND_BASE}/api/coaching/suggestions/ack`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suggestion_id: suggestionId,
            action,
            user_id: userId || "guest",
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `${res.status} ${res.statusText}`);
        }
        setAckStatuses((prev) => ({ ...prev, [suggestionId]: action }));
        await fetchCoaching();
      } catch (err: unknown) {
        console.error("Failed to record coaching action", err);
        setAckStatuses((prev) => ({ ...prev, [suggestionId]: "error" }));
        setCoachingError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchCoaching, userId]
  );

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      setLoading(false);
      setCoachingLoading(false);
      return;
    }
    fetchDashboard();
    fetchCoaching();
  }, [fetchDashboard, fetchCoaching, session, sessionStatus]);

  if (sessionStatus === "loading" || userLoading || loading) return <p className="text-center py-10">Loading...</p>;

  if (!session)
    return (
      <div className="text-center py-10">
        <p>You must be logged in</p>
        <Link href="/login" className="text-blue-500 hover:underline mt-4 inline-block">
          Go to login
        </Link>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-10">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    );

  // Safe fallbacks for values used in UI
  const monthData = monthlyScores ?? [];
  // ranking removed — no rank to display
  // Debug: log scores to see what the API returns
  if (scores && typeof window !== 'undefined') {
    console.log('scores:', scores);
  }
  // If scores is an array, take the first element; if object, try .score; else fallback
  let ecoScore: string | number = "-";
  if (scores) {
    if (Array.isArray(scores)) {
      // Try to find a numeric score in the first element
      ecoScore = scores[0]?.score ?? scores[0] ?? "-";
    } else if (typeof scores === 'object' && scores !== null) {
      ecoScore = scores.score ?? "-";
    } else if (typeof scores === 'string' || typeof scores === 'number') {
      ecoScore = scores;
    }
    // If still object, stringify for debug
    if (typeof ecoScore === 'object') {
      ecoScore = JSON.stringify(ecoScore);
    }
  }

  // Format total spend with thousands separators and two decimals
  const ecoPercentile = ecoSummary?.eco_score_percentile ?? scores?.score ?? ecoScore ?? 0;
  const ecoPoints = ecoSummary?.eco_points ?? null;
  const totalCO2 = ecoSummary?.total_co2 ?? scores?.total_co2e ?? null;
  const spendingReduction = goals.length ? Math.min(100, Math.round((goals[0].current / Math.max(goals[0].target, 1)) * 100)) : 0;
  const formattedTotalSpend = totalSpend !== null ? `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-`;
  const formattedCO2 = totalCO2 !== null ? `${Number(totalCO2).toLocaleString('en-US', { maximumFractionDigits: 1 })} kg` : '-';
  const latestProfile = coaching?.profiles?.[0];
  const profileWeekLabel = (() => {
    if (!latestProfile?.week_start) return null;
    const parsed = new Date(latestProfile.week_start);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  })();
  const topImpacts = latestProfile?.top_categories?.slice(0, 3) ?? [];

  return (
    <>
      <Head>
        <title>EcoCard</title>
        <meta name="description" content="Environmental Impact Credit Card" />
      </Head>
      <div className="space-y-10 pb-12">
        {/* Page Title */}
        <h1 className="text-4xl font-bold tracking-tight">Welcome, {session.user?.name}</h1>

        {/* Top Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="Monthly Spend" value={formattedTotalSpend} />
          <Card title="Eco Percentile" value={`${ecoPercentile || 0}%`} />
          <Card title="Eco Points" value={ecoPoints !== null ? `${ecoPoints}` : "-"}>
            <p className="text-sm text-neutral-500">{formattedCO2 !== '-' ? `Total impact ${formattedCO2}` : 'Track purchases to see impact'}</p>
          </Card>
        </section>

        {/* Middle Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Card>
              <div className="max-h-80 overflow-y-auto">
                <TransactionList data={transactions.slice(0, 15)} />
              </div>
            </Card>
          </div>

          {/* Quick actions */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <Card>
              <div className="space-y-4 text-sm text-neutral-600">
                <p>Jump into the focused views when you need to go deeper.</p>
                <div className="space-y-3">
                  <Link href="/transactions" className="block rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-800">
                    <span className="block text-base font-semibold text-neutral-900">Full Transactions Log</span>
                    <span className="text-xs text-neutral-500">Filter and export the last 24 months</span>
                  </Link>
                  <Link href="/ranking" className="block rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-800">
                    <span className="block text-base font-semibold text-neutral-900">Eco Ranking League</span>
                    <span className="text-xs text-neutral-500">Compare personas and badge tiers</span>
                  </Link>
                  <Link href="/goals" className="block rounded-xl border border-neutral-200 px-4 py-3 hover:border-neutral-800">
                    <span className="block text-base font-semibold text-neutral-900">Goal Planner</span>
                    <span className="text-xs text-neutral-500">Update your monthly targets</span>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Eco Score Progress" value={`${ecoPercentile || 0}%`}>
            <p className="text-sm text-neutral-500">
              View the full breakdown on the <Link href="/scoring" className="text-emerald-600 hover:underline">scoring page</Link> to see how each category contributes.
            </p>
          </Card>
          <Card title="Spending Reduction" value={`${spendingReduction}%`}>
            <p className="text-sm text-neutral-500">
              Tune your monthly target on the <Link href="/goals" className="text-emerald-600 hover:underline">goals planner</Link>.
            </p>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Eco Coaching</h2>
              <button
                type="button"
                onClick={fetchCoaching}
                disabled={coachingLoading}
                className="text-sm text-emerald-700 hover:text-emerald-900 disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
            <Card>
              <CoachingSuggestions
                suggestions={coaching?.suggestions ?? []}
                ackStatuses={ackStatuses}
                loading={coachingLoading}
                error={coachingError}
                onAction={handleSuggestionAction}
              />
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Weekly Impact Snapshot</h2>
            <Card>
              {latestProfile ? (
                <div className="space-y-4">
                  <div className="text-sm text-neutral-500">
                    Week of {profileWeekLabel ?? `Week ${latestProfile.week}`}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-neutral-500">Spend</p>
                      <p className="text-2xl font-semibold text-neutral-900">
                        ${latestProfile.total_spend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">CO₂e</p>
                      <p className="text-2xl font-semibold text-neutral-900">
                        {latestProfile.total_co2.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-700">Top categories</p>
                    {topImpacts.length > 0 ? (
                      <ul className="mt-2 space-y-2">
                        {topImpacts.map((cat) => {
                          const badgeClass =
                            cat.env_label === 'good'
                              ? 'text-emerald-700'
                              : cat.env_label === 'bad'
                              ? 'text-rose-700'
                              : 'text-amber-700';
                          return (
                            <li key={cat.category_id} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-neutral-800">{cat.category_name}</span>
                              <span className={`text-xs ${badgeClass}`}>
                                {cat.total_co2.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg · {cat.env_label}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-xs text-neutral-500 mt-2">No high-impact categories logged this week.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Add a few transactions to see your weekly impact breakdown.</p>
              )}
            </Card>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Scoring History</h2>
            <Card>
              <Chart data={monthData || []} />
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Goals</h2>
            <Card>
              <Goals data={goals || []} />
            </Card>
          </div>
        </section>

        {/* <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Card title="Top Impact Categories"></Card>
          </div>
        </section> */}
      </div>
    </>
  );
}