"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Code2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Check
} from "lucide-react";

export default function ProfilePage() {
  const [selectedSkill, setSelectedSkill] = useState<any>({
    name: "Python",
    category: "Languages",
    confidence: 0.99,
    span: "[480-486]",
    occurrences: 4,
    excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL",
  });

  const skills = [
    { name: "Python", category: "Languages", confidence: 0.99, span: "[480-486]", occurrences: 4, excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
    { name: "Go", category: "Languages", confidence: 0.98, span: "[488-490]", occurrences: 2, excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
    { name: "TypeScript", category: "Languages", confidence: 0.97, span: "[492-502]", occurrences: 3, excerpt: "Languages: Python, Go, TypeScript, C++, Rust, SQL" },
    { name: "PyTorch", category: "AI & ML", confidence: 0.99, span: "[518-525]", occurrences: 3, excerpt: "AI / ML: PyTorch, Hugging Face, Qdrant, Milvus, TreeSHAP, Fairlearn" },
    { name: "Qdrant", category: "AI & ML", confidence: 0.96, span: "[541-547]", occurrences: 2, excerpt: "AI / ML: PyTorch, Hugging Face, Qdrant, Milvus, TreeSHAP, Fairlearn" },
    { name: "TreeSHAP", category: "AI & ML", confidence: 0.99, span: "[557-565]", occurrences: 3, excerpt: "Authored automated TreeSHAP surrogate feature attribution engines" },
    { name: "Fairlearn", category: "AI & ML", confidence: 0.95, span: "[567-576]", occurrences: 2, excerpt: "EEOC 80% Four-Fifths rule fairness auditing pipelines." },
    { name: "Docker", category: "Infrastructure", confidence: 0.95, span: "[620-626]", occurrences: 2, excerpt: "Infrastructure: Docker, Kubernetes, Cloudflare D1/KV/R2, AWS, Redis" },
    { name: "Cloudflare D1/KV/R2", category: "Infrastructure", confidence: 0.94, span: "[640-658]", occurrences: 1, excerpt: "Infrastructure: Docker, Kubernetes, Cloudflare D1/KV/R2, AWS, Redis" },
    { name: "FastAPI", category: "Frameworks", confidence: 0.98, span: "[210-217]", occurrences: 2, excerpt: "high-throughput FastAPI/Go microservices" },
    { name: "Reciprocal Rank Fusion", category: "Algorithms", confidence: 0.96, span: "[380-408]", occurrences: 2, excerpt: "Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60)" },
    { name: "Classical Test Theory", category: "Psychometrics", confidence: 0.93, span: "[180-210]", occurrences: 1, excerpt: "Item response telemetry and psychometric testing pipelines" },
  ];

  const experience = [
    {
      role: "Principal AI Platform Engineer",
      company: "Anthropic / Scale AI",
      period: "2021 — Present (3.8 yrs)",
      highlights: [
        "Architected isolated multi-tenant execution sandboxes processing 500k+ candidate code executions/day with sub-100ms cold starts.",
        "Deployed hybrid vector search (Dense 384-d embeddings + Okapi BM25 with Reciprocal Rank Fusion k=60), improving ATS recall by 34%.",
        "Authored automated TreeSHAP surrogate feature attribution engines and EEOC 80% Four-Fifths rule fairness auditing pipelines."
      ],
      verified: true
    },
    {
      role: "Lead Machine Learning Engineer",
      company: "Uber Technologies",
      period: "2018 — 2021 (3.2 yrs)",
      highlights: [
        "Built real-time matching engine using Go, Python, and Kafka handling 80,000 queries per second.",
        "Reduced inference latency by 42% through quantization, ONNX Runtime, and TensorRT compilation."
      ],
      verified: true
    },
    {
      role: "Senior Software Engineer (Distributed Systems)",
      company: "Amazon Web Services (AWS)",
      period: "2016 — 2018 (2.0 yrs)",
      highlights: [
        "Designed high-throughput DynamoDB ingestion and Kinesis streams for real-time telemetry processing.",
      ],
      verified: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">Module 1</Badge>
            <Badge variant="success" dot className="text-xs font-mono">Taxonomy Audited</Badge>
            <Badge variant="purple" className="text-xs font-mono">Provenance Verified</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            Structured Candidate Dossier &amp; Provenance
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Canonical 27+ skill taxonomy mapping with character-level resume source spans and seniority calibration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/match">
            <Button size="sm" variant="gradient" className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20">
              <span>Execute Hybrid ATS Match</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-indigo-500/25">
                VS
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">Vishnu Sharma</h2>
                  <Badge variant="default" className="text-[10px] font-mono">LEAD / ARCHITECT</Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                  Principal AI &amp; Distributed Systems Architect
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Mail className="h-3.5 w-3.5 text-primary" /> vishnu@demo.intellihire.ai
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> San Francisco, CA
                  </span>
                  <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold text-[11px]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 10.0 Yrs Calibrated Exp
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 self-stretch sm:self-center justify-center p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-right font-mono">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Seniority Calibration</span>
              <span className="text-2xl font-black text-primary">0.96 / 1.0</span>
              <span className="text-[10px] text-emerald-400 font-bold">100% Provenance Coverage</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Taxonomy & Provenance Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Skills Badges List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Extracted Canonical Skills ({skills.length})</CardTitle>
                  <CardDescription className="text-xs">Click any skill to inspect character-level text provenance</CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px] font-mono">27+ Taxonomy</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {skills.map((s, idx) => {
                  const isSelected = selectedSkill?.name === s.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedSkill(s)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/20 shadow-md shadow-indigo-500/10"
                          : "border-white/5 bg-slate-950/60 hover:border-primary/40 hover:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground truncate">{s.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {(s.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 truncate font-mono">{s.category}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Experience Timeline */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Briefcase className="h-4 w-4 text-primary" />
                Verified Employment History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-5 pb-5">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-white/10 space-y-2 group">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-900 border-2 border-primary group-hover:bg-primary transition-colors" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="text-xs font-bold text-foreground">{exp.role}</h3>
                    <Badge variant="secondary" className="text-[10px] font-mono w-fit">{exp.period}</Badge>
                  </div>
                  <p className="text-xs font-bold text-primary">{exp.company}</p>
                  <ul className="space-y-1.5 pt-1 text-[11px] text-muted-foreground list-disc list-inside">
                    {exp.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="leading-relaxed">{h}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Provenance Span & Education (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Provenance Inspector Card */}
          <Card className="border-primary/40 bg-slate-900/80 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                <Search className="h-4 w-4" />
                Character-Level Provenance Inspector
              </CardTitle>
              <CardDescription className="text-xs">
                Auditing proof for skill: <strong className="text-foreground">{selectedSkill?.name}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Taxonomy Category:</span>
                  <span className="font-bold text-foreground font-sans">{selectedSkill?.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Extraction Confidence:</span>
                  <span className="font-bold text-emerald-400">
                    {(selectedSkill?.confidence * 100).toFixed(1)}% (Validated)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Byte Range Span:</span>
                  <span className="text-primary font-bold">{selectedSkill?.span}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Document Matches:</span>
                  <span className="text-foreground font-bold">{selectedSkill?.occurrences} occurrences</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Exact Resume Text Provenance Excerpt
                </span>
                <p className="text-xs font-mono text-emerald-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-emerald-500/20">
                  &quot;{selectedSkill?.excerpt}&quot;
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Zero Hallucination Guarantee: Directly grounded in source AST tokens.</span>
              </div>
            </CardContent>
          </Card>

          {/* Education & Credentials */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <GraduationCap className="h-4 w-4 text-indigo-400" />
                Education &amp; Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5 pb-5 text-xs">
              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/60 space-y-1">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Carnegie Mellon University (CMU)</span>
                  <Badge variant="outline" className="text-[10px] font-mono">2018</Badge>
                </div>
                <p className="text-slate-300">Master of Science in Artificial Intelligence</p>
                <span className="text-[10px] text-indigo-400 font-mono block">Specialization: Distributed ML &amp; Fair Systems</span>
              </div>

              <div className="p-3.5 rounded-xl border border-white/5 bg-slate-950/60 space-y-1">
                <div className="flex justify-between font-bold text-foreground">
                  <span>Indian Institute of Technology (IIT)</span>
                  <Badge variant="outline" className="text-[10px] font-mono">2016</Badge>
                </div>
                <p className="text-slate-300">Bachelor of Technology in Computer Science</p>
                <span className="text-[10px] text-indigo-400 font-mono block">Graduated with Institute Honors</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
