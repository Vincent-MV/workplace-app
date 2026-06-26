"use client";

import { useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { supabase } from "@/lib/supabase";
import type { AiConversation, AiMessage } from "@/lib/types";
import { X, Send, Bot, Plus, ChevronLeft } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function AIChat({ onClose }: Props) {
  const { workspaces, activeWorkspace } = useWorkspace();
  const userId = workspaces[0]?.user_id;

  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeConv, setActiveConv] = useState<AiConversation | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [view, setView] = useState<"list" | "chat">("list");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setConversations(data ?? []));
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = async (conv: AiConversation) => {
    setActiveConv(conv);
    setView("chat");
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at");
    setMessages(data ?? []);
  };

  const newConversation = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: userId,
        workspace_id: activeWorkspace?.id ?? null,
        title: "New conversation",
      })
      .select()
      .single();
    if (!error && data) {
      setConversations((prev) => [data, ...prev]);
      setActiveConv(data);
      setMessages([]);
      setView("chat");
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeConv || sending) return;
    const userContent = input.trim();
    setInput("");
    setSending(true);

    const { data: userMsg } = await supabase
      .from("ai_messages")
      .insert({ conversation_id: activeConv.id, role: "user", content: userContent })
      .select()
      .single();
    if (userMsg) setMessages((prev) => [...prev, userMsg]);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent, history }),
      });
      const json = await res.json();
      const assistantContent = json.response ?? "Sorry, I couldn't generate a response.";

      const { data: assistantMsg } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: activeConv.id,
          role: "assistant",
          content: assistantContent,
        })
        .select()
        .single();
      if (assistantMsg) setMessages((prev) => [...prev, assistantMsg]);

      if (messages.length === 0) {
        const title = userContent.slice(0, 50);
        await supabase
          .from("ai_conversations")
          .update({ title })
          .eq("id", activeConv.id);
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConv.id ? { ...c, title } : c))
        );
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err",
          conversation_id: activeConv.id,
          role: "assistant",
          content: "Error contacting AI. Check your GEMINI_API_KEY.",
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[600px] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            {view === "chat" && (
              <button
                onClick={() => setView("list")}
                className="text-violet-200 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <Bot size={16} />
            <span className="font-semibold text-sm">
              {view === "chat" && activeConv
                ? activeConv.title || "Conversation"
                : "AI Assistant"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {view === "list" && (
              <button
                onClick={newConversation}
                className="text-violet-200 hover:text-white transition-colors"
                title="New conversation"
              >
                <Plus size={16} />
              </button>
            )}
            <button onClick={onClose} className="text-violet-200 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Conversation list */}
        {view === "list" && (
          <div className="flex-1 scrollable">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <Bot size={40} className="opacity-30" />
                <p className="text-sm">No conversations yet</p>
                <button
                  onClick={newConversation}
                  className="px-4 py-2 bg-violet-600 text-white text-sm rounded-xl hover:bg-violet-700 transition-colors"
                >
                  Start chatting
                </button>
              </div>
            ) : (
              <div>
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 text-left transition-colors"
                  >
                    <Bot size={16} className="text-violet-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {conv.title || "Untitled"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chat view */}
        {view === "chat" && (
          <>
            <div className="flex-1 scrollable p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  <Bot size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Ask me anything about your schedule, tasks, or goals.</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2 p-3 border-t border-slate-100 flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Ask AI..."
                disabled={sending}
                className="flex-1 px-3 py-2 text-sm bg-slate-100 rounded-xl border border-transparent focus:border-violet-300 focus:bg-white focus:outline-none transition-colors text-slate-800 placeholder:text-slate-400"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
