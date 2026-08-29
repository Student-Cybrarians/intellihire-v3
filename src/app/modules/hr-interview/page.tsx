"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Award, Send, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface HRInterview {
  id: string;
  category: string;
  scenario: string;
  question: string;
  userResponse?: string;
  feedback?: {
    starScore: number;
    communicationScore: number;
    leadershipScore: number;
    critique: string;
    improvements: string[];
  };
  completedAt?: string;
}

const HR_SCENARIOS = [
  {
    category: "Conflict Resolution & Alignment",
    scenario: "You are leading a critical edge migration on a tight 2-week deadline. Two senior engineers disagree on the caching invalidation strategy, halting progress.",
    question: "How do you mediate this stalemate, align on an architectural path, and ensure delivery without team friction?"
  },
  {
    category: "Handling Ambiguity & Production Outages",
    scenario: "A major degradation occurs in production during off-hours. Metrics show anomalous latency spikes but logs lack clear error traces.",
    question: "Walk through your triage process, stakeholder communication strategy, and root cause analysis methodology."
  }
];

export default function HRInterviewPage() {
  const [_interviews, setInterviews] = useState<HRInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState(HR_SCENARIOS[0]);
  const [response, setResponse] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<HRInterview | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/interview/hr");
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

  const handleSubmit = async () => {
    if (!response.trim()) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/interview/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedScenario.category,
          scenario: selectedScenario.scenario,
          question: selectedScenario.question,
          userResponse: response,
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLastSubmission(data.interview);
        setInterviews(prev => [data.interview, ...prev]);
        setResponse("");
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
                <Users className="w-5 h-5 text-[#f59e0b]" />
                Module 4: AI HR & Behavioral Interview Simulator
              </h1>
              <p className="text-xs text-[#94a3b8]">STAR method behavioral coaching and leadership evaluation</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Scenarios */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f59e0b]">Behavioral Scenario Catalog</span>
              <div className="space-y-2">
                {HR_SCENARIOS.map((scen) => (
                  <button
                    key={scen.category}
                    type="button"
                    onClick={() => {
                      setSelectedScenario(scen);
                      setLastSubmission(null);
                    }}
                    className={cn(
                      "w-full text-left p-3.5 rounded-lg border text-xs transition-all",
                      selectedScenario.category === scen.category
                        ? "bg-[#f59e0b]/20 border-[#f59e0b] text-white"
                        : "bg-[#0b0f19] border-[#1f2937] text-[#94a3b8] hover:border-[#374151]"
                    )}
                  >
                    <div className="font-semibold text-[#f8fafc] mb-1">{scen.category}</div>
                    <p className="text-[11px] text-[#94a3b8] line-clamp-2">{scen.scenario}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Rubric Feedback */}
            {lastSubmission?.feedback && (
              <div className="p-6 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e1b4b] border border-[#f59e0b]/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#f59e0b]">
                    <Award className="w-5 h-5" />
                    <h4 className="font-bold text-sm">Behavioral Analysis Rubric</h4>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-[#0b0f19] border border-[#1f2937]">
                    <div className="text-[10px] text-[#94a3b8]">STAR Score</div>
                    <div className="font-bold text-[#10b981]">{lastSubmission.feedback.starScore}%</div>
                  </div>
                  <div className="p-2 rounded bg-[#0b0f19] border border-[#1f2937]">
                    <div className="text-[10px] text-[#94a3b8]">Communication</div>
                    <div className="font-bold text-[#3b82f6]">{lastSubmission.feedback.communicationScore}%</div>
                  </div>
                  <div className="p-2 rounded bg-[#0b0f19] border border-[#1f2937]">
                    <div className="text-[10px] text-[#94a3b8]">Leadership</div>
                    <div className="font-bold text-[#f59e0b]">{lastSubmission.feedback.leadershipScore}%</div>
                  </div>
                </div>

                <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#0b0f19] p-3 rounded border border-[#1f2937]">
                  {lastSubmission.feedback.critique}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Question and Response */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1f2937] text-[#f59e0b] border border-[#374151]">
                  {selectedScenario.category}
                </span>
                <p className="text-xs text-[#94a3b8] italic">
                  "{selectedScenario.scenario}"
                </p>
                <h3 className="text-sm font-semibold text-[#f8fafc] pt-2">
                  {selectedScenario.question}
                </h3>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-medium text-[#94a3b8]">
                  Your STAR Response (Situation, Task, Action, Result)
                </label>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={10}
                  placeholder="Structure your answer clearly:
- Situation: Context of the problem
- Task: Your specific responsibility
- Action: Concrete steps you took to resolve it
- Result: Measurable outcome and team impact"
                  className="w-full p-4 rounded-lg bg-[#0b0f19] border border-[#1f2937] text-xs text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#f59e0b] resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={evaluating || response.trim().length < 10}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> {evaluating ? "Evaluating Behavioral Competencies..." : "Submit to AI Hiring Coach"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
