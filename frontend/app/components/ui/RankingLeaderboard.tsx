"use client";

import { DEMO_LEADERBOARD, type LeaderboardDemoEntry } from "../../lib/demoData";

type LeaderboardEntry = Partial<LeaderboardDemoEntry> & {
  user_id: string;
  eco_points: number | null;
  eco_score_percentile?: number | null;
  total_co2?: number;
  total_spend?: number;
  tx_count?: number;
};

interface Props {
  data?: LeaderboardEntry[];
  currentUserId?: string | null;
}

const placeholder: LeaderboardEntry[] = DEMO_LEADERBOARD;

export default function RankingLeaderboard({ data = placeholder, currentUserId }: Props) {
  const medal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const formatName = (entry: LeaderboardEntry) => {
    if (entry.display_name) return entry.display_name;
    if (!entry.user_id) return "Unknown";
    const [local] = entry.user_id.split("@");
    return local || entry.user_id;
  };

  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">
        Leaderboard
      </h3>

      {!data.length && (
        <p className="text-sm text-neutral-500">No participants yet.</p>
      )}

      <div className="space-y-3">
        {data.map((user, idx) => (
          <div
            key={`${user.user_id}-${idx}`}
            className={`flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition ${currentUserId && user.user_id === currentUserId ? "bg-emerald-50 border border-emerald-200" : ""}`}
          >
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* Rank badge */}
              <div className="w-8 text-center font-bold text-neutral-700">
                {medal(idx + 1) || idx + 1}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                {formatName(user)[0]?.toUpperCase()}
              </div>

              {/* Name */}
              <div className="font-medium text-neutral-800 flex flex-col">
                <span>{formatName(user)}</span>
                {user.badge && (
                  <span className="text-xs text-neutral-500">{user.badge}</span>
                )}
              </div>
            </div>

            {/* Score */}
            <div className="text-right">
              <p className="font-semibold text-neutral-900">{user.eco_points ?? "-"} pts</p>
              <p className="text-xs text-neutral-500">{user.total_co2?.toFixed?.(1) ?? "-"} kg CO₂</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
