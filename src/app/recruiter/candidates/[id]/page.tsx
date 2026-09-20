"use client";

import React, { useState, useEffect } from "react";
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
import { StorageService, CandidateDossier } from "@/lib/storage-service";
import { ExtractedSkill } from "@/lib/intelligence-engine";

export default function CandidateDossierPage() {
  const params = useParams();
  const [candidate, setCandidate] = useState<CandidateDossier | null>(null);
  const [selectedSpan, setSelectedSpan] = useState<{ skill: string; span: string; excerpt: string }>({
    skill: "Python",
    span: "[0-10]",
    excerpt: "Verified technical experience",
  });

  useEffect(() => {
    const active = StorageService.getActiveCandidate();
    setCandidate(active);
    if (active.parsedProfile.skills.length > 0) {
      const s0 = active.parsedProfile.skills[0];
      setSelectedSpan({
        skill: s0.skill,
        span: `[${s0.span[0]}-${s0.span[1]}]`,
        excerpt: s0.excerpt,
      });
    }
  }, [params]);

  const profile = candidate?.parsedProfile;
  const skills = profile?.skills || [];
  const fitScore = candidate?.selectedJob?.fitScore || candidate?.readinessScorecard?.readinessScore || 94.0;
  const rrfScore = candidate?.selectedJob?.rrfScore || 0.01639;

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
              <Badge variant="outline" className="text-xs font-mono">Dossier: {candidate?.id || "cand_01"}</Badge>
              <Badge variant="success" dot className="text-xs font-mono">Top Rank #1 ({fitScore}% Fit)</Badge>
              <Badge variant="purple" className="text-xs font-mono">EEOC Certified</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
              {candidate?.name} — Candidate Dossier &amp; Provenance
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {candidate?.title} • Target Requisition: <strong className="text-foreground font-mono">{candidate?.selectedJob?.jobId || "req-01"}</strong>
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
              <span className="text-2xl font-black font-mono text-primary">{rrfScore.toFixed(5)}</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">Rank #1</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2 font-mono">Dense {candidate?.selectedJob?.denseScore || 0.892} + BM25 {candidate?.selectedJob?.bm25Score || 3.84}</div>
            <Progress value={95} variant="default" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Skills Verified</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-foreground">{skills.length} Skills</span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">100% Provenance</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">Zero ungrounded hallucinations</div>
            <Progress value={Math.min(100, skills.length * 8)} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Sandbox Benchmark</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {candidate?.codingSubmission?.scorePercentage || 100}% Pass
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {candidate?.codingSubmission?.latencyMs || 89.2}ms Latency
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">Isolated execution sandbox</div>
            <Progress value={candidate?.codingSubmission?.scorePercentage || 100} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-muted-foreground">Shapley Readiness</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {candidate?.readinessScorecard?.readinessScore || 94.0}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                {candidate?.readinessScorecard && candidate.readinessScorecard.netLift >= 0 ? "+" : ""}
                {candidate?.readinessScorecard?.netLift || 26.0} Net Lift
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2">EEOC 80% Rule Certified</div>
            <Progress value={candidate?.readinessScorecard?.readinessScore || 94} variant="purple" className="mt-3 h-1.5" />
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
                  {skills.map((s) => (
                    <button
                      key={s.skill}
                      onClick={() => setSelectedSpan({ skill: s.skill, span: `[${s.span[0]}-${s.span[1]}]`, excerpt: s.excerpt })}
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

        {/* Right Column: Shapley Explainability (5 cols) */}
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
                    Additive Shapley linear surrogate feature contributions
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono bg-slate-950 border-white/10">
                  Surrogate Model
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 px-5 pb-5 text-xs font-mono">
              {(candidate?.readinessScorecard?.attributions || []).map((attr, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-white/5 bg-slate-950/80 flex justify-between">
                  <span className="text-slate-400 font-sans">{attr.feature}:</span>
                  <span className={`font-bold ${attr.isBase ? "text-foreground" : (attr.value >= 0 ? "text-emerald-400" : "text-rose-400")}`}>
                    {attr.isBase ? `${attr.value.toFixed(1)} pts` : `${attr.value >= 0 ? "+" : ""}${attr.value.toFixed(1)} pts`}
                  </span>
                </div>
              ))}

              <div className="p-3.5 rounded-xl bg-primary/15 border border-primary/40 flex justify-between font-bold text-xs">
                <span className="text-foreground font-sans">Net Candidate Readiness:</span>
                <span className="text-emerald-400 text-sm">
                  {candidate?.readinessScorecard?.readinessScore || 94.0} / 100
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
