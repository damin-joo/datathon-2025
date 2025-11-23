"use client";

const dummyTransactions = [
  {
    id: 1,
    name: "Starbucks Coffee",
    category: "Food & Drink",
    amount: 0,
    date: "2025-01-12",
  },
  {
    id: 2,
    name: "Whole Foods",
    category: "Groceries",
    amount: 0,
    date: "2025-01-11",
  },
  {
    id: 3,
    name: "Uber Ride",
    category: "Transport",
    amount: 0,
    date: "2025-01-10",
  },
  {
    id: 4,
    name: "Solar Credit",
    category: "Eco Reward",
    amount: 0,
    date: "2025-01-08",
  },
];

export default function TransactionList({ data = dummyTransactions }) {
  return (
    <div className="rounded-2x bg-white p-2">
      <div className="space-y-4">
        {data.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between py-2"
          >
            {/* Left */}
            <div>
              <p className="font-semibold text-neutral-800">
                {tx.name}
              </p>
              <p className="text-sm text-neutral-500">
                {tx.category} · {new Date(tx.date).toLocaleDateString()}
              </p>
            </div>

            {/* Right: Amount */}
            <p
              className={`font-semibold ${
                tx.amount < 0
                  ? "text-red-500"
                  : "text-green-600"
              }`}
            >
              {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
