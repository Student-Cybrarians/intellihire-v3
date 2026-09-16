"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  MapPin,
  CheckCircle2,
  FileCheck2,
  Code2,
  Award,
  ShieldCheck,
  Search,
  ArrowLeft,
  Sparkles,
  BarChart2,
  Terminal,
  Activity,
  Layers
} from "lucide-react";

export default function CandidateDossierPage() {
  const params = useParams();
  const [selectedSpan, setSelectedSpan] = useState({
    skill: "TreeSHAP",
    span: "[557-565]",
    excerpt: "Authored automated TreeSHAP surrogate feature attribution engines and EEOC 80% Four-Fifths rule fairness auditing pipelines.",
  });

  return (
    <div className="space-y-8">
      {/* Back Button & Header */}
      <div>
        <Link href="/recruiter/candidates" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Candidate Pipeline</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">Dossier: cand_vishnu_p01</Badge>
              <Badge variant="success" dot className="text-xs font-mono">Top Rank #1 (96.4% Fit)</Badge>
              <Badge variant="purple" className="text-xs font-mono">EEOC Certified</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
              Vishnu Sharma — Candidate Dossier &amp; Provenance
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Principal AI &amp; Distributed Systems Architect • Target Requisition: <strong className="text-foreground font-mono">req-01</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" className="text-xs">
              <span>Export Dossier (PDF)</span>
            </Button>
            <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Advance to Offer Stage</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Engine Score Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Hybrid RRF Score</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-primary">0.01639</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">Rank #1</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 font-mono">Dense 0.892 + BM25 3.84</div>
            <Progress value={95} variant="default" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Skills Verified</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-foreground">20 / 22</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">91% Coverage</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">Zero ungrounded hallucinations</div>
            <Progress value={91} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Sandbox Benchmark</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-400">100% Pass</span>
              <span className="text-[10px] text-muted-foreground font-mono">89.2ms Latency</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">Subprocess isolation sandbox</div>
            <Progress value={100} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">TreeSHAP Readiness</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-400">94.0</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">+26.0 Net Lift</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">EEOC 80% Rule Certified</div>
            <Progress value={94} variant="purple" className="mt-3 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Main Dossier Split: Provenance Auditing + SHAP Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Character-Span Provenance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <FileCheck2 className="h-4 w-4 text-emerald-400" />
                    Character-Span Resume Provenance
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Every extracted skill anchors to exact character offsets in the original document
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono bg-slate-950 border-white/10">
                  Zero Hallucination
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-primary font-bold">Selected Anchor: {selectedSpan.skill}</span>
                  <span className="text-slate-400 font-mono">Byte Span Offset: {selectedSpan.span}</span>
                </div>
                <p className="font-mono text-slate-200 leading-relaxed p-3 rounded-lg bg-black/60 border border-white/5 text-[11px]">
                  &quot;{selectedSpan.excerpt}&quot;
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-foreground block">
                  Audited Canonical Skills List (Click to inspect source span)
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { skill: "TreeSHAP", span: "[557-565]", excerpt: "Authored automated TreeSHAP surrogate feature attribution engines and EEOC 80% Four-Fifths rule fairness auditing pipelines." },
                    { skill: "Qdrant", span: "[541-547]", excerpt: "Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60)" },
                    { skill: "Python", span: "[480-486]", excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
                    { skill: "Go", span: "[488-490]", excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
                    { skill: "PyTorch", span: "[518-525]", excerpt: "AI / ML: PyTorch, Hugging Face, Qdrant, Milvus, TreeSHAP, Fairlearn" },
                    { skill: "FastAPI", span: "[210-217]", excerpt: "high-throughput FastAPI/Go microservices" },
                  ].map((s) => (
                    <button
                      key={s.skill}
                      onClick={() => setSelectedSpan(s)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
                        selectedSpan.skill === s.skill
                          ? "border-primary bg-primary/20 text-foreground font-bold shadow-xs"
                          : "border-white/10 bg-slate-950/60 text-slate-400 hover:text-foreground hover:bg-slate-950"
                      }`}
                    >
                      {s.skill}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recruiter TreeSHAP Explainability (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    Score Attribution Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Zero black-box scoring: TreeSHAP additive feature contributions
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono bg-slate-950 border-white/10">
                  Surrogate Tree
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 px-5 pb-5 text-xs font-mono">
              <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80 flex justify-between">
                <span className="text-slate-400 font-sans">Population Baseline Score:</span>
                <span className="font-bold text-foreground">68.0 pts</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80 flex justify-between">
                <span className="text-slate-400 font-sans">Verified Skills Lift:</span>
                <span className="font-bold text-emerald-400">+12.4 pts</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80 flex justify-between">
                <span className="text-slate-400 font-sans">Seniority (10 yrs) Calibration:</span>
                <span className="font-bold text-emerald-400">+8.2 pts</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80 flex justify-between">
                <span className="text-slate-400 font-sans">Coding Sandbox Solution:</span>
                <span className="font-bold text-emerald-400">+4.3 pts</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80 flex justify-between">
                <span className="text-slate-400 font-sans">Psychometrics Telemetry:</span>
                <span className="font-bold text-emerald-400">+3.1 pts</span>
              </div>
              <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80 flex justify-between">
                <span className="text-slate-400 font-sans">Missing Tools (Kubeflow):</span>
                <span className="font-bold text-rose-400">-2.0 pts</span>
              </div>

              <div className="p-3.5 rounded-xl bg-primary/15 border border-primary/40 flex justify-between font-bold text-xs">
                <span className="text-foreground font-sans">Net Candidate Readiness:</span>
                <span className="text-emerald-400 text-sm">94.0 / 100</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
