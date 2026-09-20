"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { StorageService, CandidateDossier } from "@/lib/storage-service";
import { executeSafeJavaScriptSandbox, SandboxExecutionReport, KADANE_TEST_CASES } from "@/lib/intelligence-engine";

const defaultCodes: Record<string, string> = {
  javascript: `function maxSubArray(nums) {
    if (!nums || nums.length === 0) return 0;
    let maxSoFar = nums[0];
    let currMax = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currMax = Math.max(nums[i], currMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currMax);
    }
    return maxSoFar;
}`,
  typescript: `function maxSubArray(nums: number[]): number {
    if (!nums || nums.length === 0) return 0;
    let maxSoFar: number = nums[0];
    let currMax: number = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currMax = Math.max(nums[i], currMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currMax);
    }
    return maxSoFar;
}`,
  python: `def max_sub_array(nums: list[int]) -> int:
    if not nums:
        return 0
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far`,
};

export default function CodingSandboxPage() {
  const [candidate, setCandidate] = useState<CandidateDossier | null>(null);
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python">("javascript");
  const [code, setCode] = useState(defaultCodes.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<SandboxExecutionReport | null>(null);

  useEffect(() => {
    const active = StorageService.getActiveCandidate();
    setCandidate(active);
    if (active.codingSubmission) {
      setCode(active.codingSubmission.code);
    }
    // Run initial execution report
    const initialReport = executeSafeJavaScriptSandbox(code, KADANE_TEST_CASES);
    setReport(initialReport);
  }, []);

  const handleLanguageChange = (lang: typeof language) => {
    setLanguage(lang);
    setCode(defaultCodes[lang] || defaultCodes.javascript);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      const execReport = executeSafeJavaScriptSandbox(code, KADANE_TEST_CASES);
      setReport(execReport);
      setIsRunning(false);

      if (candidate) {
        candidate.codingSubmission = {
          code,
          language,
          status: execReport.status,
          passedCount: execReport.passedCount,
          totalCount: execReport.totalCount,
          latencyMs: execReport.latencyMs,
          scorePercentage: (execReport.passedCount / execReport.totalCount) * 100,
          timestamp: new Date().toISOString(),
        };
        StorageService.saveActiveCandidate(candidate);
      }
    }, 400);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">Module 3</Badge>
            <Badge variant="success" dot className="text-xs font-mono">Isolated Context Active</Badge>
            <Badge variant="secondary" className="text-xs font-mono">3.0s / 128MB Hard Caps</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            Isolated Code Execution Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Safe execution environment for DSA benchmarks evaluating <strong className="text-white">{candidate?.name}</strong> against deterministic test suites.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/feedback">
            <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <span>View Shapley Scorecard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Security Banner */}
      <Alert variant="purple" className="border-purple-500/30 bg-purple-500/10 backdrop-blur-md">
        <ShieldCheck className="h-4 w-4 text-purple-400" />
        <AlertTitle className="text-xs font-bold text-purple-300">
          Zero-Trust In-Browser Execution Boundary
        </AlertTitle>
        <AlertDescription className="text-xs text-slate-300 mt-1 leading-relaxed">
          Candidate code runs inside an isolated execution boundary with network disconnections and memory bounds. Host systems and worker threads are protected against arbitrary execution.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Code editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-3 border-b border-white/5 bg-slate-950/80 gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground font-sans">
                  Kadane Algorithm Solution
                </span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  DSA Test Suite (4 Cases)
                </Badge>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10">
                {(["javascript", "typescript", "python"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md capitalize transition-all cursor-pointer ${
                      language === lang
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <CardContent className="p-0">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                className="w-full p-4 bg-slate-950/95 font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed selection:bg-primary/40 border-none"
                spellCheck={false}
              />
            </CardContent>

            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 border-t border-white/5 bg-slate-950/80 gap-3">
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>Timeout: 3.0s</span>
                <span>•</span>
                <span>Memory: 128MB</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Network: Isolated</span>
              </div>

              <Button
                onClick={handleRunCode}
                disabled={isRunning}
                variant="gradient"
                className="w-full sm:w-auto gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Executing in Sandbox...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Execute in Sandbox</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Live AST terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  Live AST Execution Terminal
                </CardTitle>
                <Badge variant={report?.status === "ACCEPTED" ? "success" : "destructive"} className="text-[10px] font-mono">
                  {report?.status || "PENDING"}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Deterministic output · {report?.passedCount} / {report?.totalCount} test cases verified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 font-mono">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider font-sans">
                    Execution Latency
                  </span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {report?.latencyMs || 0.0} ms
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider font-sans">
                    Memory Footprint
                  </span>
                  <span className="font-bold text-indigo-400 text-sm">
                    {report?.memoryMb || 0.0} MB
                  </span>
                </div>
              </div>

              {/* Terminal stdout stream */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  Process Standard Output
                </span>
                <div className="p-3.5 rounded-xl bg-black/90 border border-white/10 min-h-[180px] overflow-hidden space-y-1">
                  {report?.stdoutLines.map((line, idx) => (
                    <div key={idx} className={`text-xs ${line.color} font-mono leading-relaxed`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Case Breakdown */}
              <div className="space-y-2 pt-2 border-t border-white/5 font-sans">
                <span className="text-xs font-bold text-foreground block">
                  Validation Test Cases ({report?.passedCount} / {report?.totalCount} Passed)
                </span>
                <div className="space-y-1.5">
                  {report?.testResults.map((tr, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono ${
                        tr.passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      }`}
                    >
                      <span>{tr.name}</span>
                      <span className="font-bold">
                        {tr.passed ? "Passed ✓" : `Failed (${tr.actual} ≠ ${tr.expected})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
