'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { Sparkles, AlertTriangle, Clock, CheckCircle2, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskReminder {
  id: string;
  title: string;
  due_date: string;
  daysLeft: number;
  level: 'overdue' | 'urgent' | 'warning' | 'upcoming';
}

export default function DailyBriefing() {
  const { activeWorkspace } = useWorkspace();
  const [reminders, setReminders] = useState<TaskReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) return;
    
    const fetchReminders = async () => {
      setLoading(true);
      
      // Fetch only incomplete tasks with a due date
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, due_date, status')
        .eq('workspace_id', activeWorkspace.id)
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate day calculation

      const processed: TaskReminder[] = (tasks || []).map((task) => {
        const due = new Date(task.due_date);
        due.setHours(0, 0, 0, 0);
        
        const diffTime = due.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Determine urgency level based on your rules
        let level: TaskReminder['level'] = 'upcoming';
        if (daysLeft < 0) level = 'overdue';
        else if (daysLeft <= 2) level = 'urgent';
        else if (daysLeft <= 4) level = 'warning';

        return { ...task, daysLeft, level };
      });

      // Sort by urgency overdue -> urgent -> warning -> upcoming
      const priorityOrder = { overdue: 0, urgent: 1, warning: 2, upcoming: 3 };
      processed.sort((a, b) => {
        if (priorityOrder[a.level] !== priorityOrder[b.level]) {
          return priorityOrder[a.level] - priorityOrder[b.level];
        }
        return a.daysLeft - b.daysLeft;
      });

      setReminders(processed);
      setLoading(false);
    };

    fetchReminders();
  }, [activeWorkspace]);

  // Helper to get the correct colors, icons, and text for each level
  const getReminderUI = (reminder: TaskReminder) => {
    switch (reminder.level) {
      case 'overdue':
        return {
          icon: <AlertCircle size={16} className="text-red-600" />,
          bg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-700',
          label: `🚨 Overdue by ${Math.abs(reminder.daysLeft)} day(s)! Do this immediately.`,
        };
      case 'urgent':
        return {
          icon: <AlertTriangle size={16} className="text-red-600" />,
          bg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-700',
          label: `🚨 Urgent: Due in ${reminder.daysLeft} day(s). Do this now!`,
        };
      case 'warning':
        return {
          icon: <Clock size={16} className="text-amber-600" />,
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-700',
          label: `⚠️ Heads up: Due in ${reminder.daysLeft} days. You should do this soon.`,
        };
      default: // upcoming (5+ days)
        return {
          icon: <CheckCircle2 size={16} className="text-emerald-600" />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          text: 'text-emerald-700',
          label: `✅ On track: Due in ${reminder.daysLeft} days.`,
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-violet-700 transition-colors"
        >
          <Sparkles size={16} className="text-violet-600" />
          Daily Briefing
          {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-sm text-slate-800 font-semibold">All caught up! 🎉</p>
              <p className="text-xs text-slate-500 mt-1">No upcoming tasks. Enjoy your day.</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {reminders.map((reminder) => {
                const ui = getReminderUI(reminder);
                return (
                  <div 
                    key={reminder.id} 
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border transition-all",
                      ui.bg, ui.border
                    )}
                  >
                    <div className="mt-0.5 flex-shrink-0">{ui.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-bold mb-1", ui.text)}>{ui.label}</p>
                      <p className="text-sm font-medium text-slate-800 truncate">{reminder.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}