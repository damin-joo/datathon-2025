"use client";

interface RankingUser {
  id: number;
  name: string;
  score: number;
  rank: number;
}

const dummyRanking: RankingUser[] = [
  { id: 1, name: "Alice Kim", score: 892, rank: 1 },
  { id: 2, name: "Ben Torres", score: 874, rank: 2 },
  { id: 3, name: "Clara Wu", score: 861, rank: 3 },
  { id: 4, name: "Daniel Park", score: 830, rank: 4 },
  { id: 5, name: "Eli Johnson", score: 804, rank: 5 },
  { id: 6, name: "Fatima Ali", score: 790, rank: 6 },
  { id: 7, name: "George Liu", score: 775, rank: 7 },
  { id: 8, name: "Heather Lee", score: 760, rank: 8 },
  { id: 9, name: "Ian Foster", score: 742, rank: 9 },
  { id: 10, name: "Jenny Cho", score: 731, rank: 10 },
];

export default function RankingLeaderboard({ data = dummyRanking }) {
  const medal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  return (
    <div className="rounded-2xl bg-white p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4">
        Leaderboard
      </h3>

      <div className="space-y-3">
        {data.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-neutral-50 transition"
          >
            {/* Left side */}
            <div className="flex items-center gap-3">
              {/* Rank badge */}
              <div className="w-8 text-center font-bold text-neutral-700">
                {medal(user.rank) || user.rank}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold">
                {user.name[0]}
              </div>

              {/* Name */}
              <div className="font-medium text-neutral-800">{user.name}</div>
            </div>

            {/* Score */}
            <div className="font-semibold text-neutral-900">{user.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
