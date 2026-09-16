"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  ShieldAlert,
  Binary,
  Layers,
  Search,
  Code
} from "lucide-react";

export default function ResumeIngestPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseResult, setParseResult] = useState<any>({
    magicBytes: "%PDF-1.7 (0x25 0x50 0x44 0x46 0x2D 0x31 0x2E 0x37)",
    mimeType: "application/pdf",
    fileName: "Vishnu_Sharma_Principal_AI_Architect.pdf",
    fileSize: "142.8 KB",
    blockCount: 14,
    confidence: 0.985,
    skillsDetected: [
      { skill: "Python", category: "Languages", span: [480, 486], confidence: 0.99 },
      { skill: "Go", category: "Languages", span: [488, 490], confidence: 0.98 },
      { skill: "TypeScript", category: "Languages", span: [492, 502], confidence: 0.97 },
      { skill: "PyTorch", category: "AI / ML", span: [518, 525], confidence: 0.99 },
      { skill: "Qdrant", category: "AI / ML", span: [541, 547], confidence: 0.96 },
      { skill: "TreeSHAP", category: "AI / ML", span: [557, 565], confidence: 0.99 },
      { skill: "Docker", category: "Infrastructure", span: [620, 626], confidence: 0.95 },
      { skill: "Cloudflare D1/KV/R2", category: "Infrastructure", span: [640, 658], confidence: 0.94 },
      { skill: "FastAPI", category: "Frameworks", span: [210, 217], confidence: 0.98 },
      { skill: "Reciprocal Rank Fusion", category: "Algorithms", span: [380, 408], confidence: 0.96 },
    ],
    experienceTotalYears: 10.0,
    educationDegree: "Master of Science in Artificial Intelligence (CMU)",
    promptInjectionRisk: "0.00% (Clean Zero-Threat)",
  });
  const [magicByteStatus, setMagicByteStatus] = useState<"verified" | "invalid" | null>("verified");
  const [securityScan, setSecurityScan] = useState<"passed" | "flagged" | null>("passed");

  const sampleResumeText = `VISHNU SHARMA
Principal AI & Distributed Systems Architect
Email: vishnu@demo.intellihire.ai | Location: San Francisco, CA | Phone: +1 (555) 019-2834

SUMMARY
Principal AI Systems Architect with 10+ years of experience designing enterprise-scale distributed inference pipelines, vector databases (Qdrant, Milvus), high-throughput FastAPI/Go microservices, and fair algorithmic candidate evaluation systems. Deep expertise in PyTorch, TreeSHAP explainability, and EEOC algorithmic fairness compliance.

WORK EXPERIENCE
Principal AI Platform Engineer — Anthropic / Scale AI (2021 - Present)
• Architected isolated multi-tenant execution sandboxes processing 500k+ candidate code executions/day with sub-100ms cold starts.
• Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60), improving ATS recall by 34%.
• Authored automated TreeSHAP surrogate feature attribution engines and EEOC 80% Four-Fifths rule fairness auditing pipelines.

Lead Machine Learning Engineer — Uber Technologies (2018 - 2021)
• Built real-time matching engine using Go, Python, and Kafka handling 80,000 queries per second.
• Reduced inference latency by 42% through quantization, ONNX Runtime, and TensorRT compilation.

SKILLS
Languages: Python, Go, TypeScript, C++, Rust, SQL
AI / ML: PyTorch, Hugging Face, Qdrant, Milvus, TreeSHAP, Fairlearn, spaCy, Scikit-learn
Infrastructure: Docker, Kubernetes, Cloudflare D1/KV/R2, AWS, Redis, Kafka, CI/CD, Terraform

EDUCATION
Master of Science in Artificial Intelligence — Carnegie Mellon University (CMU), 2018
Bachelor of Technology in Computer Science — Indian Institute of Technology (IIT), 2016`;

  const handleSimulatedUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setMagicByteStatus("verified");
      setSecurityScan("passed");
      setIsProcessing(false);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">Module 1</Badge>
            <Badge variant="success" dot className="text-xs font-mono">%PDF- Validated</Badge>
            <Badge variant="purple" className="text-xs font-mono">Layout AST Active</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            Document Ingestion &amp; Layout Parser
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Binary magic-byte verification, layout-preserving linearization, prompt injection defense, and canonical skill taxonomy mapping.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <span>View Extracted Profile</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload Dropzone & Engine Checks (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold text-foreground">Ingest Candidate Document</CardTitle>
              <CardDescription className="text-xs">
                Accepts PDF, DOCX up to 15MB. Verified by Cloudflare R2 presigned storage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div
                onClick={handleSimulatedUpload}
                className="border-2 border-dashed border-white/15 hover:border-primary/60 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-6 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-3"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/15 group-hover:bg-primary/25 text-primary flex items-center justify-center transition-all group-hover:scale-105">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">Click to upload or drag &amp; drop</p>
                  <p className="text-[11px] text-muted-foreground font-mono">PDF (%PDF-) or Word (PK\x03\x04)</p>
                </div>
                <Badge variant="secondary" className="text-[9px] font-mono">1-Click Live Simulation</Badge>
              </div>

              <Button
                onClick={handleSimulatedUpload}
                disabled={isProcessing}
                variant="gradient"
                className="w-full gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Parsing Magic Bytes &amp; Layout AST...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Re-parse Verified Resume</span>
                  </>
                )}
              </Button>

              {/* Pre-Flight Checks */}
              <div className="rounded-xl border border-white/5 p-4 bg-slate-950/80 space-y-2.5 text-xs font-mono">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-sans">
                    <Binary className="h-3.5 w-3.5 text-primary" />
                    Binary Pre-Flight Checks
                  </span>
                  <Badge variant="success" className="text-[9px] py-0">Strict Mode</Badge>
                </div>
                <div className="flex items-center justify-between text-muted-foreground pt-1">
                  <span>Magic Byte Header:</span>
                  <span className="text-emerald-400 font-bold">
                    ✓ %PDF-1.7 (0x25 0x50 0x44 0x46)
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>ChatML Prompt Shield:</span>
                  <span className="text-emerald-400 font-bold">
                    ✓ Clean (0 Injection Overrides)
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Layout Block Linearization:</span>
                  <span className="text-indigo-400 font-bold">
                    14 AST Blocks Detected
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Structuring Latency:</span>
                  <span className="text-emerald-400 font-bold">
                    &lt; 0.12ms (Zero Cold-Start)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Shield Advisory Alert */}
          <Alert variant="info" className="bg-sky-500/10 border-sky-500/30">
            <ShieldAlert className="h-4 w-4 text-sky-400" />
            <AlertTitle className="text-xs font-bold text-sky-300">Prompt Shield Active</AlertTitle>
            <AlertDescription className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Resume input is sanitized against invisible white-on-white text, font spoofing, ChatML tokens (<code className="text-foreground font-mono">&lt;|im_start|&gt;</code>), and XML delimiter injection before dense vector embedding.
            </AlertDescription>
          </Alert>
        </div>

        {/* Right Column: Extracted Text & Provenance Spans (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <FileCheck2 className="h-4 w-4 text-emerald-400" />
                    Layout-Aware Linearized AST
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Preserves bounding-box coordinates, reading order, and character offsets
                  </CardDescription>
                </div>
                <Badge variant="success" className="text-xs font-mono">
                  Confidence: 98.5%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-[11px] text-slate-300 leading-relaxed h-[340px] overflow-y-auto whitespace-pre-wrap selection:bg-primary/40">
                {sampleResumeText}
              </div>

              {parseResult && (
                <div className="space-y-4 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Extracted Canonical Skills ({parseResult.skillsDetected.length})
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">
                      Provenanced in Text
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {parseResult.skillsDetected.map((s: any, idx: number) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-[11px] py-1 px-2.5 font-mono flex items-center gap-1.5 border border-white/10 bg-slate-950"
                      >
                        <span className="text-white font-medium">{s.skill}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {(s.confidence * 100).toFixed(0)}%
                        </span>
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-0.5">
                      <span className="text-slate-400 text-[11px]">Verified Experience Duration:</span>
                      <p className="text-xs font-bold text-foreground font-mono">
                        {parseResult.experienceTotalYears} Years (Senior / Lead Tier)
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs space-y-0.5">
                      <span className="text-slate-400 text-[11px]">Highest Verified Degree:</span>
                      <p className="text-xs font-bold text-foreground font-mono">
                        MS AI (Carnegie Mellon Univ)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Link href="/profile">
                      <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
                        <span>Inspect Character-Level Provenance</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
