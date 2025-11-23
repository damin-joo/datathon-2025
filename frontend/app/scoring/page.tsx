"use client";

import ScoringBreakdown from "../components/ui/ScoringBreakdown";
import { useSession } from "next-auth/react";
import useUser from "../hooks/useUser";
import Link from "next/link";

export default function ScoringPage() {
  const { data, isLoading } = useUser();
  const { data: session, status: sessionStatus } = useSession();

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
    <div className="space-y-10 pb-12">
      <h1 className="text-4xl font-bold tracking-tight">Scoring Breakdown</h1>

      <ScoringBreakdown data={data?.scoringBreakdown} />
    </div>
  );
}
