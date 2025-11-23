// // WeeklySummary.tsx
// interface WeeklySummaryProps {
//   transactions: Transaction[];
// }

// export default function WeeklySummary({ transactions }: WeeklySummaryProps) {
//   const best = [...transactions].sort((a, b) => b.co2e - a.co2e).slice(-3); // lowest CO2
//   const worst = [...transactions].sort((a, b) => b.co2e - a.co2e).slice(0, 3); // highest CO2
//   const avgCO2 = transactions.reduce((sum, t) => sum + t.co2e, 0) / transactions.length;

//   const aiTips = [
//     { title: "Use public transport", co2Saved: 1.2 },
//     { title: "Buy second-hand electronics", co2Saved: 0.8 },
//     { title: "Switch to plant-based meals", co2Saved: 0.5 }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Best / Worst Transactions */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold mb-2">Top 3 Best Transactions</h3>
//           {best.map(t => (
//             <div key={t.date + t.merchant} className="flex justify-between border-b py-1">
//               <span>{t.merchant} ({t.category})</span>
//               <span>{t.co2e.toFixed(2)} kg</span>
//             </div>
//           ))}
//         </div>
//         <div className="bg-white p-4 rounded-xl shadow">
//           <h3 className="font-semibold mb-2">Top 3 Worst Transactions</h3>
//           {worst.map(t => (
//             <div key={t.date + t.merchant} className="flex justify-between border-b py-1">
//               <span>{t.merchant} ({t.category})</span>
//               <span>{t.co2e.toFixed(2)} kg</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Average CO2 */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h3 className="font-semibold mb-2">Weekly Overview</h3>
//         <p>Total Transactions: {transactions.length}</p>
//         <p>Average CO₂ per Transaction: {avgCO2.toFixed(2)} kg</p>
//       </div>

//       {/* AI Recommendations */}
//       <div className="bg-white p-4 rounded-xl shadow">
//         <h3 className="font-semibold mb-2">AI Recommendations</h3>
//         <div className="space-y-2">
//           {aiTips.map((tip, idx) => (
//             <div key={idx} className="flex justify-between border-b py-1">
//               <span>{tip.title}</span>
//               <span>Save ~{tip.co2Saved} kg CO₂</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
