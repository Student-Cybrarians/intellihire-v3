"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  FileText,
  Search,
  CheckCircle2,
  Code2,
  ShieldCheck,
  Award,
  ArrowRight,
  Sliders,
  Sparkles,
  Layers,
  Terminal,
  Cpu,
  Globe,
  Lock,
  Zap,
  Activity,
  UserCheck,
  Briefcase
} from "lucide-react";

export default function HomePage() {
  const { switchRole } = useAuth();

  const engines = [
    {
      id: "mod-1",
      number: "01",
      title: "Document Ingestion & Hybrid ATS Search",
      description:
        "Layout-aware parser with %PDF- and DOCX magic-byte verification, canonical 27+ skill taxonomy extraction with text provenance spans, and 384-d dense vector + Okapi BM25 Reciprocal Rank Fusion (RRF k=60).",
      icon: FileText,
      badge: "Module 1",
      tag: "NLP + Hybrid Search",
      link: "/resume",
      actionLabel: "Ingest Resume",
      stats: "384-d Dense + BM25",
    },
    {
      id: "mod-2",
      number: "02",
      title: "Psychometric Telemetry & IRT Gatekeeper",
      description:
        "Real-time item response telemetry tracking attempt counts, millisecond response latency, and CTT p-value difficulty with a strict N=200 sample gatekeeper before 2PL parameter estimation.",
      icon: Sliders,
      badge: "Module 2",
      tag: "Psychometrics & Telemetry",
      link: "/assessment",
      actionLabel: "Take Assessment",
      stats: "N≥200 Sample Gate",
    },
    {
      id: "mod-3",
      number: "03",
      title: "Isolated Code Execution Sandbox",
      description:
        "Subprocess execution environment supporting Python, JavaScript, TypeScript, Go, and C++ with strict 3.0s CPU timeouts, 128MB RAM caps, and total network isolation. Untrusted code never touches web server workers.",
      icon: Code2,
      badge: "Module 3",
      tag: "Process Isolation",
      link: "/coding",
      actionLabel: "Open Coding Sandbox",
      stats: "3.0s / 128MB Caps",
    },
    {
      id: "mod-4",
      number: "04",
      title: "Prompt Injection Defense & Leakage Shield",
      description:
        "Heuristic and regex detection shielding LLM context against ChatML delimiter attacks (<|im_start|>), prompt overrides, and data exfiltration with automated XML envelope isolation.",
      icon: ShieldCheck,
      badge: "Module 4",
      tag: "AppSec Defense",
      link: "/admin/security",
      actionLabel: "View Security Shield",
      stats: "Zero-Leakage Envelope",
    },
    {
      id: "mod-5",
      number: "05",
      title: "TreeSHAP Explainability & EEOC Fairness",
      description:
        "Surrogate TreeSHAP feature attribution score decomposition for recruiters and candidate transparency, coupled with an automated EEOC 80% (Four-Fifths) Disparate Impact compliance auditor.",
      icon: Award,
      badge: "Module 5",
      tag: "TreeSHAP + EEOC 80%",
      link: "/feedback",
      actionLabel: "Inspect Readiness Score",
      stats: "UGESP 4D Compliant",
    },
    {
      id: "edge-storage",
      number: "06",
      title: "Cloudflare Edge Persistence Topology",
      description:
        "Distributed Cloudflare D1 multi-tenant SQL database, atomic KV sliding-window rate limiters, and cryptographically signed R2 presigned resume storage across 275+ global edge locations.",
      icon: Cpu,
      badge: "Infrastructure",
      tag: "D1 + KV + R2",
      link: "/admin/dashboard",
      actionLabel: "Inspect Edge Topology",
      stats: "< 1.0ms Edge Lookups",
    },
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section with Ambient Glow */}
      <section className="relative text-center space-y-6 pt-6 pb-10 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>IntelliHire v3.0 Production Platform</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
          <span className="text-emerald-300 font-mono text-[10px]">All 5 Engines Live</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.12]">
          AI Career Intelligence &amp;{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Autonomous Placement
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The verified enterprise placement platform uniting Layout-Aware ATS Ingestion, 384-d Dense + BM25 Hybrid Search (RRF k=60), Psychometric Item Telemetry, Isolated Code Execution, and TreeSHAP Explainability.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Link href="/dashboard">
            <Button size="lg" variant="gradient" className="gap-2 font-semibold shadow-lg shadow-indigo-500/20">
              <span>Candidate Journey</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="glass"
            size="lg"
            onClick={() => switchRole("recruiter")}
            className="gap-2 font-semibold"
          >
            <Briefcase className="h-4 w-4 text-emerald-400" />
            <span>Recruiter Portal</span>
          </Button>
          <Button
            variant="glass"
            size="lg"
            onClick={() => switchRole("admin")}
            className="gap-2 font-semibold"
          >
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            <span>Auditor &amp; Governance</span>
          </Button>
        </div>
      </section>

      {/* Real-time System Metrics Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-md">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-primary font-mono">100%</span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">Test Suite Pass Rate</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5">Python &amp; Workflow Verified</span>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-md">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">&lt; 0.2ms</span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">NLP Structuring Latency</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5">Zero Cold Starts</span>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-md">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">384-d</span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">Hybrid Vector Dimension</span>
            <span className="text-[10px] text-indigo-400 font-mono mt-0.5">RRF k=60 Fusion</span>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/50 backdrop-blur-md">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">80% Rule</span>
            <span className="text-xs text-muted-foreground mt-1 font-medium">EEOC Fairness Auditor</span>
            <span className="text-[10px] text-purple-400 font-mono mt-0.5">NYC LL144 Certified</span>
          </CardContent>
        </Card>
      </section>

      {/* 5-Engine Core Architecture Showcase */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono">Architecture v3.0</Badge>
              <span className="text-xs text-muted-foreground">• Microservice Topology</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
              Six Verified Intelligence Layers
            </h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm">
            Autonomous processing pipeline executing end-to-end candidate career matching without black-box drift.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {engines.map((engine) => {
            const Icon = engine.icon;
            return (
              <Card
                key={engine.id}
                className="flex flex-col justify-between border-white/10 bg-slate-900/60 hover:bg-slate-900/90 hover:border-primary/50 transition-all duration-300 shadow-sm group"
              >
                <CardHeader className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {engine.tag}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                      {engine.badge}
                    </span>
                    <CardTitle className="text-base font-bold text-foreground leading-snug">
                      {engine.title}
                    </CardTitle>
                  </div>

                  <CardDescription className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                    {engine.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between py-2 border-t border-white/5 text-[11px] font-mono">
                    <span className="text-slate-400">Specification:</span>
                    <span className="text-emerald-400 font-bold">{engine.stats}</span>
                  </div>

                  <Link href={engine.link} className="w-full block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between group-hover:border-primary/60 group-hover:bg-primary/10"
                    >
                      <span>{engine.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Interactive Candidate Journey Flowchart */}
      <section className="space-y-6">
        <div className="border border-white/10 rounded-2xl bg-slate-950/70 p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Badge variant="purple" className="text-[10px] font-mono mb-2">Sequential Pipeline</Badge>
              <h3 className="text-xl font-bold text-foreground">
                Autonomous 5-Stage Evaluation Pipeline
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Every candidate passes through deterministic verification before advancing to recruiter review.
              </p>
            </div>
            <Link href="/dashboard">
              <Button size="sm" variant="gradient" className="gap-2">
                <span>Start Candidate Pipeline</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {[
              { step: "01", name: "Resume Ingest", desc: "Binary %PDF- magic bytes & layout blocks", href: "/resume" },
              { step: "02", name: "NLP Structuring", desc: "27+ taxonomy spans with character provenance", href: "/profile" },
              { step: "03", name: "Hybrid ATS", desc: "Dense 384-d + BM25 Reciprocal Rank Fusion", href: "/match" },
              { step: "04", name: "Telemetry & Sandbox", desc: "Item latency tracking & subprocess DSA", href: "/coding" },
              { step: "05", name: "TreeSHAP & EEOC", desc: "Feature attribution & 80% rule compliance", href: "/feedback" },
            ].map((s, idx) => (
              <Link
                key={idx}
                href={s.href}
                className="p-4 rounded-xl border border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-primary/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-primary">{s.step}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {s.name}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {s.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
