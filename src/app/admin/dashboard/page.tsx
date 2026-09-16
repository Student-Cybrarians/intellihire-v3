"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  Cpu,
  Database,
  Sliders,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
  Server,
  Lock,
  Zap,
  Globe,
  Binary
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Admin &amp; Governance Center
            </h1>
            <Badge variant="destructive" dot className="text-xs">
              Auditor: {user?.name || "Michael Chang"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Global engine monitoring, Cloudflare D1/KV/R2 edge topology, psychometric calibration, and EEOC auditing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/security">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              <span>Prompt Shield</span>
            </Button>
          </Link>
          <Link href="/admin/audits">
            <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <Activity className="h-3.5 w-3.5" />
              <span>EEOC 80% Auditor</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Level System Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">5 Engine Health</span>
              <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">100%</span>
              <span className="text-xs text-muted-foreground font-mono">Nominal</span>
            </div>
            <Progress value={100} variant="emerald" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Cloudflare Edge PoPs</span>
              <div className="h-7 w-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                <Globe className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground font-mono">275+</span>
              <span className="text-xs text-indigo-400 font-semibold font-mono">&lt; 1.0ms Edge</span>
            </div>
            <Progress value={100} variant="indigo" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">IRT Gatekeeper</span>
              <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Sliders className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono">Gated</span>
              <span className="text-xs text-slate-400 font-mono">N=26 / 200</span>
            </div>
            <Progress value={13} variant="amber" className="mt-3 h-1.5" />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-white/10 backdrop-blur-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">EEOC Disparate Impact</span>
              <div className="h-7 w-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-purple-400 font-mono">0.94</span>
              <span className="text-xs text-emerald-400 font-semibold font-mono">&gt; 0.80 PASS</span>
            </div>
            <Progress value={94} variant="purple" className="mt-3 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Cloudflare Edge Persistence & Storage Topology */}
      <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Database className="h-4 w-4 text-primary" />
                Cloudflare Edge Persistence Architecture (D1 / KV / R2)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Multi-tenant isolated data partitions, sliding window rate limits, and cryptographically signed blob storage
              </CardDescription>
            </div>
            <Badge variant="success" dot className="text-[10px] font-mono">Zero SPOF</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-white/5 bg-slate-950/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground font-mono">Cloudflare D1</span>
                <Badge variant="default" className="text-[9px] font-mono">SQL Engine</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Distributed SQLite with foreign key constraints, multi-tenant row isolation (`tenant_id`), and ACID transaction support.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                Status: Bound &amp; Replicating (3.2ms write)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-slate-950/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground font-mono">Cloudflare Workers KV</span>
                <Badge variant="secondary" className="text-[9px] font-mono bg-slate-900 border-white/10">Sliding Window</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Atomic token-bucket rate limiter (100 req/min per IP/token) and sub-millisecond cached candidate profile lookups.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                Status: Active (&lt; 1.0ms edge read)
              </div>
            </div>

            <div className="p-4 rounded-xl border border-white/5 bg-slate-950/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground font-mono">Cloudflare R2</span>
                <Badge variant="success" className="text-[9px] font-mono">Presigned S3</Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-egress binary storage for raw PDF/DOCX resumes. Client uploads directly via HMAC SHA-256 presigned URLs.
              </p>
              <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-emerald-400">
                Status: Secured with KMS Encryption
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Governance & Module Admin Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/telemetry">
          <Card className="hover:border-primary/60 transition-all p-5 h-full bg-slate-900/70 border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-lg">
            <div>
              <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-3.5 border border-primary/20">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Psychometrics &amp; Telemetry</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Review item-level latency logs, CTT p-value difficulty, and IRT 2PL sample calibration gates.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-4">
              <span>Inspect Telemetry</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/audits">
          <Card className="hover:border-emerald-500/60 transition-all p-5 h-full bg-slate-900/70 border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-lg">
            <div>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3.5 border border-emerald-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">EEOC Disparate Impact Auditor</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Verify Uniform Guidelines 80% Rule across protected demographic classes and export NYC LL144 audit certs.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-4">
              <span>Run Compliance Audit</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Card>
        </Link>

        <Link href="/admin/security">
          <Card className="hover:border-purple-500/60 transition-all p-5 h-full bg-slate-900/70 border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-lg">
            <div>
              <div className="h-9 w-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3.5 border border-purple-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Prompt Shield &amp; Threat Defense</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Live interactive attack simulator testing instruction overrides, ChatML delimiters, and XML exfiltration.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-semibold mt-4">
              <span>Open Threat Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
