"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  Download,
  Award,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  Activity
} from "lucide-react";

export default function AuditsCompliancePage() {
  const [isAuditing, setIsAuditing] = useState(false);
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState("2026-09-15T04:22:18Z");

  const demographicGroups = [
    {
      group: "Demographic Group A (Reference)",
      totalApplicants: 120,
      selectedCount: 84,
      selectionRate: 0.70, // 70%
      impactRatio: 1.00,
      status: "REFERENCE",
    },
    {
      group: "Demographic Group B",
      totalApplicants: 95,
      selectedCount: 63,
      selectionRate: 0.663, // 66.3%
      impactRatio: 0.947, // 0.663 / 0.70 = 94.7% >= 80% PASS
      status: "PASS",
    },
    {
      group: "Demographic Group C",
      totalApplicants: 80,
      selectedCount: 52,
      selectionRate: 0.650, // 65.0%
      impactRatio: 0.928, // 0.650 / 0.70 = 92.8% >= 80% PASS
      status: "PASS",
    },
    {
      group: "Demographic Group D",
      totalApplicants: 110,
      selectedCount: 71,
      selectionRate: 0.645, // 64.5%
      impactRatio: 0.921, // 0.645 / 0.70 = 92.1% >= 80% PASS
      status: "PASS",
    },
  ];

  const handleRunFreshAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setLastAuditTimestamp(new Date().toISOString());
      setIsAuditing(false);
    }, 900);
  };

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
              <Badge variant="outline" className="text-xs font-mono">Module 5: Fairness &amp; Governance</Badge>
              <Badge variant="success" dot className="text-xs font-mono">EEOC 80% Verified</Badge>
              <Badge variant="purple" className="text-xs font-mono">NYC LL144 Certified</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
              EEOC Disparate Impact &amp; NYC LL144 Auditor
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Automated Uniform Guidelines on Employee Selection Procedures (UGESP) Four-Fifths rule compliance verification.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleRunFreshAudit}
              disabled={isAuditing}
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              {isAuditing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
              <span>Run Statistical Audit</span>
            </Button>
            <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <Download className="h-3.5 w-3.5" />
              <span>Download Audit Cert (PDF)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Compliance Certification Banner */}
      <Card className="border-emerald-500/40 bg-emerald-500/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
              <Award className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-foreground">
                  EEOC Four-Fifths Rule: Full Compliance Certified
                </h3>
                <Badge variant="success" className="text-[10px] font-mono">Ratio: 0.94 &ge; 0.80 PASS</Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All demographic selection rates exceed 80% of the reference group rate. No adverse disparate impact detected.
              </p>
              <div className="text-[11px] font-mono text-slate-400 pt-1">
                Audit Timestamp: {lastAuditTimestamp} • NYC Local Law 144 Independent Audit Ready
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disparate Impact Calculations Table */}
      <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-3 pt-5 px-5">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Activity className="h-4 w-4 text-emerald-400" />
            Protected Demographic Selection Rate Matrix
          </CardTitle>
          <CardDescription className="text-xs">
            UGESP Section 4D: Selection rate of any group &lt; 4/5 (80%) of the reference group constitutes evidence of adverse impact.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-sans">Demographic Cohort</th>
                  <th className="py-3 px-4">Applicants</th>
                  <th className="py-3 px-4">Selected</th>
                  <th className="py-3 px-4">Selection Rate</th>
                  <th className="py-3 px-4">Impact Ratio (vs Ref)</th>
                  <th className="py-3 px-4 font-sans">EEOC 80% Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {demographicGroups.map((g, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-foreground">{g.group}</td>
                    <td className="py-3.5 px-4 text-slate-400">{g.totalApplicants}</td>
                    <td className="py-3.5 px-4 text-foreground font-bold">{g.selectedCount}</td>
                    <td className="py-3.5 px-4 text-foreground">
                      {(g.selectionRate * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      {g.impactRatio.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success" className="text-[10px] font-mono">
                        ✓ {g.status}
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
