"use client";

interface Goal {
  id: number;
  title: string;
  current: number;
  target: number;
}

const dummyGoals: Goal[] = [
  {
    id: 1,
    title: "Reduce Monthly Plastic Waste",
    current: 0,
    target: 0,
  },
  {
    id: 2,
    title: "Increase Eco-Score",
    current: 0,
    target: 0,
  },
  {
    id: 3,
    title: "Lower Transportation Emissions",
    current: 0,
    target: 0,
  },
];

export default function Goals({ data = dummyGoals }) {
  return (
    <div className="rounded-2xl bg-white p-2">
      <div className="space-y-5">
        {data.map((goal) => {
          const progress = Math.min(
            (goal.current / goal.target) * 100,
            100
          );

          return (
            <div key={goal.id}>
              {/* Title + Numbers */}
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-neutral-800">
                  {goal.title}
                </p>
                <p className="text-sm text-neutral-600">
                  {goal.current}/{goal.target}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
