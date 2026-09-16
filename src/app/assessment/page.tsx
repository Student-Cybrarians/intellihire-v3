"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Sliders,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Activity,
  ArrowRight,
  Sparkles,
  Info,
  ShieldCheck,
  Zap,
  Cpu
} from "lucide-react";

export default function AssessmentTelemetryPage() {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([
    {
      itemId: "item_kadane_01",
      topic: "Dynamic Programming Invariant",
      selectedOption: 0,
      isCorrect: true,
      latencyMs: 1420,
      timestamp: new Date().toISOString(),
      cttPValue: "0.80",
      sampleCount: 26,
    }
  ]);

  const questions = [
    {
      id: "item_kadane_01",
      topic: "Algorithm Optimization & Dynamic Programming",
      stem: "In Kadane's algorithm for Maximum Subarray Sum, what is the tight asymptotic time complexity and invariant maintained across each step?",
      options: [
        "O(N) time, maintaining the maximum subarray sum ending at the current index.",
        "O(N log N) time, maintaining a binary indexed tree of partial prefix sums.",
        "O(N^2) time, testing every subarray boundary via two pointers.",
        "O(1) auxiliary space with O(N^3) brute-force validation.",
      ],
      correctIndex: 0,
      historicalAttempts: 25,
      historicalCorrect: 20, // p-value = 20 / 25 = 0.80
    },
    {
      id: "item_vector_rrf_02",
      topic: "Hybrid Information Retrieval (RRF)",
      stem: "When computing Reciprocal Rank Fusion (RRF) with constant k=60 between dense vector search and sparse BM25, why is rank aggregation preferred over raw score normalization?",
      options: [
        "Rank aggregation is invariant to arbitrary scale and distribution differences between sparse lexical and dense cosine score bounds.",
        "Score normalization creates quadratic memory bottlenecks in inverted index lookups.",
        "RRF requires integer embeddings instead of 384-dimensional floating point vectors.",
        "It eliminates the need for vector databases by performing client-side string sorting.",
      ],
      correctIndex: 0,
      historicalAttempts: 40,
      historicalCorrect: 32, // p-value = 32 / 40 = 0.80
    },
  ];

  const currentQ = questions[currentQuestionIdx];

  useEffect(() => {
    setStartTime(Date.now());
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestionIdx]);

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    const latencyMs = Date.now() - startTime;
    const isCorrect = selectedOption === currentQ.correctIndex;

    const newLog = {
      itemId: currentQ.id,
      topic: currentQ.topic,
      selectedOption,
      isCorrect,
      latencyMs,
      timestamp: new Date().toISOString(),
      cttPValue: ((currentQ.historicalCorrect + (isCorrect ? 1 : 0)) / (currentQ.historicalAttempts + 1)).toFixed(2),
      sampleCount: currentQ.historicalAttempts + 1,
    };

    setTelemetryLogs((prev) => [newLog, ...prev]);
    setIsSubmitted(true);
  };

  const handleNextQuestion = () => {
    setIsSubmitted(false);
    setSelectedOption(null);
    setElapsedSeconds(0);
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">Module 2</Badge>
            <Badge variant="warning" dot className="text-xs font-mono">Sample Gate Active (&lt; 200)</Badge>
            <Badge variant="secondary" className="text-xs font-mono">Millisecond Telemetry</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            Psychometric Assessment &amp; Item Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time response latency logging, CTT difficulty p-values, and strict N=200 sample Item Response Theory gatekeeper.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/coding">
            <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <span>Open Isolated Coding Sandbox</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* IRT Calibration Threshold Alert */}
      <Alert variant="warning" className="border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-xs font-bold text-amber-300">
          Strict Item Response Theory (IRT) Gatekeeper Active
        </AlertTitle>
        <AlertDescription className="text-xs text-slate-300 mt-1 leading-relaxed">
          Item difficulty curves are governed by Classical Test Theory (CTT) metrics until sample response volumes reach <strong className="text-white font-mono">N ≥ 200</strong>. 2-Parameter Logistic (2PL) marginal maximum likelihood estimation is gated to prevent uncalibrated variance drift.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Assessment Runner (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px] font-mono bg-slate-950 border-white/10">
                  Question {currentQuestionIdx + 1} of {questions.length} • {currentQ.id}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{elapsedSeconds}s elapsed</span>
                </div>
              </div>
              <CardTitle className="text-sm sm:text-base font-bold mt-3 text-foreground leading-relaxed">
                {currentQ.stem}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2.5 px-5 pb-5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let optionStyle = "border-white/5 bg-slate-950/60 hover:border-primary/40 hover:bg-slate-950 text-slate-300";

                if (isSubmitted) {
                  if (idx === currentQ.correctIndex) {
                    optionStyle = "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-bold";
                  } else if (isSelected) {
                    optionStyle = "border-rose-500/60 bg-rose-500/15 text-rose-300";
                  }
                } else if (isSelected) {
                  optionStyle = "border-primary bg-primary/20 text-white font-bold shadow-md shadow-indigo-500/10";
                }

                return (
                  <button
                    key={idx}
                    disabled={isSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all text-xs flex items-start gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className="h-5 w-5 rounded-md border border-white/10 flex items-center justify-center font-mono font-bold shrink-0 mt-0.5 bg-black/40 text-[10px]">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-relaxed">{option}</span>
                  </button>
                );
              })}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-5 pb-5 border-t border-white/5">
              <span className="text-xs text-slate-400 font-mono">
                Historical CTT p-value: <strong className="text-emerald-400">0.80 (Standard Item)</strong>
              </span>

              {!isSubmitted ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  variant="gradient"
                  className="w-full sm:w-auto gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Stream Item Telemetry</span>
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  variant="gradient"
                  className="w-full sm:w-auto gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Live Telemetry Event Stream & Psychometrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Activity className="h-4 w-4 text-emerald-400" />
                  Real-time Item Telemetry Stream
                </CardTitle>
                <Badge variant="success" dot className="text-[10px] font-mono">Telemetry Live</Badge>
              </div>
              <CardDescription className="text-xs">
                Latency, attempt count, and difficulty index per item
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-white/5 bg-slate-950/80 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{log.itemId}</span>
                    <Badge variant={log.isCorrect ? "success" : "destructive"} className="text-[9px]">
                      {log.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-white/5">
                    <div>
                      <span>Latency: </span>
                      <strong className="text-foreground">{(log.latencyMs / 1000).toFixed(2)}s</strong>
                    </div>
                    <div>
                      <span>CTT p-value: </span>
                      <strong className="text-emerald-400">{log.cttPValue}</strong>
                    </div>
                    <div>
                      <span>Attempts: </span>
                      <strong className="text-foreground">{log.sampleCount} / 200</strong>
                    </div>
                    <div>
                      <span>IRT Status: </span>
                      <strong className="text-amber-400">Gated (&lt; 200)</strong>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* CTT vs IRT Metric Card */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Sliders className="h-4 w-4 text-primary" />
                IRT 2PL Calibration Threshold
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 text-xs font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Sample Pool Volume</span>
                  <span className="text-foreground font-bold">26 / 200 (13.0%)</span>
                </div>
                <Progress value={13} variant="amber" className="h-2" />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                At N=200, the psychometric engine unlocks 2-Parameter Logistic (2PL) item characteristic curves (<code className="text-white font-mono">P(θ) = 1 / (1 + e^(-a(θ - b)))</code>).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
