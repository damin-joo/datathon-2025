"use client";

interface TransactionEntry {
  id: number | string;
  name: string;
  category: string;
  category_name: string;
  amount: number;
  date: string;
  env_label: string;
}

const dummyTransactions: TransactionEntry[] = [
  {
    id: 1,
    name: "Starbucks Coffee",
    category: "Food & Drink",
    category_name: "Food & Drink",
    amount: 0,
    date: "2025-01-12",
    env_label: "neutral",
  },
];

const labelColors: Record<string, string> = {
  good: "bg-emerald-100 text-emerald-700",
  neutral: "bg-amber-100 text-amber-700",
  bad: "bg-rose-100 text-rose-700",
};

interface Props {
  data?: TransactionEntry[];
}

export default function TransactionList({ data = dummyTransactions }: Props) {
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
                {(tx.category_name || tx.category) ?? "-"} · {tx.date ? new Date(tx.date).toLocaleDateString() : ""}
              </p>
              {tx.env_label && (
                <span className={`inline-flex mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${labelColors[tx.env_label] || "bg-neutral-100 text-neutral-600"}`}>
                  {tx.env_label === "good" && "Eco+"}
                  {tx.env_label === "neutral" && "Balanced"}
                  {tx.env_label === "bad" && "High Impact"}
                  {!["good", "neutral", "bad"].includes(tx.env_label) && tx.env_label}
                </span>
              )}
            </div>

            {/* Right: Amount */}
            <p
              className="font-semibold text-rose-500"
            >
              -${Math.abs(Number(tx.amount ?? 0)).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
