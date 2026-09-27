"use client";

import { cn } from "@/lib/utils";

interface ContributionGraphProps {
  // Map of "YYYY-MM-DD" to count of completed tasks
  activityData: Record<string, number>; 
}

export default function ContributionGraph({ activityData }: ContributionGraphProps) {
  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const maxCount = Math.max(...Object.values(activityData), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-slate-100";
    const ratio = count / maxCount;
    if (ratio < 0.3) return "bg-violet-200";
    if (ratio < 0.6) return "bg-violet-400";
    return "bg-violet-600";
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">Activity (Last 30 Days)</h3>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {days.map((date) => {
          const count = activityData[date] || 0;
          return (
            <div key={date} className="flex flex-col items-center gap-1 min-w-[14px]">
              <div 
                className={cn("w-3 h-3 rounded-sm transition-colors", getIntensity(count))}
                title={`${date}: ${count} tasks completed`}
              />
              <span className="text-[9px] text-slate-400">
                {new Date(date).getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-4 justify-end">
        <span className="text-[10px] text-slate-400">Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-100" />
        <div className="w-3 h-3 rounded-sm bg-violet-200" />
        <div className="w-3 h-3 rounded-sm bg-violet-400" />
        <div className="w-3 h-3 rounded-sm bg-violet-600" />
        <span className="text-[10px] text-slate-400">More</span>
      </div>
    </div>
  );
}