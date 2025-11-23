"use client";

import { useEffect, useState } from "react";
import TransactionList from "../components/ui/TransactionList";
import Head from "next/head";

type Tx = {
  id: number;
  name: string;
  category: string;
  amount: number;
  price?: number;
  date: string;
};

export default function Transactions() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Tx[]>([]);

  const backend = "http://127.0.0.1:5000";

  useEffect(() => {
    let mounted = true;
    const fetchTx = async () => {
      try {
        const res = await fetch(`${backend}/api/transactions/`);
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
  }, []);

  if (loading) return <p className="text-center py-8">Loading transactions…</p>;
  if (error) return <p className="text-center py-8 text-red-600">Error: {error}</p>;

  return (
    <>
      <Head>
        <title>Transactions</title>
      </Head>

      <div className="p-6">
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
