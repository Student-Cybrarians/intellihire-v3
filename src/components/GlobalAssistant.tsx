"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function GlobalAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm your IntelliHire AI assistant. I have access to your career data. How can I help you prepare today?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response.content }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 p-4 rounded-full bg-[#3b82f6] text-white shadow-xl shadow-[#3b82f6]/20 transition-all hover:scale-105 z-50",
          isOpen ? "hidden" : "flex"
        )}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-[600px] h-full rounded-2xl bg-[#111827] border border-[#1f2937] shadow-2xl z-50 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-[#f8fafc]">
              <Sparkles className="w-5 h-5 text-[#8b5cf6]" /> AI Assistant
            </div>
            <button onClick={() => setIsOpen(false)} className="text-[#94a3b8] hover:text-[#f8fafc]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                <div className={cn("p-2 rounded-full h-8 w-8 flex items-center justify-center shrink-0", msg.role === 'assistant' ? "bg-[#8b5cf6]/20 text-[#8b5cf6]" : "bg-[#1f2937] text-[#94a3b8]")}>
                  {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className={cn("p-3 rounded-lg text-xs leading-relaxed", msg.role === 'assistant' ? "bg-[#1f2937] text-[#cbd5e1]" : "bg-[#3b82f6] text-white")}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-[#94a3b8] p-2">AI is thinking...</div>}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-[#1f2937]">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about roadmap, skills, interview tips..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#0b0f19] border border-[#1f2937] text-xs text-[#f8fafc] focus:outline-none"
              />
              <button type="submit" className="p-2 rounded-lg bg-[#3b82f6] text-white">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
