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


  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseAction = (text: string) => {
    if (!text) return null; 
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch (e) { return null; }
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
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          workspaceId: activeWorkspace.id
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      // Safely parse action
      const action = data.response ? parseAction(data.response) : null;
      
      const cleanText = data.response ? data.response.replace(/```json[\s\S]*?```/, '').trim() : '';
      const aiMessage: Message = { role: 'model', content: cleanText || "Sorry, I encountered an error.", action };
      
      setMessages([...newMessages, aiMessage]);
      setConversationId(data.conversationId);
    } catch (error) {
      console.error('AI Error:', error);
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to AI'}. Please make sure you're logged in.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };
    // Replace handleReschedule with this upgraded handleAction
  const handleAction = async (action: any) => {
    if (!action || !action.action || !activeWorkspace) return;

    try {
      if (action.action === 'reschedule_task') {
        await supabase
          .from('tasks')
          .update({ due_date: action.newDate, status: 'pending' })
          .eq('id', action.taskId);
          
        setMessages(prev => prev.map(m => 
          m.action?.taskId === action.taskId ? { ...m, action: null, content: m.content + `\n\n✅ *Task rescheduled to ${action.newDate}*` } : m
        ));
      } 
      else if (action.action === 'create_meeting') {
        const { error } = await supabase
          .from('meetings')
          .insert({
            workspace_id: activeWorkspace.id,
            title: action.title,
            start_time: action.startTime,
            end_time: action.endTime,
            status: 'scheduled' // Adjust if your schema uses a different status
          });
          
        if (error) throw error;
        
        setMessages(prev => prev.map(m => 
          m.action?.title === action.title ? { ...m, action: null, content: m.content + `\n\n✅ *Meeting "${action.title}" created!*` } : m
        ));
      }
      else if (action.action === 'create_task') {
        const { error } = await supabase
          .from('tasks')
          .insert({
            workspace_id: activeWorkspace.id,
            title: action.title,
            due_date: action.dueDate,
            status: 'pending'
          });
          
        if (error) throw error;

        setMessages(prev => prev.map(m => 
          m.action?.title === action.title ? { ...m, action: null, content: m.content + `\n\n✅ *Task "${action.title}" created!*` } : m
        ));
      }
    } catch (error) {
      console.error('Action execution error:', error);
      setMessages(prev => prev.map(m => 
        m.action === action ? { ...m, content: m.content + `\n\n❌ *Failed to execute action. Check console.*` } : m
      ));
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-background border-t border-border shadow-lg flex flex-col",
      "md:inset-auto md:right-4 md:bottom-4 md:top-20 md:w-96 md:h-[calc(100vh-6rem)] md:rounded-lg md:border"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <h2 className="font-semibold flex items-center gap-2">
          <span className="text-primary">AI</span> Secretary
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area (Replaced ScrollArea with standard div) */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm mt-8">
              <p>Hi! I'm your AI Secretary.</p>
              <p className="mt-2">I can help you reschedule tasks, analyze your calendar, or draft agendas. What do you need?</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.action && msg.action.action === 'reschedule_task' && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() => handleAction(msg.action)}
                  >
                    <RefreshCw className="mr-2 h-3 w-3" /> 
                    {msg.action.action === 'reschedule_task' && `Reschedule to ${msg.action.newDate}`}
                    {msg.action.action === 'create_meeting' && `Create Meeting: ${msg.action.title}`}
                    {msg.action.action === 'create_task' && `Create Task: ${msg.action.title}`}
                  </Button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to reschedule, draft an agenda..."
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}