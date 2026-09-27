"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface TaskDistributionChartProps {
  done: number;
  todo: number;
  overdue: number;
}

const COLORS = {
  done: "#10b981",    // emerald-500
  todo: "#8b5cf6",    // violet-500
  overdue: "#ef4444", // red-500
};

export default function TaskDistributionChart({ done, todo, overdue }: TaskDistributionChartProps) {
  const data = [
    { name: "Completed", value: done, color: COLORS.done },
    { name: "To Do", value: todo, color: COLORS.todo },
    { name: "Overdue", value: overdue, color: COLORS.overdue },
  ];

  const total = done + todo + overdue;

  if (total === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center h-64">
        <p className="text-slate-500 font-medium">No tasks yet</p>
        <p className="text-xs text-slate-400 mt-1">Add a task to see your distribution</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Task Status Distribution</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
              itemStyle={{ color: "#334155" }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}