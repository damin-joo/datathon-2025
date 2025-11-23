"use client";

import Card from "./components/ui/Card";
import Chart from "./components/ui/Chart";
import Goals from "./components/ui/Goals";
import TransactionList from "./components/ui/TransactionList";

import useUser from "./hooks/useUser";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const { data, isLoading } = useUser();

  if (sessionStatus === "loading" || isLoading) return <p className="text-center py-10">Loading...</p>;
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
          <Card title="Monthly Spend" value={`$${data?.monthly_spend || 0}`} />
          <Card title="Eco Score" value={data?.eco_score || "-"} />
          <Card title="Rank" value={`#${data?.rank || "-"}`} />
        </section>

        {/* Middle Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
            <Card>
              <TransactionList data={data?.transactions} />
            </Card>
          </div>

          {/* Progress cards */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Progress</h2>
            <div className="grid gap-3">
              {/* Example: show user's eco score progress */}
              <Card title="Eco Score Progress" value={`${data?.eco_score || 0}%`} />
              
              {/* Example: show spending reduction progress */}
              <Card title="Spending Reduction" value={`${data?.spending_reduction || 0}%`} />
            </div>
          </div>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Scoring History</h2>
            <Card>
              <Chart data={data?.history || []} />
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Goals</h2>
            <Card>
              <Goals data={data?.goals} />
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}