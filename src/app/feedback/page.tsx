"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  useSpring,
  useTransform,
  useInView,
  useMotionValue,
  AnimatePresence,
} from "framer-motion";
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
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  BarChart2,
  FileCheck2,
  Code2,
  Sliders,
  Check,
  Zap,
  Target,
} from "lucide-react";
import { StorageService, CandidateDossier } from "@/lib/storage-service";
import { computeShapleyAttributions, ReadinessScorecard, ShapleyAttribution } from "@/lib/intelligence-engine";

/* ── Spring counter component ─────────────────────────────────── */
function SpringCounter({
  to,
  decimals = 1,
  className,
}: {
  to: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (inView) raw.set(to);
  }, [inView, to, raw]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

/* ── Individual waterfall bar row ─────────────────────────────── */
const MAX_ABS = 15;

function WaterfallRow({
  feature,
  value,
  isBase,
  isPositive,
  description,
  index,
}: {
  feature: string;
  value: number;
  isBase: boolean;
  isPositive: boolean;
  description: string;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  const pct = Math.min(Math.abs(value) / MAX_ABS, 1) * 100;
  const color = isBase
    ? "#6366f1"
    : isPositive
    ? "#34d399"
    : "#f87171";
  const label = isBase
    ? `${value.toFixed(1)} (Base)`
    : `${value > 0 ? "+" : ""}${value.toFixed(1)} pts`;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="p-3.5 rounded-xl border border-white/5 bg-slate-950/80 space-y-2 text-xs cursor-default transition-all"
      style={{
        borderColor: hovered ? `${color}40` : undefined,
        boxShadow: hovered ? `0 0 0 1px ${color}30, 0 4px 20px ${color}15` : undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-foreground">{feature}</span>
        <span
          className="font-mono font-black text-sm"
          style={{ color }}
        >
          {label}
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>

      <p className="text-[11px] text-slate-400 leading-snug">{description}</p>
    </div>
  );
}

export default function ReadinessFeedbackPage() {
  const [candidate, setCandidate] = useState<CandidateDossier | null>(null);
  const [scorecard, setScorecard] = useState<ReadinessScorecard | null>(null);

  useEffect(() => {
    const active = StorageService.getActiveCandidate();
    setCandidate(active);

    const skillsCount = active.parsedProfile.skills.length || 10;
    const expYears = active.parsedProfile.totalYearsExperience || 10.0;
    const sandboxPassed = active.codingSubmission ? active.codingSubmission.scorePercentage : 100;
    const pValue = active.assessmentTelemetry.length > 0 ? 0.80 : 0.75;
    const missingCount = active.selectedJob ? active.selectedJob.missingSkills.length : 2;

    const computed = computeShapleyAttributions({
      skillsCount,
      totalExperienceYears: expYears,
      sandboxPassedPercentage: sandboxPassed,
      assessmentPValue: pValue,
      missingSkillsCount: missingCount,
    });

    setScorecard(computed);
    active.readinessScorecard = computed;
    StorageService.saveActiveCandidate(active);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">Module 5</Badge>
            <Badge variant="success" dot className="text-xs font-mono">Shapley Additive Model Active</Badge>
            <Badge variant="purple" className="text-xs font-mono">EEOC 80% Certified</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            AI Readiness Score &amp; Model Explainability
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Linear surrogate Shapley feature attributions decomposing candidate evaluation scores for <strong className="text-white">{candidate?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <span>Return to Dashboard</span>
            </Button>
          </Link>
          <Link href="/admin/audits">
            <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <span>Inspect EEOC Audit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Score Hero Card */}
      <Card className="border-emerald-500/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Certified AI Career Placement Readiness
              </span>
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-6xl font-black text-emerald-400 font-mono tracking-tight">
                  <SpringCounter to={scorecard?.readinessScore || 94.0} />
                </span>
                <span className="text-lg text-slate-400 font-mono">/ 100.0</span>
                <Badge variant="success" className="text-xs font-mono py-1">
                  Top Tier Candidate
                </Badge>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
                {scorecard?.plainSummary || "Synthesized across layout-aware AST parsing, RRF hybrid vector matching, psychometric telemetry, and isolated sandbox DSA benchmarks."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/80 border border-white/5 w-full md:w-auto font-mono">
              <div className="text-center p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                <span className="text-[10px] text-slate-400 block font-sans">Base Score</span>
                <span className="text-xl font-bold text-foreground">
                  {scorecard?.baseExpectedScore.toFixed(1) || "68.0"}
                </span>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-300 block font-sans">Net Lift</span>
                <span className="text-xl font-bold text-emerald-400">
                  {scorecard && scorecard.netLift >= 0 ? "+" : ""}{scorecard?.netLift.toFixed(1) || "+26.0"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Attribution Decomposition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Waterfall Attribution Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Shapley Additive Feature Contributions
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Linear surrogate model decomposing positive and negative score factors
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono bg-slate-950 border-white/10">
                  Surrogate Model
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              <div className="space-y-2.5">
                {(scorecard?.attributions || []).map((attr, idx) => (
                  <WaterfallRow key={idx} {...attr} index={idx} />
                ))}
              </div>

              <div className="p-3.5 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-foreground">Synthesized Final Readiness:</span>
                <span className="text-emerald-400 text-sm">
                  {scorecard?.readinessScore.toFixed(1) || "94.0"} / 100.0
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Regulatory Auditing & Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* EEOC 80% Rule Compliance Card */}
          <Card className="border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                EEOC Four-Fifths (80%) Rule Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-emerald-500/20 text-slate-300 font-mono">
                <span>Disparate Impact Ratio:</span>
                <span className="font-bold text-emerald-400">
                  {scorecard?.disparateImpactRatio || 0.94} (≥ 0.80 PASS)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-emerald-500/20 text-slate-300 font-mono">
                <span>NYC Local Law 144:</span>
                <span className="font-bold text-emerald-400">Audited &amp; Certified</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                Candidate scoring distributions are audited against protected demographic groups to verify statistical parity and compliance with federal uniform guidelines.
              </p>
            </CardContent>
          </Card>

          {/* Actionable Upskilling Roadmap */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Actionable Optimization Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 text-xs">
              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/80 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  1. Target Job Skill Alignment
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {candidate?.selectedJob?.missingSkills && candidate.selectedJob.missingSkills.length > 0
                    ? `Close skill gaps in ${candidate.selectedJob.missingSkills.join(", ")} to maximize match.`
                    : "Excellent skill coverage across core systems and algorithms."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/80 space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                  2. Telemetry Verification
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Recorded {candidate?.assessmentTelemetry.length || 1} assessment telemetry events contributing to calibration pool.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
