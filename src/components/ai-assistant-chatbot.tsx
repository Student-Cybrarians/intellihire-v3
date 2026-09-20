"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Brain,
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  CornerDownLeft,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  AssistantMessage,
  QUICK_PROMPT_CHIPS,
  queryAssistant,
} from "@/lib/ai-assistant-service";

interface AiAssistantChatbotProps {
  initialOpen?: boolean;
  className?: string;
}

const DEFAULT_WELCOME_MESSAGE: AssistantMessage = {
  id: "welcome-msg",
  sender: "assistant",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  category: "educational",
  content: `# Welcome to IntelliHire AI Career Assistant

I provide **educational explanations**, **career guidance**, and **technical interview preparation** grounded in real recruitment intelligence.

### What You Can Ask Me:
* **ATS Resume Optimization**: Google's X-Y-Z formula, bullet structuring, and keyword relevance.
* **Algorithmic Preparation**: Time/space complexity, dynamic programming, and Python implementations.
* **Hiring Intelligence & Governance**: TreeSHAP feature lift values, psychometric telemetry, and EEOC 80% adverse impact compliance.
* **Interview Frameworks**: Structuring behavioral answers using the STAR method.

> **Important Note**: Responses are strictly focused on technical education, hiring compliance, and career development.`,
};

export function AiAssistantChatbot({
  initialOpen = false,
  className,
}: AiAssistantChatbotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isDocked, setIsDocked] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle message dispatch
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMsg: AssistantMessage = {
      id: assistantMsgId,
      sender: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isStreaming: true,
      category: "educational",
    };

    setMessages((prev) => [...prev, initialAssistantMsg]);

    try {
      await queryAssistant(text, (streamedText) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: streamedText }
              : msg
          )
        );
      });
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  "> **Error**: An unexpected error occurred while processing your query. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  return (
    <div className={cn("fixed bottom-5 right-5 z-50 flex flex-col items-end select-none", className)}>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          aria-label="Open AI Career Assistant Chatbot"
        >
          <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-black ring-2 ring-slate-950">
            AI
          </div>
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
        </button>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div
          className={cn(
            "flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 ease-out",
            isDocked
              ? "w-[calc(100vw-24px)] sm:w-[680px] lg:w-[840px] h-[85vh] max-h-[850px]"
              : "w-[calc(100vw-24px)] sm:w-[460px] md:w-[500px] h-[600px] max-h-[85vh]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <Brain className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold tracking-tight text-white">
                    IntelliHire AI Assistant
                  </span>
                  <Badge variant="default" className="text-[9px] px-1.5 py-0 font-mono">
                    Educational
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Career &amp; Technical Guardrails Active</span>
                </div>
              </div>
            </div>

            {/* Header Action Controls */}
            <div className="flex items-center gap-1 text-slate-400">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDocked(!isDocked)}
                title={isDocked ? "Standard View" : "Expanded View"}
                className="hidden sm:flex h-7 w-7 text-slate-400 hover:text-white"
              >
                {isDocked ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="h-7 w-7 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="border-b border-white/5 bg-slate-900/40 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Lightbulb className="h-3 w-3 text-amber-400" />
              Prompts:
            </span>
            {QUICK_PROMPT_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.query)}
                disabled={isLoading}
                className="shrink-0 rounded-full border border-white/10 bg-slate-800/70 hover:bg-indigo-600/30 hover:border-indigo-400/40 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer font-medium disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col",
                    isUser ? "items-end" : "items-start"
                  )}
                >
                  {/* Sender & Timestamp Info */}
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-slate-400 px-1">
                    {isUser ? (
                      <>
                        <span>You</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-3 w-3 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[8px] font-bold">
                          AI
                        </div>
                        <span className="text-indigo-300 font-semibold">IntelliHire Assistant</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "transition-all",
                      isUser
                        ? "rounded-2xl rounded-tr-xs bg-gradient-to-r from-blue-600/80 to-indigo-600/80 border border-indigo-400/30 px-4 py-2.5 text-white text-xs sm:text-sm font-medium shadow-lg max-w-[85%] break-words"
                        : "w-full max-w-full rounded-2xl rounded-tl-xs bg-slate-900/80 border border-white/10 p-4 shadow-xl backdrop-blur-md"
                    )}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div>
                        {msg.content ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          <div className="flex items-center gap-2 py-2 text-xs text-slate-400 font-mono">
                            <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                            <span>Formulating structured response...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Bar */}
          <div className="border-t border-white/10 bg-slate-900/90 p-3 backdrop-blur-md">
            <div className="relative flex items-end gap-2 rounded-xl border border-white/10 bg-slate-950/80 p-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about ATS resumes, Kadane's algorithm, TreeSHAP values, EEOC rules..."
                rows={1}
                className="w-full resize-none bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none min-h-[36px] max-h-[120px]"
              />

              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="h-8 w-8 shrink-0 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 transition-all cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Guardrail footer note */}
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400 inline" />
                Educational &amp; Career Scope Enforced
              </span>
              <span className="hidden sm:inline">Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
