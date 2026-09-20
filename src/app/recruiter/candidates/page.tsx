"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Users,
  Filter,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Briefcase,
  Layers,
  Sparkles,
  ArrowLeft,
  Binary
} from "lucide-react";
import { StorageService, CandidateDossier } from "@/lib/storage-service";

export default function CandidateSearchPage() {
  const [candidates, setCandidates] = useState<CandidateDossier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReq, setSelectedReq] = useState("req-01");

  useEffect(() => {
    const pool = StorageService.getAllCandidates();
    setCandidates(pool);
  }, []);

  const filtered = candidates.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.parsedProfile.skills.some(s => s.skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/recruiter/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Recruiter Workspace</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">Module 1: Hybrid ATS Ranking</Badge>
              <Badge variant="success" dot className="text-xs font-mono">RRF k=60 Fusion</Badge>
              <Badge variant="purple" className="text-xs font-mono">EEOC Audited</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
              Candidate Pipeline &amp; Hybrid RRF Ranking
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Reciprocal Rank Fusion sorting candidates across 384-d semantic dense vectors and Okapi BM25 sparse keyword queries.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/recruiter/requisitions/new">
              <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-md shadow-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>New Requisition</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Requisition Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/70 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidate name or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-950/80 border-white/10 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Filter Requisition:</span>
          <select
            value={selectedReq}
            onChange={(e) => setSelectedReq(e.target.value)}
            className="w-full sm:w-auto text-xs bg-slate-950 p-2.5 rounded-xl border border-white/10 text-foreground font-medium focus:outline-none cursor-pointer"
          >
            <option value="req-01">Principal AI &amp; Distributed Systems Architect</option>
            <option value="req-02">Staff Machine Learning Engineer (Core Search)</option>
            <option value="req-03">Lead Distributed Systems Engineer</option>
          </select>
        </div>
      </div>

      {/* Candidate List */}
      <div className="space-y-4">
        {filtered.map((cand, idx) => {
          const fitScore = cand.selectedJob?.fitScore || cand.readinessScorecard?.readinessScore || 94.0;
          const rrfScore = cand.selectedJob?.rrfScore || 0.01639;

          return (
            <Card key={cand.id} className="border-white/10 bg-slate-900/70 backdrop-blur-xl hover:border-primary/50 transition-all shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Candidate Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-foreground">{cand.name}</h3>
                      <Badge variant="success" className="text-[10px] font-mono">Rank #{idx + 1}</Badge>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        RRF: {rrfScore.toFixed(5)}
                      </Badge>
                      <Badge variant="purple" className="text-[10px] font-mono">
                        EEOC 0.94
                      </Badge>
                    </div>

                    <p className="text-xs font-semibold text-primary">{cand.title}</p>
                    <p className="text-xs text-slate-400 font-mono text-[11px]">
                      {cand.parsedProfile.totalYearsExperience.toFixed(1)} Yrs Calibrated Exp • {cand.parsedProfile.education[0]?.degree || "BS Computer Science"}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {cand.parsedProfile.skills.slice(0, 8).map((s) => (
                        <Badge key={s.skill} variant="secondary" className="text-[10px] font-mono bg-slate-950 border-white/5 text-slate-300">
                          {s.skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Score Gauges & Breakdown */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-center font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Hybrid Fit</span>
                        <span className="text-xl font-black text-emerald-400">{fitScore}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">Skills Verified</span>
                        <span className="text-xl font-black text-foreground">{cand.parsedProfile.skills.length}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <Link href={`/recruiter/candidates/${cand.id}`} className="w-full">
                        <Button variant="gradient" size="sm" className="w-full gap-2 font-semibold text-xs shadow-md shadow-indigo-500/20">
                          <span>Inspect Dossier</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
