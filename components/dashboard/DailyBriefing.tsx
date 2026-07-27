// components/dashboard/DailyBriefing.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/lib/supabase';
import { Sparkles, RefreshCw, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

export default function DailyBriefing() {
  const { activeWorkspace } = useWorkspace();
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ NEW: State for minimizing the component
  const [isMinimized, setIsMinimized] = useState(false);

  const fetchBriefing = async (forceRefresh = false) => {
    if (!activeWorkspace) return;
    setLoading(true);
    setError(null);

    try {
      const cachedBriefing = localStorage.getItem('daily_briefing');
      const lastFetchTime = localStorage.getItem('briefing_timestamp');
      const TWELVE_HOURS = 12 * 60 * 60 * 1000;

      if (!forceRefresh && cachedBriefing && lastFetchTime && (Date.now() - Number(lastFetchTime) < TWELVE_HOURS)) {
        setBriefing(cachedBriefing);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not logged in');

      const res = await fetch('/api/briefing', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'rate_limit') {
          setError(data.message);
        } else {
          setError('Could not load briefing.');
        }
        return;
      }

      setBriefing(data.briefing);
      localStorage.setItem('daily_briefing', data.briefing);
      localStorage.setItem('briefing_timestamp', Date.now().toString());

    } catch (err) {
      setError('Failed to connect to AI.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [activeWorkspace]);

  // ✅ NEW: Helper to highlight urgent keywords in the text
  const renderHighlightedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      let className = "text-sm text-slate-700 leading-relaxed block mb-1";
      
      if (line.includes('🚨') || line.includes('OVERDUE')) {
        className = "text-sm font-bold text-red-600 bg-red-50 p-2 rounded-lg mb-2 border border-red-100 block";
      } else if (line.includes('⚠️') || line.includes('URGENT')) {
        className = "text-sm font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg mb-2 border border-amber-100 block";
      } else if (line.trim().startsWith('•')) {
        className = "text-sm text-slate-700 leading-relaxed block mb-1.5 pl-1";
      }

      return <span key={index} className={className}>{line}</span>;
    });
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl shadow-sm transition-all duration-300">
      {/* Header (Always Visible) */}
      <div className="flex items-center justify-between p-4 border-b border-violet-100/50">
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className="flex items-center gap-2 text-sm font-semibold text-violet-900 hover:text-violet-700 transition-colors"
        >
          <Sparkles size={16} className="text-violet-600" />
          Daily Briefing
          {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
        
        <button 
          onClick={() => fetchBriefing(true)} 
          disabled={loading}
          className="text-violet-500 hover:text-violet-700 transition-colors disabled:opacity-50 p-1 rounded hover:bg-violet-100"
          title="Refresh briefing"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Content (Collapsible) */}
      {!isMinimized && (
        <div className="p-4">
          {loading && !briefing ? (
            <div className="space-y-2">
              <div className="h-4 bg-violet-100 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-violet-100 rounded animate-pulse w-1/2" />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
              <AlertCircle size={14} />
              {error}
            </div>
          ) : (
            // ✅ NEW: Max height with internal scrollbar
            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {briefing ? (
                renderHighlightedText(briefing)
              ) : (
                <p className="text-sm text-slate-500 italic">No urgent tasks or meetings for today. Enjoy your day!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}