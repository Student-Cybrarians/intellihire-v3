"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle2,
  XCircle,
  Briefcase,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Target,
  Sliders,
  Sparkles,
  Binary
} from "lucide-react";
import { StorageService, CandidateDossier, Requisition } from "@/lib/storage-service";
import { matchCandidateToJobs, JobMatchResult } from "@/lib/intelligence-engine";

export default function HybridMatchPage() {
  const [candidate, setCandidate] = useState<CandidateDossier | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchResults, setMatchResults] = useState<JobMatchResult[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobMatchResult | null>(null);

  useEffect(() => {
    const active = StorageService.getActiveCandidate();
    setCandidate(active);
    const requisitions = StorageService.getRequisitions();

    const skills = active.parsedProfile.skills.map(s => s.skill);
    const text = active.rawResumeText;

    const matched = matchCandidateToJobs(skills, text, requisitions);
    setMatchResults(matched);
    if (matched.length > 0) {
      setSelectedJob(matched[0]);
      active.selectedJob = matched[0];
      StorageService.saveActiveCandidate(active);
    }
  }, []);

  const handleSelectJob = (job: JobMatchResult) => {
    setSelectedJob(job);
    if (candidate) {
      candidate.selectedJob = job;
      StorageService.saveActiveCandidate(candidate);
    }
  };

  const filteredMatches = matchResults.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.matchedSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">Module 1</Badge>
            <Badge variant="success" dot className="text-xs font-mono">RRF k=60 Fusion Active</Badge>
            <Badge variant="secondary" className="text-xs font-mono">384-d Vector Space</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            Hybrid ATS Job Matcher &amp; Vector Scoring
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Reciprocal Rank Fusion uniting 384-dimensional dense semantic embeddings with Okapi BM25 keyword matching for <strong className="text-white">{candidate?.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/assessment">
            <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <span>Take Psychometric Assessment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* RRF Formula Breakdown Card */}
      <Card className="border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md shadow-lg">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs font-mono border border-indigo-500/30">
              RRF
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-300 font-mono">
                RRF_Score(d) = ∑ [ 1 / (60 + rank_dense(d)) + 1 / (60 + rank_bm25(d)) ]
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Zero-bias reciprocal rank aggregation preventing keyword stuffing from overpowering semantic vector embeddings.
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] font-mono shrink-0 bg-slate-950 border-white/10">
            Strict RRF k=60
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Requisition List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search target roles or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-900/80 border-white/10 text-xs"
            />
          </div>

          <div className="space-y-3">
            {filteredMatches.map((job) => {
              const isSelected = selectedJob?.jobId === job.jobId;
              return (
                <div
                  key={job.jobId}
                  onClick={() => handleSelectJob(job)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? "border-primary bg-primary/15 shadow-lg shadow-indigo-500/10"
                      : "border-white/10 bg-slate-900/60 hover:border-primary/40 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-foreground leading-snug">{job.title}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{job.department} • {job.location}</p>
                    </div>
                    <Badge variant={job.fitScore >= 90 ? "success" : "default"} className="font-mono text-[10px] shrink-0">
                      {job.fitScore}% Fit
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5 font-mono">
                    <span className="text-slate-400">RRF Fusion Score:</span>
                    <span className="font-bold text-primary">{job.rrfScore.toFixed(5)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Job Fit Analysis & Score Decomposition (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedJob && (
            <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">{selectedJob.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5 font-medium">
                      {selectedJob.department} • {selectedJob.location} • Exp: {selectedJob.experienceRequired}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400 font-mono">{selectedJob.fitScore}%</span>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase">Hybrid Fit</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-5 pb-5">
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-white/5 font-mono text-[11px]">
                  {selectedJob.description}
                </p>

                {/* Score Decomposition Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/80 border border-white/5 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Dense Cosine Sim</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-emerald-400">
                        {selectedJob.denseScore.toFixed(3)}
                      </span>
                      <span className="text-[10px] text-slate-400">/ 1.000</span>
                    </div>
                    <Progress value={selectedJob.denseScore * 100} variant="emerald" className="h-1.5 mt-2" />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Okapi BM25 Sparse</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-indigo-400">
                        {selectedJob.bm25Score.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">pts</span>
                    </div>
                    <Progress value={(selectedJob.bm25Score / 5.0) * 100} variant="indigo" className="h-1.5 mt-2" />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Fused RRF Rank</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-lg font-black text-primary">
                        {selectedJob.rrfScore.toFixed(5)}
                      </span>
                    </div>
                    <Progress value={(selectedJob.rrfScore / 0.02) * 100} variant="default" className="h-1.5 mt-2" />
                  </div>
                </div>

                {/* Matched Skills */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Verified Matching Skills ({selectedJob.matchedSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.matchedSkills.map((s: string) => (
                      <Badge key={s} variant="success" className="text-[11px] font-mono py-0.5">
                        ✓ {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Missing Skills Gap */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <XCircle className="h-4 w-4 text-amber-400" />
                    <span>Growth Opportunity Skill Gaps ({selectedJob.missingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.missingSkills.length > 0 ? (
                      selectedJob.missingSkills.map((s: string) => (
                        <Badge key={s} variant="warning" className="text-[11px] font-mono py-0.5">
                          + {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-400 font-mono">100% Skill Coverage for this Role!</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-white/5">
                  <Link href="/assessment">
                    <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
                      <span>Proceed to Assessment Telemetry</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
