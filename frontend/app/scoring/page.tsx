"use client";

import { useEffect, useState } from "react";
import ScoringBreakdown from "../components/ui/ScoringBreakdown";
import { useSession } from "next-auth/react";
import useUser from "../hooks/useUser";
import Link from "next/link";

export default function ScoringPage() {
  const { data, isLoading } = useUser();
  const { data: session, status: sessionStatus } = useSession();

  // Top categories state (hooks must be declared before any early return)
  const [topItems, setTopItems] = useState<any[] | null>(null);
  const [loadingTop, setLoadingTop] = useState(true);
  const [errorTop, setErrorTop] = useState<string | null>(null);

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:5000";

  // Fetch top categories (runs when session becomes available)
  useEffect(() => {
    let mounted = true;
    const fetchTop = async () => {
      if (isLoading || !session) return;
      try {
        const res = await fetch(`${backend}/api/transactions/top?limit=10`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        if (!mounted) return;
        setTopItems(json || []);
      } catch (err: any) {
        console.error('Error fetching top categories:', err);
        setErrorTop(err?.message ?? String(err));
      } finally {
        if (mounted) setLoadingTop(false);
      }
    };
    fetchTop();
    return () => { mounted = false; };
  }, [isLoading, session]);

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
    <div className="space-y-10 pb-12 mt-20">
      <section>
        <h2 className="text-2xl font-semibold">Top 10 Impactful Categories</h2>
        <div className="mt-4 border rounded-md p-4 bg-white">
          {loadingTop && <div className="p-4">Loading top categories…</div>}
          {errorTop && <div className="p-4 text-red-600">Error loading top categories: {errorTop}</div>}
          {!loadingTop && !errorTop && (!topItems || topItems.length === 0) && <div className="p-4">No category data</div>}
          {!loadingTop && topItems && topItems.length > 0 && (
            <ul className="space-y-2">
              {topItems.map((c) => (
                <li key={c.category_id} className="flex justify-between items-baseline">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-neutral-500">Transactions: {c.transaction_count} • CO2: {c.total_co2e}</div>
                  </div>
                  <div className="text-sm text-right">
                    <div className="text-xs text-neutral-500">Spend</div>
                    <div className="text-xl font-semibold">${Number(c.total_spend).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-xs mt-1">{c.percentile}%</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
