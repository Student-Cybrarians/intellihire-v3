"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Code, Play, Award, Terminal, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechInterview {
  id: string;
  title: string;
  language: string;
  difficulty: string;
  problemStatement: string;
  starterCode: string;
  userCode?: string;
  score?: number;
  feedback?: {
    correctness: number;
    codeQuality: number;
    efficiency: number;
    notes: string;
  };
  completedAt?: string;
}

const PROBLEMS = [
  {
    title: "LRU Cache Implementation with O(1) Operations",
    difficulty: "Hard",
    language: "typescript",
    problemStatement: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement `get(key: number): number` and `put(key: number, value: number): void` in O(1) average time complexity.",
    starterCode: `class LRUCache {\n  private capacity: number;\n  private cache: Map<number, number>;\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key: number): number {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key)!;\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n\n  put(key: number, value: number): void {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    } else if (this.cache.size >= this.capacity) {\n      const oldestKey = this.cache.keys().next().value;\n      if (oldestKey !== undefined) this.cache.delete(oldestKey);\n    }\n    this.cache.set(key, value);\n  }\n}`
  },
  {
    title: "Concurrent Rate Limiter (Token Bucket Algorithm)",
    difficulty: "Medium",
    language: "typescript",
    problemStatement: "Implement a token bucket rate limiter for edge workers that allows burst traffic up to capacity while refilling tokens continuously at a fixed rate.",
    starterCode: `class TokenBucketRateLimiter {\n  private capacity: number;\n  private refillRatePerSec: number;\n  private tokens: number;\n  private lastRefillTimestamp: number;\n\n  constructor(capacity: number, refillRatePerSec: number) {\n    this.capacity = capacity;\n    this.refillRatePerSec = refillRatePerSec;\n    this.tokens = capacity;\n    this.lastRefillTimestamp = Date.now();\n  }\n\n  allowRequest(tokensRequired: number = 1): boolean {\n    this.refill();\n    if (this.tokens >= tokensRequired) {\n      this.tokens -= tokensRequired;\n      return true;\n    }\n    return false;\n  }\n\n  private refill(): void {\n    const now = Date.now();\n    const elapsedSec = (now - this.lastRefillTimestamp) / 1000;\n    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillRatePerSec);\n    this.lastRefillTimestamp = now;\n  }\n}`
  }
];

export default function TechInterviewPage() {
  const [_interviews, setInterviews] = useState<TechInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState(PROBLEMS[0]);
  const [code, setCode] = useState(PROBLEMS[0].starterCode);
  const [evaluating, setEvaluating] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<TechInterview | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/interview/tech");
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews || []);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectProblem = (prob: typeof PROBLEMS[0]) => {
    setSelectedProblem(prob);
    setCode(prob.starterCode);
    setLastSubmission(null);
  };

  const handleSubmitCode = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/interview/tech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedProblem.title,
          language: selectedProblem.language,
          difficulty: selectedProblem.difficulty,
          problemStatement: selectedProblem.problemStatement,
          userCode: code,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLastSubmission(data.interview);
        setInterviews(prev => [data.interview, ...prev]);
      }
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] pb-20">
      {/* Header */}
      <header className="border-b border-[#1f2937] bg-[#111827]/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-[#1f2937] rounded-lg transition-colors text-[#94a3b8] hover:text-[#f8fafc]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Code className="w-5 h-5 text-[#3b82f6]" />
                Module 3: AI Technical Interview Simulator
              </h1>
              <p className="text-xs text-[#94a3b8]">Live code evaluation with AI algorithmic rubric and efficiency analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30 font-medium flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Edge Sandbox Active
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Problem & History */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3b82f6]">Select Benchmark Problem</span>
                <span className="text-xs text-[#94a3b8]">{PROBLEMS.length} challenges</span>
              </div>
              <div className="space-y-2">
                {PROBLEMS.map((prob) => (
                  <button
                    key={prob.title}
                    type="button"
                    onClick={() => handleSelectProblem(prob)}
                    className={cn(
                      "w-full text-left p-3.5 rounded-lg border text-xs transition-all",
                      selectedProblem.title === prob.title
                        ? "bg-[#3b82f6]/20 border-[#3b82f6] text-white"
                        : "bg-[#0b0f19] border-[#1f2937] text-[#94a3b8] hover:border-[#374151]"
                    )}
                  >
                    <div className="font-semibold text-[#f8fafc] mb-1">{prob.title}</div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-[#1f2937] text-[#60a5fa] border border-[#374151]">{prob.difficulty}</span>
                      <span className="capitalize">{prob.language}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Statement Card */}
            <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#f8fafc]">{selectedProblem.title}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                  {selectedProblem.difficulty}
                </span>
              </div>
              <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#0b0f19] p-4 rounded-lg border border-[#1f2937]">
                {selectedProblem.problemStatement}
              </p>
            </div>

            {/* AI Rubric Feedback Banner */}
            {lastSubmission?.feedback && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#111827] to-[#0f172a] border border-[#3b82f6]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#60a5fa]">
                    <Award className="w-5 h-5" />
                    <h4 className="font-bold text-sm">AI Rubric Evaluation</h4>
                  </div>
                  <span className="text-2xl font-extrabold text-[#10b981]">{lastSubmission.score} / 100</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-[#0b0f19] border border-[#1f2937]">
                    <div className="text-[10px] text-[#94a3b8]">Correctness</div>
                    <div className="font-bold text-[#10b981]">{lastSubmission.feedback.correctness}%</div>
                  </div>
                  <div className="p-2 rounded bg-[#0b0f19] border border-[#1f2937]">
                    <div className="text-[10px] text-[#94a3b8]">Quality</div>
                    <div className="font-bold text-[#3b82f6]">{lastSubmission.feedback.codeQuality}%</div>
                  </div>
                  <div className="p-2 rounded bg-[#0b0f19] border border-[#1f2937]">
                    <div className="text-[10px] text-[#94a3b8]">Efficiency</div>
                    <div className="font-bold text-[#8b5cf6]">{lastSubmission.feedback.efficiency}%</div>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed bg-[#0b0f19] p-3 rounded border border-[#1f2937]">
                  {lastSubmission.feedback.notes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Code Editor */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 rounded-xl bg-[#111827] border border-[#1f2937] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                <Terminal className="w-4 h-4 text-[#3b82f6]" />
                <span className="font-mono text-[#f8fafc]">solution.{selectedProblem.language === 'typescript' ? 'ts' : 'py'}</span>
              </div>
              <button
                type="button"
                disabled={evaluating}
                onClick={handleSubmitCode}
                className="px-5 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> {evaluating ? "Evaluating Algorithmic Rubric..." : "Run & Submit to AI Interviewer"}
              </button>
            </div>

            <div className="rounded-xl border border-[#1f2937] bg-[#0b0f19] overflow-hidden">
              <div className="px-4 py-2 bg-[#111827] border-b border-[#1f2937] text-xs font-mono text-[#94a3b8] flex justify-between">
                <span>TypeScript Strict Sandbox</span>
                <span>UTF-8</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={22}
                className="w-full p-4 bg-[#0b0f19] text-[#f8fafc] font-mono text-xs focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
