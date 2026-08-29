"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Award, Play, BarChart2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface AssessmentTest {
  id: string;
  title: string;
  category: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  questionCount: number;
  durationMinutes: number;
  questions: Question[];
}

interface AssessmentResult {
  id: string;
  testId: string;
  testTitle: string;
  skill: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  levelReached: string;
  completedAt: string;
}

export default function AssessmentModulePage() {
  const [tests, setTests] = useState<AssessmentTest[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTest, setActiveTest] = useState<AssessmentTest | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/assessment");
        if (res.ok) {
          const data = await res.json();
          setTests(data.tests || []);
          setResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartTest = (test: AssessmentTest) => {
    setActiveTest(test);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setCompletedResult(null);
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    setSubmitting(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex
      }));

      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId: activeTest.id,
          answers
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCompletedResult(data.result);
        setResults(prev => [data.result, ...prev]);
        setActiveTest(null);
      }
    } finally {
      setSubmitting(false);
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
                <BarChart2 className="w-5 h-5 text-[#8b5cf6]" />
                Module 2: Adaptive AI Online Assessment
              </h1>
              <p className="text-xs text-[#94a3b8]">Precision technical evaluation with adaptive difficulty and verified skill tiers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#8b5cf6]/20 text-[#c084fc] border border-[#8b5cf6]/30 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Proctor Engine
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Active Test Session Mode */}
        {activeTest && (
          <div className="p-6 md:p-8 rounded-xl bg-[#111827] border border-[#1f2937] space-y-6">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b5cf6]">{activeTest.category}</span>
                <h2 className="text-lg font-bold text-[#f8fafc]">{activeTest.title}</h2>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
                <span>Question {currentQuestionIdx + 1} of {activeTest.questions.length}</span>
                <span className="px-2.5 py-1 rounded bg-[#1f2937] text-[#60a5fa] border border-[#374151]">
                  {activeTest.difficulty}
                </span>
              </div>
            </div>

            {/* Current Question */}
            {(() => {
              const q = activeTest.questions[currentQuestionIdx];
              return (
                <div className="space-y-6">
                  <div className="text-base md:text-lg font-medium text-[#f8fafc] leading-relaxed bg-[#0b0f19] p-5 rounded-lg border border-[#1f2937]">
                    {q.question}
                  </div>

                  <div className="space-y-3">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, oIdx)}
                          className={cn(
                            "w-full text-left p-4 rounded-lg border text-sm font-medium transition-all flex items-center justify-between",
                            isSelected
                              ? "bg-[#8b5cf6]/20 border-[#8b5cf6] text-white shadow-md shadow-[#8b5cf6]/10"
                              : "bg-[#0b0f19] border-[#1f2937] text-[#cbd5e1] hover:border-[#374151]"
                          )}
                        >
                          <span>{opt}</span>
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center",
                            isSelected ? "border-[#8b5cf6] bg-[#8b5cf6] text-white" : "border-[#4b5563]"
                          )}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#1f2937]">
                    <button
                      type="button"
                      disabled={currentQuestionIdx === 0}
                      onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                      className="px-4 py-2 rounded-lg border border-[#1f2937] text-xs font-medium text-[#94a3b8] hover:text-[#f8fafc] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {currentQuestionIdx < activeTest.questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                        className="px-5 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-medium"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={submitting || Object.keys(selectedAnswers).length < activeTest.questions.length}
                        onClick={handleSubmitTest}
                        className="px-6 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {submitting ? "Calculating Rating..." : "Submit & Lock Score"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Post-Completion Banner */}
        {completedResult && (
          <div className="p-6 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e1b4b] border border-[#8b5cf6]/50 mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#c084fc]">
                <Award className="w-6 h-6" />
                <h3 className="font-bold text-lg">Assessment Completed: {completedResult.testTitle}</h3>
              </div>
              <span className="text-2xl font-extrabold text-[#10b981]">{completedResult.score}%</span>
            </div>
            <p className="text-xs text-[#cbd5e1]">
              Performance benchmark: Verified at <strong className="text-white">{completedResult.levelReached}</strong> proficiency tier. Your persistent career context has been synchronized.
            </p>
          </div>
        )}

        {/* Test Catalog & Previous Results */}
        {!activeTest && (
          <div className="space-y-10">
            {/* Catalog */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-[#f8fafc]">Available Adaptive Assessment Modules</h2>
                  <p className="text-xs text-[#94a3b8]">Select a competency domain to initiate adaptive evaluation.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tests.map(test => (
                  <div key={test.id} className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] hover:border-[#8b5cf6] transition-all flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1f2937] text-[#c084fc] border border-[#374151]">
                          {test.category}
                        </span>
                        <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {test.durationMinutes} mins
                        </span>
                      </div>
                      <h3 className="font-semibold text-base text-[#f8fafc] mb-1">{test.title}</h3>
                      <p className="text-xs text-[#94a3b8]">Verified Skill: <span className="text-[#60a5fa] font-medium">{test.skill}</span> • {test.questionCount} Questions</p>
                    </div>

                    <button
                      onClick={() => handleStartTest(test)}
                      className="w-full py-2.5 px-4 rounded-lg bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Start Adaptive Test
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment History */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-[#f8fafc]">Verified Assessment History</h2>
                <div className="space-y-3">
                  {results.map(res => (
                    <div key={res.id} className="p-4 rounded-xl bg-[#111827] border border-[#1f2937] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                        <div>
                          <h4 className="font-semibold text-sm text-[#f8fafc]">{res.testTitle}</h4>
                          <span className="text-xs text-[#94a3b8]">{res.skill} • {res.correctCount}/{res.totalQuestions} correct • Verified {new Date(res.completedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-[#10b981]">{res.score}%</div>
                        <div className="text-[10px] text-[#c084fc] font-medium">{res.levelReached}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
