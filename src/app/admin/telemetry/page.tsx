"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Sliders,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
  ArrowLeft
} from "lucide-react";

export default function AdminTelemetryPage() {
  const telemetryItems = [
    {
      id: "item_kadane_01",
      topic: "Dynamic Programming & Kadane Algorithm",
      attempts: 26,
      correctCount: 21,
      cttPValue: 0.81,
      avgLatencyMs: 1420,
      irtStatus: "GATED (N < 200)",
      targetGate: 200,
    },
    {
      id: "item_vector_rrf_02",
      topic: "Hybrid Vector Search (RRF k=60)",
      attempts: 41,
      correctCount: 33,
      cttPValue: 0.80,
      avgLatencyMs: 1850,
      irtStatus: "GATED (N < 200)",
      targetGate: 200,
    },
    {
      id: "item_shap_fairness_03",
      topic: "TreeSHAP & EEOC 80% Rule",
      attempts: 58,
      correctCount: 44,
      cttPValue: 0.76,
      avgLatencyMs: 2100,
      irtStatus: "GATED (N < 200)",
      targetGate: 200,
    },
    {
      id: "item_sandbox_subproc_04",
      topic: "Isolated Subprocess Sandbox Constraints",
      attempts: 19,
      correctCount: 16,
      cttPValue: 0.84,
      avgLatencyMs: 1180,
      irtStatus: "GATED (N < 200)",
      targetGate: 200,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Admin Center</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono">Module 2: Psychometrics &amp; Telemetry</Badge>
              <Badge variant="warning" dot className="text-xs font-mono">IRT Threshold Gate Active</Badge>
              <Badge variant="purple" className="text-xs font-mono">N=200 Calibration</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
              Item Response Telemetry &amp; IRT Calibration Gatekeeper
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Monitoring item difficulty (CTT p-values), response latency distributions, and strict 200-sample calibration gating.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/admin/audits">
              <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
                <span>EEOC 80% Audit View</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* IRT Gatekeeper Policy Notice */}
      <Alert variant="warning" className="border-amber-500/30 bg-amber-500/10 backdrop-blur-md">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <AlertTitle className="text-xs font-bold text-amber-300">
          Strict Regulatory Rule: Sample Size &ge; 200 Before IRT Parameter Estimation
        </AlertTitle>
        <AlertDescription className="text-xs text-slate-300 mt-1 leading-relaxed">
          Standard Item Response Theory (2PL/3PL) item discrimination parameter fitting without at least 200 empirical observations introduces high standard error drift. IntelliHire enforces Classical Test Theory (CTT) difficulty bounds until the calibration threshold is satisfied.
        </AlertDescription>
      </Alert>

      {/* Items Telemetry Table */}
      <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Active Psychometric Assessment Items
          </CardTitle>
          <CardDescription className="text-xs">
            Real-time telemetry feeds logged across candidate evaluations
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Item Identifier</th>
                  <th className="py-3 px-4">Topic / Construct</th>
                  <th className="py-3 px-4">Sample Pool</th>
                  <th className="py-3 px-4">CTT Difficulty (p-value)</th>
                  <th className="py-3 px-4">Avg Latency</th>
                  <th className="py-3 px-4">IRT 2PL Gate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {telemetryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-foreground">{item.id}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans font-medium">{item.topic}</td>
                    <td className="py-3.5 px-4 text-foreground font-bold">
                      {item.attempts} / {item.targetGate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-emerald-400 font-bold">{item.cttPValue.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 ml-1 font-sans">(Standard)</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {(item.avgLatencyMs / 1000).toFixed(2)}s
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="warning" className="text-[10px] font-mono">
                        {item.irtStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
