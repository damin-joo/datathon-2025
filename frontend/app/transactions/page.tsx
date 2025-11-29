"use client";

import { useEffect, useMemo, useState } from "react";
import TransactionList from "../components/ui/TransactionList";
import Head from "next/head";
import Link from "next/link";
import useUser from "../hooks/useUser";
import { useSession } from "next-auth/react";
import { ArrowDownToLine, ArrowUpRight } from "lucide-react";

type Tx = {
  id: number;
  name: string;
  category: string;
  amount: number;
  price?: number;
  date: string;
  category_name: string;
  env_label: string;
};

const DEFAULT_BACKEND = "http://127.0.0.1:5000";

const formatCurrency = (value?: number | string | null) => {
    const numeric = Number(value ?? 0) || 0;
    return new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
    }).format(numeric);
};

export default function Transactions() {
    const { data, isLoading } = useUser();
    const { data: session } = useSession();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Tx[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND;

    useEffect(() => {
        let mounted = true;
        const fetchTx = async () => {
            if (isLoading || !session) {
                return;
            }
            try {
                const res = await fetch(`${backend}/api/transactions`);
                if (!res.ok) throw new Error(await res.text());
                const json = await res.json();

                if (!mounted) return;

                const now = new Date();
                const cutoff = new Date(now);
                cutoff.setFullYear(cutoff.getFullYear() - 2);

                const filtered: Tx[] = (json || []).filter((t: any) => {
                    if (!t?.date) return false;
                    const d = new Date(t.date);
                    return !isNaN(d.getTime()) && d >= cutoff && d <= now;
                });

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
        return () => {
            mounted = false;
        };
    }, [backend, isLoading, session]);

    const totalSpend = useMemo(() => {
        if (!transactions.length) return 0;
        return transactions.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
    }, [transactions]);

    const handleExport = () => {
        if (isExporting || !transactions.length || typeof window === "undefined") return;
        setIsExporting(true);
        try {
            const headers = ["id","name","category","amount","date","env_label"];
            const csvRows = transactions.map((tx) =>
                [tx.id, tx.name, tx.category_name ?? tx.category, tx.amount, tx.date, tx.env_label]
                    .map((value) => {
                        const stringValue = value ?? "";
                        const escaped = `${stringValue}`.replace(/"/g, '""');
                        return `"${escaped}"`;
                    })
                    .join(",")
            );
            const csvContent = [headers.join(","), ...csvRows].join("\n");
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.setAttribute("download", `eco-transactions-${Date.now()}.csv`);
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to export CSV", err);
        } finally {
            setIsExporting(false);
        }
    };

    if (isLoading) return <p className="text-center py-10">Loading transactions…</p>;
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

            <div className="space-y-10 pb-16 mt-20">
                <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Ledger</p>
                            <h1 className="text-3xl font-semibold text-neutral-900">Transactions (last 24 months)</h1>
                            <p className="text-sm text-neutral-500 mt-1">{transactions.length} entries • {formatCurrency(totalSpend)} tracked</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={isExporting || transactions.length === 0}
                                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:border-neutral-800 disabled:opacity-50"
                            >
                                <ArrowDownToLine className="h-4 w-4" />
                                Export CSV
                            </button>
                            <Link
                                href="/scoring"
                                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white"
                            >
                                See scoring impact
                                <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="rounded-2xl border border-neutral-100 bg-neutral-50/70 max-h-112 overflow-y-auto">
                            <TransactionList data={transactions} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Filters</p>
                            <p className="text-sm text-neutral-500 mt-2">Full filtering will live here soon.</p>
                        </div>
                        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">Next steps</p>
                            <div className="mt-3 space-y-3 text-sm">
                                {[{
                                    title: "Spot anomalies",
                                    body: "Jump to scoring to see spikes",
                                    href: "/scoring",
                                }, {
                                    title: "Set goal tracking",
                                    body: "Convert big spend into habits",
                                    href: "/goals",
                                }].map((card) => (
                                    <Link
                                        key={card.href}
                                        href={card.href}
                                        className="block rounded-2xl border border-neutral-100 px-4 py-3 hover:border-neutral-400 transition"
                                    >
                                        <p className="font-semibold text-neutral-900 flex items-center gap-2">
                                            {card.title}
                                            <ArrowUpRight className="h-4 w-4" />
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">{card.body}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
