"use client";

interface ScoreItem {
  id: number;
  category: string;
  impact: number; // positive or negative
}

const dummyScores: ScoreItem[] = [
  { id: 1, category: "Transportation", impact: -12 },
  { id: 2, category: "Electricity Usage", impact: +20 },
  { id: 3, category: "Waste Reduction", impact: +14 },
  { id: 4, category: "Food Consumption", impact: -5 },
  { id: 5, category: "Shopping Habits", impact: +8 },
];

export default function ScoringBreakdown({ data = dummyScores }) {
  return (
    <div className="rounded-2xl bg-white p-2">
      <div className="space-y-5">
        {data.map((item) => {
          const isPositive = item.impact >= 0;

          const barWidth = Math.min(Math.abs(item.impact), 25) * 4; 
          // scales impact visually (max ~100%)

          return (
            <div key={item.id}>
              {/* Row Header */}
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-neutral-800">
                  {item.category}
                </p>
                <p
                  className={`font-semibold ${
                    isPositive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isPositive ? "+" : "-"}
                  {Math.abs(item.impact)}
                </p>
              </div>

              {/* Impact Bar */}
              <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isPositive ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}