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
const MAX_ABS = 15; // widest absolute value among features → 100% bar width

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
    ? "#6366f1" // indigo
    : isPositive
    ? "#34d399" // emerald
    : "#f87171"; // rose
  const label = isBase
    ? `${value.toFixed(1)} (Base)`
    : `${value > 0 ? "+" : ""}${value.toFixed(1)} pts`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="p-3.5 rounded-xl border border-white/5 bg-slate-950/80 space-y-2 text-xs cursor-default"
      style={{
        borderColor: hovered ? `${color}40` : undefined,
        boxShadow: hovered ? `0 0 0 1px ${color}30, 0 4px 20px ${color}15` : undefined,
        transition: "border-color 0.2s, box-shadow 0.2s",
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

      {/* Animated bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : {}}
          transition={{
            duration: 0.6,
            delay: index * 0.08 + 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="text-[11px] text-slate-400 leading-snug overflow-hidden"
          >
            {description}
          </motion.p>
        )}
      </AnimatePresence>

      {!hovered && (
        <p className="text-[11px] text-slate-400 leading-snug">{description}</p>
      )}
    </motion.div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
const shapAttributions = [
  {
    feature: "Base Expected Score",
    value: 68.0,
    isBase: true,
    isPositive: true,
    description:
      "Baseline candidate population average prior to feature adjustments",
  },
  {
    feature: "Verified Canonical Skills (20/22)",
    value: +12.4,
    isBase: false,
    isPositive: true,
    description:
      "Direct character provenance in PyTorch, Go, Qdrant, TreeSHAP, and FastAPI",
  },
  {
    feature: "Seniority & Experience (10.0 yrs)",
    value: +8.2,
    isBase: false,
    isPositive: true,
    description:
      "Calibrated 10.0 years verified Principal / Architect track record",
  },
  {
    feature: "Coding Sandbox Benchmark (100%)",
    value: +4.3,
    isBase: false,
    isPositive: true,
    description:
      "Kadane algorithm solved with 89.2ms execution latency in isolated process",
  },
  {
    feature: "Psychometric Telemetry (p=0.80)",
    value: +3.1,
    isBase: false,
    isPositive: true,
    description:
      "Optimal latency curve and correct first-attempt response telemetry",
  },
  {
    feature: "Skill Gap Penalty (Kubeflow/Triton)",
    value: -2.0,
    isBase: false,
    isPositive: false,
    description:
      "Target role requisition missing 2 specialized ML deployment tools",
  },
];

export default function ReadinessFeedbackPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6"
      >
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              Module 5
            </Badge>
            <Badge variant="success" dot className="text-xs font-mono">
              TreeSHAP Explainability Active
            </Badge>
            <Badge variant="purple" className="text-xs font-mono">
              EEOC 80% Certified
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            AI Readiness Score &amp; Model Explainability
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Surrogate TreeSHAP feature attributions decomposing candidate
            evaluation scores with zero black-box drift.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <span>Return to Dashboard</span>
            </Button>
          </Link>
          <Link href="/admin/audits">
            <Button
              size="sm"
              variant="gradient"
              className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
            >
              <span>Inspect EEOC Audit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Score Hero Card */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={heroInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="border-emerald-500/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Certified AI Career Placement Readiness
                </span>
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl md:text-6xl font-black text-emerald-400 font-mono tracking-tight">
                    <SpringCounter to={94.0} className="" />
                  </span>
                  <span className="text-lg text-slate-400 font-mono">
                    / 100.0
                  </span>
                  <Badge variant="success" className="text-xs font-mono py-1">
                    Top 2% Percentile
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
                  Score synthesized from 5 verified engines: Layout-aware AST
                  parsing, RRF hybrid vector matching, CTT telemetry, isolated
                  sandbox DSA benchmarks, and TreeSHAP governance.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/80 border border-white/5 w-full md:w-auto font-mono">
                <div className="text-center p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">
                    Base Score
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    <SpringCounter to={68.0} />
                  </span>
                </div>
                <div className="text-center p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 block font-sans">
                    Net SHAP Lift
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    +<SpringCounter to={26.0} />
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TreeSHAP Feature Attribution Decomposition */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Waterfall Attribution Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    TreeSHAP Additive Feature Contributions
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Hover any row for detail • bars animate on scroll
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-mono bg-slate-950 border-white/10"
                >
                  Surrogate Tree
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5">
              <div className="space-y-2.5">
                {shapAttributions.map((attr, idx) => (
                  <WaterfallRow key={idx} {...attr} index={idx} />
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: shapAttributions.length * 0.08 + 0.3 }}
                className="p-3.5 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-between text-xs font-mono font-bold"
              >
                <span className="text-foreground">
                  Synthesized Final Readiness:
                </span>
                <span className="text-emerald-400 text-sm">
                  <SpringCounter to={94.0} /> / 100.0
                </span>
              </motion.div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Regulatory Auditing & Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* EEOC 80% Rule Compliance Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
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
                    <SpringCounter to={0.94} decimals={2} /> (≥ 0.80 PASS)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-emerald-500/20 text-slate-300 font-mono">
                  <span>NYC Local Law 144:</span>
                  <span className="font-bold text-emerald-400">
                    Audited &amp; Certified
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                  Candidate scoring distributions are audited against protected
                  demographic groups to verify statistical parity and compliance
                  with federal uniform guidelines.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actionable Upskilling Roadmap */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
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
                    1. Close ML Infrastructure Tool Gaps
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Add verified experience in Kubeflow or Triton Inference
                    Server to recover +2.0 readiness points.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/80 space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    2. High-Dimensional IRT Calibration
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Complete 3 additional psychometric benchmark items to
                    contribute to the N=200 item response theory calibration
                    threshold.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
