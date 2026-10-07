"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AppShell from "@/components/layout/AppShell";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import StatsOverview from "@/components/stats/StatsOverview";
import TaskDistributionChart from "@/components/stats/TaskDistributionChart";
import ContributionGraph from "@/components/stats/ContributionGraph";

export default function StatsPage() {
  const { activeWorkspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  
  // Stats State
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [upcomingMeetings, setUpcomingMeetings] = useState(0);
  const [habitStreak, setHabitStreak] = useState(0);
  const [taskStatus, setTaskStatus] = useState({ done: 0, todo: 0, overdue: 0 });
  const [activityData, setActivityData] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchStats = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];

      try {
        // 1. Fetch all active workspace tasks
        const { data: tasks } = await supabase
          .from("tasks")
          .select("id, status, due_date, confirmed")
          .eq("workspace_id", activeWorkspace.id);

        if (tasks) {
          // Calculate Task Distribution
          const done = tasks.filter(t => t.status === "done").length;
          const overdue = tasks.filter(t => t.due_date && t.due_date < today && t.status !== "done" && !t.confirmed).length;
          const todo = tasks.filter(t => t.status !== "done").length - overdue;
          
          setTaskStatus({ done, todo, overdue });

          // Calculate Tasks Completed in Last 30 Days & Build Activity Map
              const activity: Record<string, number> = {};
          let completed30Days = 0;

          tasks.filter(t => t.status === "done").forEach(t => {
            //  Use due_date as a proxy for completion day for V1
            const completionDate = t.due_date ? t.due_date.split("T")[0] : today;
            
            if (completionDate >= thirtyDaysAgoStr) {
              completed30Days++;
              activity[completionDate] = (activity[completionDate] || 0) + 1;
            }
          });
          
          setTasksCompleted(completed30Days);
          setActivityData(activity);
        }

        // 2. Fetch Upcoming Meetings (Next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split("T")[0];

        const { data: meetings } = await supabase
          .from("meetings")
          .select("id")
          .eq("workspace_id", activeWorkspace.id)
          .gte("scheduled_at", today)
          .lte("scheduled_at", nextWeekStr);
        
        setUpcomingMeetings(meetings?.length || 0);

        // 3. Fetch Habit Streak (Simplified V1: counts total active habits as a proxy, or 0 if table doesn't exist yet)
        // Replace this with actual streak logic once your habits table has 'last_completed_date'
        const { data: habits, error: habitError } = await supabase
          .from("habits")
          .select("id")
          .eq("workspace_id", activeWorkspace.id)
          .eq("active", true);
        
        // Fallback to 0 if habits table isn't set up yet
        setHabitStreak(!habitError && habits ? habits.length : 0); 

      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [activeWorkspace]);

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-slate-200 rounded-2xl" />
            <div className="h-80 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-slate-800">Productivity Stats</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your progress and stay consistent.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
        >
          <StatsOverview 
            tasksCompleted={tasksCompleted} 
            upcomingMeetings={upcomingMeetings} 
            habitStreak={habitStreak} 
          />
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
        >
          <TaskDistributionChart 
            done={taskStatus.done} 
            todo={taskStatus.todo} 
            overdue={taskStatus.overdue} 
          />
          <ContributionGraph activityData={activityData} />
        </motion.div>
      </div>
    </AppShell>
  );
}