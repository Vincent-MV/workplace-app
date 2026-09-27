"use client";

import { CheckCircle2, Calendar, Flame } from "lucide-react";

interface StatsOverviewProps {
  tasksCompleted: number;
  upcomingMeetings: number;
  habitStreak: number;
}

export default function StatsOverview({ tasksCompleted, upcomingMeetings, habitStreak }: StatsOverviewProps) {
  const metrics = [
    {
      label: "Tasks Completed",
      value: tasksCompleted,
      subtext: "Last 30 days",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Upcoming Meetings",
      value: upcomingMeetings,
      subtext: "Next 7 days",
      icon: Calendar,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Current Habit Streak",
      value: habitStreak,
      subtext: "Days in a row",
      icon: Flame,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-xl ${metric.bg}`}>
            <metric.icon size={20} className={metric.color} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{metric.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{metric.value}</p>
            <p className="text-xs text-slate-400 mt-1">{metric.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}