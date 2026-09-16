"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  Users,
  Search,
  PlusCircle,
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";

export default function RecruiterDashboard() {
  const { user } = useAuth();

  const activeRequisitions = [
    {
      id: "req-01",
      title: "Principal AI & Distributed Systems Architect",
      department: "AI Infrastructure & Core Systems",
      candidatesCount: 18,
      topCandidate: "Vishnu Sharma (96.4% Fit, RRF 0.01639)",
      status: "Active",
      eeocAudited: true,
      budget: "$240k - $310k",
    },
    {
      id: "req-02",
      title: "Staff Machine Learning Engineer (Core Search)",
      department: "Information Retrieval & Ranking",
      candidatesCount: 24,
      topCandidate: "Elena Rostova (92.1% Fit, RRF 0.01582)",
      status: "Active",
      eeocAudited: true,
      budget: "$210k - $270k",
    },
    {
      id: "req-03",
      title: "Lead Distributed Systems Engineer",
      department: "Platform Edge Infrastructure",
      candidatesCount: 12,
      topCandidate: "Marcus Vance (89.5% Fit, RRF 0.01490)",
      status: "Active",
      eeocAudited: true,
      budget: "$195k - $250k",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Recruiter Enterprise Workspace
            </h1>
            <Badge variant="success" dot className="text-xs">
              Recruiter: {user?.name || "Priya Patel"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Hybrid ATS candidate ranking (384-d Dense + BM25 RRF k=60), character-span provenance dossiers, and EEOC compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/recruiter/requisitions/new">
            <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Requisition</span>
            </Button>
          </Link>
          <Link href="/recruiter/candidates">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Candidate Pool</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recruiter Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Active Requisitions</span>
              <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground font-mono">3</span>
              <span className="text-xs text-emerald-400 font-semibold">100% EEOC Audited</span>
            </div>
            <Progress value={100} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Qualified Pipeline</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">54</span>
              <span className="text-xs text-muted-foreground font-mono">Across 3 jobs</span>
            </div>
            <Progress value={85} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Avg Hybrid Search</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground font-mono">1.2ms</span>
              <span className="text-xs text-indigo-400 font-semibold font-mono">Dense + BM25</span>
            </div>
            <Progress value={95} variant="indigo" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">EEOC Parity Ratio</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-400 font-mono">0.94</span>
              <span className="text-xs text-emerald-400 font-semibold font-mono">&gt; 0.80 Safe</span>
            </div>
            <Progress value={94} variant="purple" className="mt-3 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Active Requisitions & Candidate Pipelines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Open Job Requisitions</h2>
            <p className="text-xs text-muted-foreground">Ranked using Reciprocal Rank Fusion (RRF k=60) with zero keyword hallucination</p>
          </div>
          <Link href="/recruiter/requisitions/new">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <PlusCircle className="h-3.5 w-3.5 text-primary" />
              <span>New Requisition</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {activeRequisitions.map((req) => (
            <Card key={req.id} className="border-white/10 bg-slate-900/70 hover:border-primary/50 hover:bg-slate-900/90 transition-all shadow-md">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{req.title}</h3>
                    <Badge variant="success" className="text-[9px] py-0">{req.status}</Badge>
                    <Badge variant="outline" className="text-[9px] py-0 font-mono">EEOC Audited</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dept: {req.department} • Compensation: <span className="font-mono text-slate-300 font-bold">{req.budget}</span> • Top Match: <strong className="text-primary font-mono">{req.topCandidate}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">Candidates</span>
                    <span className="text-xs font-bold text-foreground">{req.candidatesCount} Processed</span>
                  </div>
                  <Link href={`/recruiter/candidates?req=${req.id}`}>
                    <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-md shadow-indigo-500/20">
                      <span>View Pipeline</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
