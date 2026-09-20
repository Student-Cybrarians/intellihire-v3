"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sliders,
  Cpu,
  Layers,
  Terminal,
  UserCheck
} from "lucide-react";

export default function CandidateDashboard() {
  const { user } = useAuth();

  const journeySteps = [
    {
      title: "1. Document Ingestion & Magic-Bytes",
      status: "completed",
      detail: "Resume parsed (14 layout blocks, %PDF- binary header verified, 0.12ms parse latency)",
      href: "/resume",
      icon: FileText,
      badge: "Module 1",
    },
    {
      title: "2. NLP Skill Structuring & Provenance",
      status: "completed",
      detail: "20 skills mapped to 27+ canonical taxonomy with exact character-level byte provenance spans",
      href: "/profile",
      icon: UserCheck,
      badge: "NLP Engine",
    },
    {
      title: "3. Hybrid ATS Search (Dense + BM25)",
      status: "completed",
      detail: "Reciprocal Rank Fusion k=60 score 0.01639 (384-d Dense 0.492 + BM25 3.318)",
      href: "/match",
      icon: Search,
      badge: "RRF Fusion",
    },
    {
      title: "4. Psychometric Telemetry & IRT Gate",
      status: "in_progress",
      detail: "Kadane Algorithm Item: CTT p-value 0.80 logged (25/200 attempts in calibration pool)",
      href: "/assessment",
      icon: Sliders,
      badge: "Telemetry",
    },
    {
      title: "5. Isolated Code Execution Sandbox",
      status: "completed",
      detail: "Python DSA solution accepted (3/3 test cases passed in 89.2ms under 128MB RAM limit)",
      href: "/coding",
      icon: Code2,
      badge: "Subprocess",
    },
    {
      title: "6. TreeSHAP Explainability & EEOC Audit",
      status: "completed",
      detail: "Surrogate TreeSHAP score 94.0 (+26.0 boost over base 68.0), EEOC 80% parity verified",
      href: "/feedback",
      icon: Award,
      badge: "Explainable",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner with Ambient Glass */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Welcome back, {user?.name || "Vishnu Sharma"}
            </h1>
            <Badge variant="success" dot className="text-xs">
              Candidate Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Target Requisition: <strong className="text-foreground">Principal AI &amp; Distributed Systems Architect</strong> • Seniority: <span className="text-primary font-mono font-bold">LEAD / ARCHITECT</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/resume">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span>Update Resume</span>
            </Button>
          </Link>
          <Link href="/feedback">
            <Button size="sm" variant="gradient" className="gap-1.5 text-xs shadow-md shadow-indigo-500/20 font-semibold">
              <Award className="h-3.5 w-3.5" />
              <span>Readiness Scorecard (94.0)</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">AI Readiness Score</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">94.0</span>
              <span className="text-xs text-emerald-400 font-semibold font-mono">+26.0 (Base 68.0)</span>
            </div>
            <Progress value={94} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Skills Provenance</span>
              <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground font-mono">20 / 22</span>
              <span className="text-xs text-muted-foreground font-mono">91% Taxon Coverage</span>
            </div>
            <Progress value={91} variant="indigo" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Verified Experience</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground font-mono">10.0 yrs</span>
              <span className="text-xs text-indigo-400 font-semibold">Senior Tier</span>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground font-mono">Carnegie Mellon University (MS AI)</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">DSA Sandbox Verification</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Code2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-400 font-mono">100%</span>
              <span className="text-xs text-muted-foreground font-mono">3/3 Passed (89ms)</span>
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground font-mono">Isolated Subprocess Exec</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: 6-Step Journey & Active Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    End-to-End Placement Pipeline Status
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Deterministic verification stages completed prior to recruiter review
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono">85% Pipeline Complete</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              {journeySteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <Link
                    key={idx}
                    href={step.href}
                    className="flex items-start justify-between p-3.5 rounded-xl border border-white/5 bg-slate-950/60 hover:bg-slate-950 hover:border-primary/40 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">
                        {step.status === "completed" ? (
                          <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 text-xs font-bold">
                            ✓
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 text-xs font-bold animate-pulse">
                            ⏳
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          <span>{step.title}</span>
                          <Badge variant="outline" className="text-[9px] font-mono py-0">
                            {step.badge}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-primary group-hover:translate-x-1 transition-all mt-1" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {/* Quick Actions Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link href="/match" className="w-full">
              <Card className="hover:border-primary/50 transition-all p-4 flex flex-col justify-between h-full bg-slate-900/60 border-white/10 group">
                <Search className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-foreground block">Hybrid ATS Match</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Dense + BM25 RRF Score</span>
                </div>
              </Card>
            </Link>
            <Link href="/coding" className="w-full">
              <Card className="hover:border-primary/50 transition-all p-4 flex flex-col justify-between h-full bg-slate-900/60 border-white/10 group">
                <Code2 className="h-5 w-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-foreground block">Coding Assessment</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Subprocess Sandboxed DSA</span>
                </div>
              </Card>
            </Link>
            <Link href="/feedback" className="w-full">
              <Card className="hover:border-primary/50 transition-all p-4 flex flex-col justify-between h-full bg-slate-900/60 border-white/10 group">
                <Award className="h-5 w-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-foreground block">TreeSHAP Explainability</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Feature Impact Waterfall</span>
                </div>
              </Card>
            </Link>
            <Link href="/modules/career" className="w-full">
              <Card className="hover:border-primary/50 transition-all p-4 flex flex-col justify-between h-full bg-slate-900/60 border-white/10 group">
                <Sparkles className="h-5 w-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="text-xs font-bold text-foreground block">AI Career Assistant</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">Educational Guidance</span>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Col: Target Fit & EEOC Assurance */}
        <div className="space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Target className="h-4 w-4 text-primary" />
                Target Requisition Alignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Principal AI Engineer</span>
                  <span className="font-bold text-emerald-400 font-mono">96% Fit</span>
                </div>
                <Progress value={96} variant="emerald" className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">Distributed Systems Architect</span>
                  <span className="font-bold text-indigo-400 font-mono">89% Fit</span>
                </div>
                <Progress value={89} variant="indigo" className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300">MLOps &amp; Inference Lead</span>
                  <span className="font-bold text-blue-400 font-mono">92% Fit</span>
                </div>
                <Progress value={92} variant="default" className="h-2" />
              </div>

              <div className="pt-3 border-t border-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                  Verified Character-Span Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Python", "Go", "TypeScript", "FastAPI", "Next.js", "Qdrant", "SHAP", "Fairlearn", "Docker", "PostgreSQL"].map((s) => (
                    <Badge key={s} variant="secondary" className="text-[10px] font-mono bg-slate-950 border-white/10">{s}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Governance Assurance Badge */}
          <Card className="border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Audited for EEOC Algorithmic Fairness</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Candidate scoring is protected by the EEOC 80% (Four-Fifths) disparate impact compliance rule and surrogate TreeSHAP interpretable feature attributions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
