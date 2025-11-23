"use client";

import { useEffect, useState } from "react";

import Card from "./components/ui/Card";
import Chart from "./components/ui/Chart";
import Goals from "./components/ui/Goals";
import TransactionList from "./components/ui/TransactionList";

import useUser from "./hooks/useUser";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";

type AnyObject = any;

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const { isLoading: userLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [goals, setGoals] = useState<AnyObject[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<AnyObject[]>([]);
  const [scores, setScores] = useState<AnyObject | null>(null);
  const [transactions, setTransactions] = useState<AnyObject[]>([]);
  const [totalSpend, setTotalSpend] = useState<number | null>(null);
  const backend = "http://127.0.0.1:5000";

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Use full backend URLs for local dev
        const backend = "http://127.0.0.1:5000";
        const endpoints = [
          `${backend}/api/goals`,
          `${backend}/api/monthly-scores`,
          `${backend}/api/score`,
          `${backend}/api/transactions`,
        ];

        const responses = await Promise.all(endpoints.map((ep) => fetch(ep)));
        responses.forEach((r, i) => {
          if (!r.ok) {
            console.error(`Fetch error: ${r.status} ${r.statusText} for ${endpoints[i]}`);
          }
        });
        const jsons = await Promise.all(responses.map((r, i) => {
          if (!r.ok) {
            throw new Error(`Endpoint ${endpoints[i]} returned ${r.status} ${r.statusText}`);
          }
          return r.json();
        }));

        if (!mounted) return;

        setGoals(jsons[0] ?? []);
        setMonthlyScores(jsons[1] ?? []);
        setScores(jsons[2] ?? null); // now /api/score returns { score, total_co2e }
        setTransactions(jsons[3] ?? []);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  // Fetch monthly total spend from backend
  useEffect(() => {
    let mounted = true;
    const fetchTotal = async () => {
      try {
        const now = new Date();
        const monthParam = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const res = await fetch(`${backend}/api/transactions/total?month=${monthParam}`);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        if (!mounted) return;
        setTotalSpend(Number(json.total ?? 0));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching total spend:", err);
      }
    };
    fetchTotal();
    return () => { mounted = false; };
  }, []);

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
  const formattedTotalSpend = totalSpend !== null ? `$${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-`;

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
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Monthly Spend" value={formattedTotalSpend} />
          <Card title="Eco Score" value={`${ecoScore || 0}%`} />
        </section>

        {/* Middle Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Card>
              <div className="max-h-80 overflow-y-auto">
                <TransactionList data={transactions.slice(0, 20)} />
              </div>
            </Card>
          </div>

          {/* Progress cards */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Progress</h2>
            <div className="grid gap-3">
              <Card title="Eco Score Progress" value={`${ecoScore || 0}%`} />
              <Card title="Spending Reduction" value={`${goals?.[0]?.spending_reduction ?? 0}%`} />
            </div>
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

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Card title="Top Impact Categories"></Card>
          </div>
        </section>
      </div>
    </>
  );
}