// components/ai/AIChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase'; 
import { useWorkspace } from '@/context/WorkspaceContext';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
  action?: any;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const { activeWorkspace } = useWorkspace(); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Proactive Greeting Effect
  useEffect(() => {
    if (isOpen && messages.length === 0 && activeWorkspace) {
      const fetchProactiveGreeting = async () => {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('title, due_date, status')
          .eq('workspace_id', activeWorkspace.id)
          .in('status', ['todo', 'missed'])
          .limit(3);

        if (tasks && tasks.length > 0) {
          setMessages([{
            role: 'model',
            content: `Hi! I see you have ${tasks.length} pending task(s) in this workspace, like "${tasks[0].title}". Would you like me to help you reschedule them or draft an agenda?`
          }]);
        } else {
          setMessages([{
            role: 'model',
            content: "Hi! I'm your AI Secretary. I can help you reschedule tasks, analyze your calendar, or draft agendas. What do you need?"
          }]);
        }
      };
      fetchProactiveGreeting();
    }
  }, [isOpen, messages.length, activeWorkspace]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseAction = (text: string) => {
    if (!text) return null; 
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      try { return JSON.parse(markdownMatch[1]); } catch (e) { /* ignore */ }
    }
    const startIndex = text.lastIndexOf('{');
    if (startIndex !== -1) {
      const jsonString = text.substring(startIndex).trim();
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed && parsed.action) return parsed;
      } catch (e) { /* ignore */ }
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || !activeWorkspace) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('You are not logged in.');

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          conversationId,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          workspaceId: activeWorkspace.id
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const action = data.response ? parseAction(data.response) : null;
      const cleanText = data.response ? data.response.replace(/```json[\s\S]*?```/, '').trim() : '';

      const aiMessage: Message = { 
        role: 'model', 
        content: cleanText || "I'm here to help! What would you like me to do?", 
        action 
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setConversationId(data.conversationId);

    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect'}.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: any) => {
    if (!action || !action.action || !activeWorkspace) return;

    try {
      if (action.action === 'create_meeting') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in.");

        const startDate = new Date(action.startTime);
        const endDate = new Date(action.endTime);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error("Invalid date provided by AI");

        const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
        const fixDate = (d: Date) => d.toISOString().endsWith('Z') ? d.toISOString() : d.toISOString() + 'Z';

        const meetingData: any = {
          workspace_id: activeWorkspace.id,
          user_id: user.id,
          title: action.title,
          scheduled_at: fixDate(startDate), 
          duration_mins: durationMins > 0 ? durationMins : 60, 
        };
        if (action.location && action.location !== 'No location specified') meetingData.location = action.location;

        const { error } = await supabase.from('meetings').insert(meetingData);
        if (error) throw new Error(error.message);
        
        setMessages(prev => prev.map(m => m.action?.title === action.title ? { ...m, action: null, content: m.content + `\n\n✅ *Meeting "${action.title}" created!*` } : m));
      } 
      else if (action.action === 'reschedule_task') {
        const { error } = await supabase.from('tasks').update({ due_date: action.newDate, status: 'todo' }).eq('id', action.taskId);
        if (error) throw new Error(error.message);
        setMessages(prev => prev.map(m => m.action?.taskId === action.taskId ? { ...m, action: null, content: m.content + `\n\n✅ *Task rescheduled to ${action.newDate}*` } : m));
      }
      else if (action.action === 'create_task') {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from('tasks').insert({ workspace_id: activeWorkspace.id, user_id: user?.id, title: action.title, due_date: action.dueDate, status: 'todo' });
        if (error) throw new Error(error.message);
        setMessages(prev => prev.map(m => m.action?.title === action.title ? { ...m, action: null, content: m.content + `\n\n✅ *Task "${action.title}" created!*` } : m));
      }
    } catch (error) {
      console.error('Action execution failed:', error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setMessages(prev => prev.map(m => m.action === action ? { ...m, content: m.content + `\n\n❌ *Failed: ${errorMsg}*` } : m));
    }
  };

  if (!isOpen) return null;

  return (

    <div className={cn(
      "fixed z-[60] flex flex-col bg-white shadow-2xl border border-slate-200",
      
      // Mobile: Bottom sheet
      "bottom-0 left-0 right-0 h-[85vh] rounded-t-2xl",
      
      // Desktop: Floating right panel
      "md:top-20 md:bottom-4 md:left-auto md:right-4 md:w-[400px] md:h-[calc(100vh-6rem)] md:rounded-2xl"
    )}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0 bg-white rounded-t-2xl">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="text-violet-600">AI</span> Secretary
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
              msg.role === 'user' 
                ? "bg-violet-600 text-white rounded-br-sm" 
                : "bg-white text-slate-700 border border-slate-100 rounded-bl-sm"
            )}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              
              {msg.action && (
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="mt-3 w-full bg-slate-100 hover:bg-slate-200 text-slate-800 border-0"
                  onClick={() => handleAction(msg.action)}
                >
                  <RefreshCw className="mr-2 h-3 w-3" /> 
                  {msg.action.action === 'reschedule_task' && `Reschedule to ${msg.action.newDate}`}
                  {msg.action.action === 'create_meeting' && `Create: ${msg.action.title}`}
                  {msg.action.action === 'create_task' && `Create Task: ${msg.action.title}`}
                </Button>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2 shadow-sm">
              <Loader2 className="h-3 w-3 animate-spin text-violet-600" /> Thinking...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 shrink-0 bg-white rounded-b-2xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to reschedule, draft an agenda..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-violet-600 hover:bg-violet-700 rounded-xl h-10 w-10 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}