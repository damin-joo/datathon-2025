// // Dashboard.tsx
// "use client";
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

// interface Transaction {
//   date: string;
//   merchant: string;
//   category: string;
//   amount: number;
//   co2e: number;
//   classification: string;
// }

// interface UserData {
//   echoPoints: number;
//   badge: string;
//   percentile: number;
//   totalCO2: number;
//   co2Saved: number;
//   transactions: Transaction[];
// }

// const COLORS = { good: "#4ade80", neutral: "#facc15", bad: "#f87171" };

// export default function Dashboard({ user }: { user: UserData }) {
//   const pieData = [
//     ...user.transactions.reduce((acc: any[], t) => {
//       const existing = acc.find(a => a.name === t.category);
//       if (existing) existing.value += t.amount;
//       else acc.push({ name: t.category, value: t.amount, classification: t.classification });
//       return acc;
//     }, []).map(d => ({ name: d.name, value: d.value, fill: COLORS[d.classification] }))
//   ];

//   return (
//     <div className="p-6 space-y-6">
//       {/* Echo Score Header */}
//       <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow">
//         <div>
//           <h2 className="text-xl font-semibold">Echo Points: {user.echoPoints}</h2>
//           <p className="text-sm text-gray-500">{user.badge} - {user.percentile.toFixed(1)} percentile</p>
//         </div>
//       </div>

//       {/* CO2 Summary */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold">CO₂ Emitted</h3>
//           <p className="text-2xl">{user.totalCO2.toFixed(2)} kg</p>
//         </div>
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold">CO₂ Saved</h3>
//           <p className="text-2xl">{user.co2Saved.toFixed(2)} kg</p>
//         </div>
//       </div>

//       {/* Good vs Bad Spending */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold mb-2">Good Spending</h3>
//           {user.transactions.filter(t => t.classification === "good").map(t => (
//             <div key={t.date + t.merchant} className="flex justify-between border-b py-1">
//               <span>{t.merchant} ({t.category})</span>
//               <span>{t.co2e.toFixed(2)} kg</span>
//             </div>
//           ))}
//         </div>
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold mb-2">Bad Spending</h3>
//           {user.transactions.filter(t => t.classification === "bad").map(t => (
//             <div key={t.date + t.merchant} className="flex justify-between border-b py-1">
//               <span>{t.merchant} ({t.category})</span>
//               <span>{t.co2e.toFixed(2)} kg</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Category Distribution Pie */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h3 className="font-semibold mb-2">Category Distribution</h3>
//         <PieChart width={300} height={300}>
//           <Pie
//             data={pieData}
//             dataKey="value"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             outerRadius={100}
//             label
//           >
//             {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
//           </Pie>
//           <Tooltip />
//           <Legend />
//         </PieChart>
//       </div>
//     </div>
//   );
// }