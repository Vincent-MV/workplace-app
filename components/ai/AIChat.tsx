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
    
    // 1. First, try to match the ideal ```json ... ``` block
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      try { return JSON.parse(markdownMatch[1]); } catch (e) { /* ignore */ }
    }

    // 2. Fallback: If no markdown block, look for a raw JSON object at the end of the text
    const startIndex = text.lastIndexOf('{');
    if (startIndex !== -1) {
      const jsonString = text.substring(startIndex).trim();
      try {
        const parsed = JSON.parse(jsonString);
        // Verify it's actually an action object we care about
        if (parsed && parsed.action) {
          return parsed;
        }
      } catch (e) {
        // Not valid JSON, ignore
      }
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
      // 1. Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('You are not logged in. Please refresh the page.');
      }

      // 2. Send the request
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
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      // 🔍 DEBUG LOGS: Open your browser console (F12) to see exactly what the API returns
      console.log("✅ API Response Data:", data);
      console.log("Response text length:", data.response?.length);

      // 3. Parse the action and clean the text (remove the raw JSON block from the UI)
      const action = data.response ? parseAction(data.response) : null;
      const cleanText = data.response 
        ? data.response.replace(/```json[\s\S]*?```/, '').trim() 
        : 'No response from AI.';

      const aiMessage: Message = { 
        role: 'model', 
        content: cleanText || "I'm here to help! What would you like me to do?", 
        action 
      };
      
      // 4. Update the messages state with the AI's reply
      setMessages(prev => [...prev, aiMessage]);
      setConversationId(data.conversationId);

    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to AI'}. Please make sure you're logged in.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

     const handleAction = async (action: any) => {
    if (!action || !action.action || !activeWorkspace) return;

    try {
            if (action.action === 'create_meeting') {
        // 0. Get the current user to satisfy the user_id NOT NULL constraint
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to perform this action.");

        // 1. Parse the dates the AI gave us
        const startDate = new Date(action.startTime);
        const endDate = new Date(action.endTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date provided by AI");
        }

        // 2. Calculate duration in minutes (matching your schema's duration_mins column)
        const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

        // 3. Build the payload using YOUR EXACT SCHEMA COLUMNS
        const meetingData: any = {
          workspace_id: activeWorkspace.id,
          user_id: user.id, // ✅ THIS IS THE MISSING PIECE!
          title: action.title,
          scheduled_at: startDate.toISOString(), 
          duration_mins: durationMins > 0 ? durationMins : 60, 
        };

        // Only add location if it exists and isn't the default placeholder
        if (action.location && action.location !== 'No location specified') {
          meetingData.location = action.location;
        }

        console.log("📤 Sending to Supabase (Correct Schema):", meetingData);

        // 4. Insert into Supabase
        const { error } = await supabase
          .from('meetings')
          .insert(meetingData);
          
        if (error) {
          console.error("❌ SUPABASE ERROR DETAILS:", JSON.stringify(error, null, 2));
          throw new Error(error.message || "Database rejected the meeting");
        }
        
        setMessages(prev => prev.map(m => 
          m.action?.title === action.title ? { ...m, action: null, content: m.content + `\n\n✅ *Meeting "${action.title}" created!*` } : m
        ));
      } 
      // ... (keep the reschedule_task and create_task logic exactly as it was) ...
    } catch (error) {
      console.error('Action execution failed:', error);
      // Show the actual error message in the chat so you can see it
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setMessages(prev => prev.map(m => 
        m.action === action ? { ...m, content: m.content + `\n\n❌ *Failed: ${errorMsg}*` } : m
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

      {/* Messages Area */}
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
                
                {/* ✅ FIXED: Render button for ANY valid action, not just reschedule_task */}
                {msg.action && (
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