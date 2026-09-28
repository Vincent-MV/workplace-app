"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ContributionGraphProps {
  activityData: Record<string, number>; 
}

export default function ContributionGraph({ activityData }: ContributionGraphProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Generate days for the selected year (or last 365 days if current year)
  const currentYear = new Date().getFullYear();
  const isCurrentYear = selectedYear === currentYear;
  
  let days: string[] = [];
  
  if (isCurrentYear) {
    // For current year: show last 365 days up to today
    days = Array.from({ length: 365 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (364 - i));
      return d.toISOString().split("T")[0];
    });
  } else {
    // For previous years: show full year
    days = Array.from({ length: 365 }, (_, i) => {
      const d = new Date(selectedYear, 0, 1);
      d.setDate(d.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  }

  const maxCount = Math.max(...Object.values(activityData), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-slate-100";
    const ratio = count / maxCount;
    if (ratio < 0.25) return "bg-violet-200";
    if (ratio < 0.5) return "bg-violet-300";
    if (ratio < 0.75) return "bg-violet-500";
    return "bg-violet-600";
  };

  // Group days into weeks (columns)
  const weeks: string[][] = [];
  let currentWeek: string[] = [];
  
  // Find the first day of the first week (start from Sunday)
  const firstDate = new Date(days[0]);
  const firstDayOfWeek = firstDate.getDay();
  
  // Add empty days at the beginning if needed
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push("");
  }
  
  days.forEach((day, index) => {
    const date = new Date(day);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      // Start of new week
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    currentWeek.push(day);
    
    // If it's the last day, push the final week
    if (index === days.length - 1) {
      // Fill remaining days
      while (currentWeek.length < 7) {
        currentWeek.push("");
      }
      weeks.push(currentWeek);
    }
  });

  // Generate month labels with accurate positioning
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(d => d !== "");
    if (!firstValidDay) return;
    
    const date = new Date(firstValidDay);
    const month = date.toLocaleString('default', { month: 'short' });
    const monthNum = date.getMonth();
    const year = date.getFullYear();
    
    // Only add month label if it's a different month and we're at the start of that month
    if (monthNum !== lastMonth) {
      // Check if this is roughly the first week of the month
      const dayOfMonth = date.getDate();
      if (dayOfMonth <= 7) {
        monthLabels.push({ month: `${month} ${year}`, weekIndex });
        lastMonth = monthNum;
      }
    }
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get date range for display
  const startDate = new Date(days[0]);
  const endDate = new Date(days[days.length - 1]);
  const dateRangeLabel = isCurrentYear 
    ? `Last 365 days (ending ${endDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })})`
    : `Full year ${selectedYear}`;

  // Generate available years (current year and 2 previous years)
  const availableYears = [currentYear, currentYear - 1, currentYear - 2];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Contribution Activity</h3>
          <p className="text-xs text-slate-500 mt-0.5">{dateRangeLabel}</p>
        </div>
        
        {/* Year Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const currentIndex = availableYears.indexOf(selectedYear);
              if (currentIndex > 0) setSelectedYear(availableYears[currentIndex - 1]);
            }}
            disabled={selectedYear === availableYears[availableYears.length - 1]}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-md transition-all",
                  selectedYear === year
                    ? "bg-white text-violet-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                )}
              >
                {year}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              const currentIndex = availableYears.indexOf(selectedYear);
              if (currentIndex < availableYears.length - 1) setSelectedYear(availableYears[currentIndex + 1]);
            }}
            disabled={selectedYear === availableYears[0]}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="inline-block min-w-full">
          <div className="flex">
            {/* Day Labels (Left Side) */}
            <div className="flex flex-col gap-0.5 mr-2 pt-5 pr-1">
              {dayLabels.map((day, i) => (
                <div 
                  key={day} 
                  className="text-[9px] text-slate-400 flex items-center justify-end w-8"
                  style={{ height: '14px' }}
                >
                  {i % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {/* Contribution Grid with Month Labels */}
            <div className="flex flex-col">
              {/* Month Labels */}
              <div className="flex mb-1 h-5 relative">
                {monthLabels.map(({ month, weekIndex }, index) => (
                  <div
                    key={index}
                    className="absolute text-[10px] font-medium text-slate-500 uppercase"
                    style={{
                      left: `${weekIndex * 14}px`, // 12px width + 2px gap
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex gap-0.5">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-0.5">
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return (
                          <div 
                            key={dayIndex} 
                            className="bg-transparent"
                            style={{ width: '12px', height: '12px' }}
                          />
                        );
                      }
                      
                      const count = activityData[day] || 0;
                      const isToday = day === new Date().toISOString().split("T")[0];
                      
                      return (
                        <div
                          key={day}
                          className={cn(
                            "rounded-sm transition-all hover:ring-1 hover:ring-slate-400 cursor-pointer",
                            getIntensity(count),
                            isToday && "ring-1 ring-violet-600"
                          )}
                          style={{ width: '12px', height: '12px' }}
                          title={`${day}: ${count} tasks completed${isToday ? ' (Today)' : ''}`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm bg-slate-100" />
            <div className="w-3 h-3 rounded-sm bg-violet-200" />
            <div className="w-3 h-3 rounded-sm bg-violet-300" />
            <div className="w-3 h-3 rounded-sm bg-violet-500" />
            <div className="w-3 h-3 rounded-sm bg-violet-600" />
          </div>
          <span className="text-[10px] text-slate-400">More</span>
        </div>
        
        {/* Visual indicator of scroll */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Scroll to see more</span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    </div>
  );
}