"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Award, BarChart3, TrendingUp, ShieldCheck, ChevronRight, Users, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReadinessReport {
  overallScore: number;
  committeeVerdict: string;
  dimensions: {
    name: string;
    score: number;
    weight: string;
  }[];
  strengths: string[];
  improvementGaps: string[];
  benchmarks: {
    percentile: string;
    targetRoleMatch: string;
  };
}

export default function ReadinessPage() {
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch("/api/readiness/report");
        if (res.ok) {
          const data = await res.json();
          setReport(data.report);
        }
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Strong Hire": return "bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30";
      case "Hire / Qualified": return "bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/30";
      default: return "bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30";
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
                <BarChart3 className="w-5 h-5 text-[#8b5cf6]" />
                Module 5: AI Hiring Committee & Readiness Aggregator
              </h1>
              <p className="text-xs text-[#94a3b8]">Multi-dimensional candidate synthesis with calibrated hiring verdict</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {!report ? (
          <div className="text-center py-12">
            <p className="text-[#94a3b8]">Unable to load readiness report.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Executive Verdict Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#111827] via-[#1e1b4b] to-[#111827] border border-[#8b5cf6]/30 space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#8b5cf6] mb-2">
                    <Award className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Hiring Committee Verdict</span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-white">Overall Readiness: <span className="text-[#8b5cf6]">{report.overallScore} / 100</span></h1>
                  <p className="text-xs text-[#94a3b8] mt-1">
                    Aggregated across {report.dimensions.length} calibrated evaluation dimensions with weighted confidence.
                  </p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border",
                    getVerdictColor(report.committeeVerdict)
                  )}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {report.committeeVerdict}
                  </span>
                </div>
              </div>

              {/* Percentile Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Candidate Percentile Ranking</span>
                <span className="flex items-center gap-1.5 text-[#10b981] font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Top {report.benchmarks.percentile} of assessed candidates
                </span>
              </div>
            </div>

            {/* Dimension Breakdown */}
            <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-[#f8fafc]">Evaluation Dimension Breakdown</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {report.dimensions.map((dim, idx) => (
                  <div key={dim.name} className={cn(
                    "p-5 rounded-xl border transition-all",
                    idx < 2 ? "border-[#3b82f6]/50 bg-[#111827]/80" : "border-[#1f2937]"
                  )}>
                    <div className="text-xs text-[#94a3b8] mb-1">{dim.name}</div>
                    <div className="flex items-end gap-1.5 mb-2">
                      <span className="text-3xl font-extrabold text-[#f8fafc]">{dim.score}</span>
                      <span className="text-xs text-[#94a3b8] pb-1">/ 100</span>
                    </div>
                    <div className="w-full bg-[#1f2937] rounded-full h-2">
                      <div className={cn(
                        "h-2 rounded-full",
                        dim.score >= 85 ? "bg-[#10b981]" : dim.score >= 70 ? "bg-[#3b82f6]" : "bg-[#f59e0b]"
                      )}" style={{ width: `${dim.score}%` }}></div>
                    </div>
                    <div className="text-[10px] text-[#6b7280] mt-2">Weight: {dim.weight}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvement Gaps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-4">
                <div className="flex items-center gap-2 text-[#10b981]">
                  <Award className="w-5 h-5" />
                  <h3 className="font-semibold text-[#f8fafc]">Evidence-Backed Strengths</h3>
                </div>
                <div className="space-y-3">
                  {report.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0b0f19] border border-[#1f2937]">
                      <CheckCircle2 className="w-5 h-5 text-[#10b981] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#cbd5e1] leading-relaxed">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement Gaps */}
              <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-4">
                <div className="flex items-center gap-2 text-[#f59e0b]">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="font-semibold text-[#f8fafc]">Priority Improvement Gaps</h3>
                </div>
                <div className="space-y-3">
                  {report.improvementGaps.map((gap, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#0b0f19] border border-[#1f2937]">
                      <span className="w-5 h-5 text-[#f59e0b] mt-0.5 shrink-0 flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-[#cbd5e1] leading-relaxed">{gap}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Role Match */}
            <div className="p-6 rounded-xl bg-[#111827] border border-[#8b5cf6]/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#8b5cf6]">
                  <Users className="w-5 h-5" />
                  <h3 className="font-semibold text-[#f8fafc]">Target Role Alignment</h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#8b5cf6]/20 text-[#c084fc] border border-[#8b5cf6]/30">
                  {report.benchmarks.targetRoleMatch}
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Your persistent career context demonstrates strong technical and behavioral alignment with the
                <strong className="text-white">Senior Full-Stack Engineer</strong> competency matrix for Cloud & AI platforms.
                Committee recommends immediate placement pipeline activation for staff+ trajectories.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}