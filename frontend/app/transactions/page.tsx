"use client";

import { useEffect, useState } from "react";
import TransactionList from "../components/ui/TransactionList";
import Head from "next/head";
import Link from "next/link";
import useUser from "../hooks/useUser";
import { useSession } from "next-auth/react";

type Tx = {
  id: number;
  name: string;
  category: string;
  amount: number;
  price?: number;
  date: string;
};

export default function Transactions() {
    const { data, isLoading } = useUser();
    const { data: session, status: sessionStatus } = useSession();

    // Hooks must be called in the same order on every render.
    // Move local state hooks to the top so early returns don't skip them.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Tx[]>([]);

    const backend = "http://127.0.0.1:5000";

    // Define nested component up-front so its hooks are not conditionally declared
    function TopCategoriesCard() {
        const [items, setItems] = useState<any[] | null>(null);
        const [loadingTop, setLoadingTop] = useState(true);
        const [errorTop, setErrorTop] = useState<string | null>(null);

        useEffect(() => {
            let mounted = true;
            const fetchTop = async () => {
                try {
                    const res = await fetch(`${backend}/api/transactions/top?limit=10`);
                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();
                    if (!mounted) return;
                    setItems(data || []);
                } catch (err: any) {
                    console.error('Error loading top categories:', err);
                    setErrorTop(err?.message ?? String(err));
                } finally {
                    if (mounted) setLoadingTop(false);
                }
            };
            fetchTop();
            return () => { mounted = false; };
        }, []);

        if (loadingTop) return <div className="p-4">Loading top categories…</div>;
        if (errorTop) return <div className="p-4 text-red-600">Error loading top categories: {errorTop}</div>;
        if (!items || items.length === 0) return <div className="p-4">No category data</div>;

        return (
            <div className="mb-6 border rounded-md p-4 bg-white">
                <h2 className="text-lg font-semibold mb-2">Top 10 Categories by CO2 Impact</h2>
                <ul className="space-y-2">
                    {items.map((c) => (
                        <li key={c.category_id} className="flex justify-between items-baseline">
                            <div>
                                <div className="font-medium">{c.name}</div>
                                <div className="text-sm text-neutral-500">Transactions: {c.transaction_count} • CO2: {c.total_co2e}</div>
                            </div>
                            <div className="text-sm text-right">
                                <div className="text-xs text-neutral-500">Spend</div>
                                <div className="font-semibold">${c.total_spend}</div>
                                <div className="text-xs mt-1">{c.percentile}%</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // Transactions fetching effect must run (hook called) on every render to keep hook order stable.
    useEffect(() => {
        let mounted = true;
        const fetchTx = async () => {
            // don't fetch until user/session is ready
            if (isLoading || !session) {
                // still mark loading false if not mounted? keep loading true until we actually fetch
                return;
            }
            try {
                const res = await fetch(`${backend}/api/transactions`);
                if (!res.ok) throw new Error(await res.text());
                const json = await res.json();

                if (!mounted) return;

                // Filter transactions within last 2 years
                const now = new Date();
                const cutoff = new Date(now);
                cutoff.setFullYear(cutoff.getFullYear() - 2);

                const filtered: Tx[] = (json || []).filter((t: any) => {
                    if (!t?.date) return false;
                    const d = new Date(t.date);
                    return !isNaN(d.getTime()) && d >= cutoff && d <= now;
                });

                // Sort desc by date
                filtered.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                setTransactions(filtered);
            } catch (err: any) {
                console.error("Error loading transactions:", err);
                setError(err?.message ?? String(err));
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchTx();
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

    if (loading) return <p className="text-center py-8">Loading transactions…</p>;
    if (error) return <p className="text-center py-8 text-red-600">Error: {error}</p>;

    return (
        <>
        <Head>
            <title>Transactions</title>
        </Head>

        <div className="p-6 mt-20">
            <h1 className="text-2xl font-bold mb-4">Transactions (last 2 years)</h1>

            <div className="border rounded-md p-4 bg-white">
                <div className="mb-3 text-sm text-neutral-500">Showing {transactions.length} transactions from the last 2 years.</div>
                <div className="max-h-[70vh] overflow-y-auto">
                    <TransactionList data={transactions} />
                </div>
            </div>
        </div>
        </>
    );
}
