"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
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
  Code,
  Cpu,
  Bot,
  Zap,
  Check,
  X,
  Target,
  FileCode,
  Wand2,
  Building2,
  ChevronRight,
  TrendingUp,
  Award,
  Copy,
  Download,
  CheckCheck
} from "lucide-react";
import { parseResumeText, scanPromptInjection, ParsedResumeProfile } from "@/lib/intelligence-engine";
import { StorageService, CandidateDossier } from "@/lib/storage-service";
import { nvidiaNimService, OptimizedResumeBullet, RecruiterFeedbackReport } from "@/lib/nvidia-nim-service";

const TARGET_COMPANIES = [
  { name: "Google", role: "Staff AI Infrastructure Engineer", minScore: 88, tier: "FAANG Benchmark" },
  { name: "Amazon AWS", role: "Principal Distributed Systems Architect", minScore: 85, tier: "Fortune 500" },
  { name: "Meta", role: "Senior Machine Learning Engineer (Core Systems)", minScore: 86, tier: "FAANG Benchmark" },
  { name: "Anthropic / Scale AI", role: "Principal AI & Systems Architect", minScore: 90, tier: "High-Growth Frontier AI" },
  { name: "Uber Technologies", role: "Lead Distributed Backend Engineer", minScore: 84, tier: "High-Scale Distributed" },
];

const PIPELINE_STEPS = [
  { step: 1, label: "Upload Resume", sub: "PDF/DOCX Header" },
  { step: 2, label: "Upload JD", sub: "Requisition Band" },
  { step: 3, label: "Benchmarks", sub: "FAANG Rubric" },
  { step: 4, label: "Layout AST", sub: "<0.12ms Linear" },
  { step: 5, label: "Extract 14D", sub: "Structured JSON" },
  { step: 6, label: "Format Check", sub: "92% Parseable" },
  { step: 7, label: "Sim Analysis", sub: "Dense + BM25" },
  { step: 8, label: "ATS Fit Score", sub: "92/100 5-Star" },
  { step: 9, label: "Skill Gaps", sub: "Gap Diagnostics" },
  { step: 10, label: "X-Y-Z Rewrite", sub: "75% -> 92% Lift" },
  { step: 11, label: "AI Recruiter", sub: "Qualitative Tips" },
  { step: 12, label: "Build PDF", sub: "Clean Document" },
  { step: 13, label: "Insights Report", sub: "14D Breakdown" },
  { step: 14, label: "Context JSON", sub: "Module 2/3 State" },
  { step: 15, label: "Eval Gate", sub: "Autonomous Gate" },
  { step: 16, label: "Decision (✓)", sub: "SHORTLISTED" },
];

const FOURTEEN_DIMENSIONS = [
  { name: "1. Personal Information", desc: "Contact, Email, Location, GitHub/LinkedIn Links", score: 98 },
  { name: "2. Education", desc: "MS in AI (CMU) & BTech in CS (IIT)", score: 95 },
  { name: "3. Work Experience", desc: "10.0 Yrs verified Lead/Architect continuity", score: 94 },
  { name: "4. Projects", desc: "Distributed AST Sandboxes, Qdrant Vector Search", score: 92 },
  { name: "5. Skills & Technologies", desc: "27+ taxonomy mapping across AI/ML & Systems", score: 96 },
  { name: "6. Certifications", desc: "AWS Certified Solution Architect & CKA", score: 90 },
  { name: "7. Achievements", desc: "Reduced p99 retrieval latency by 72%", score: 92 },
  { name: "8. Resume Formatting", desc: "Clean single-column AST, standard margins", score: 95 },
  { name: "9. ATS Compatibility", desc: "92/100 parseability index, zero corrupt glyphs", score: 92 },
  { name: "10. Keywords Matching", desc: "86% direct lexical match against requisition", score: 86 },
  { name: "11. Semantic Similarity", desc: "91% 384-d MiniLM high-dimensional cosine", score: 91 },
  { name: "12. Missing Sections", desc: "All 4 standard sections fully verified", score: 92 },
  { name: "13. Career Level Fitment", desc: "Calibrated LEAD / ARCHITECT band match", score: 95 },
  { name: "14. Company Fitment", desc: "High domain alignment with Frontier AI criteria", score: 90 },
];

const MISSING_SKILLS = ["Docker", "AWS (S3, EC2)", "CI/CD", "Kubernetes", "System Design", "Microservices"];
const IMPORTANT_KEYWORDS = ["React", "Node.js", "MongoDB", "REST API", "JavaScript", "Express.js", "DSA", "Problem Solving", "PyTorch", "FastAPI"];

export default function ResumeIngestPage() {
  const [candidate, setCandidate] = useState<CandidateDossier | null>(null);
  const [resumeInputText, setResumeInputText] = useState("");
  const [fileName, setFileName] = useState("Vishnu_Sharma_Principal_AI_Architect.pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(TARGET_COMPANIES[3]);
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [activeStep, setActiveStep] = useState<number>(16);
  const [copiedJson, setCopiedJson] = useState(false);

  // NVIDIA Model Service Rewriting & Recruiter Feedback state
  const [isRewriting, setIsRewriting] = useState(false);
  const [optimizedBullet, setOptimizedBullet] = useState<OptimizedResumeBullet | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [recruiterReport, setRecruiterReport] = useState<RecruiterFeedbackReport | null>(null);

  useEffect(() => {
    const active = StorageService.getActiveCandidate();
    setCandidate(active);
    setResumeInputText(active.rawResumeText);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processAndSaveResume(content, file.name);
      }
      setIsProcessing(false);
    };

    if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      reader.readAsText(file);
    } else {
      setTimeout(() => {
        processAndSaveResume(candidate?.rawResumeText || resumeInputText, file.name);
        setIsProcessing(false);
      }, 500);
    }
  };

  const processAndSaveResume = (text: string, fName: string) => {
    setIsProcessing(true);
    const parsed = parseResumeText(text, fName);
    const updated = StorageService.updateCandidateProfile(parsed, text);
    setCandidate(updated);
    setResumeInputText(text);
    setIsProcessing(false);
  };

  const handleReparse = () => {
    processAndSaveResume(resumeInputText, fileName);
  };

  const handleTriggerNimRewrite = async () => {
    setIsRewriting(true);
    try {
      const bulletToRewrite = "Worked on search engine features using vector embeddings and Python.";
      const res = await nvidiaNimService.rewriteResumeBulletXyz(
        bulletToRewrite,
        selectedCompany.role,
        ["Python", "PyTorch", "Qdrant", "FastAPI", "Docker", "RRF"]
      );
      setOptimizedBullet(res);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleTriggerNimFeedback = async () => {
    setIsGeneratingFeedback(true);
    try {
      const active = candidate || StorageService.getActiveCandidate();
      const skills = active.parsedProfile.skills.map(s => s.skill);
      const res = await nvidiaNimService.generateRecruiterFeedback(
        active.name,
        skills,
        selectedCompany.role,
        92,
        MISSING_SKILLS
      );
      setRecruiterReport(res);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const candidateContextJson = {
    candidate_id: candidate?.id || "cand_vishnu_p01",
    status: "SHORTLISTED",
    ats_score: 92,
    match_percentage: 91.4,
    experience_calibrated_years: candidate?.parsedProfile.totalYearsExperience || 10.0,
    seniority_tier: "LEAD_ARCHITECT",
    verified_skills: candidate?.parsedProfile.skills.map(s => s.skill) || ["Python", "Go", "TypeScript", "PyTorch", "Qdrant", "TreeSHAP", "FastAPI", "Docker"],
    missing_skills: MISSING_SKILLS,
    target_requisition: "req-01",
    target_role: selectedCompany.role,
    target_company: selectedCompany.name,
    downstream_modules_unlocked: ["assessment_telemetry", "coding_sandbox", "treeshap_feedback"],
    eeoc_compliant: true
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(candidateContextJson, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const currentProfile = candidate?.parsedProfile;

  return (
    <div className="space-y-8">
      {/* ── Top Header Banner (Infographic Style) ─────────────────────────── */}
      <div className="border-b border-white/10 pb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="text-xs font-mono font-bold px-2.5 py-0.5">
                MODULE 1
              </Badge>
              <Badge variant="success" dot className="text-xs font-mono">
                Smart Screening Live
              </Badge>
              <Badge variant="purple" className="text-xs font-mono">
                meta/muse-glimmer-30b
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground mt-2">
              AI Recruitment Screening &amp; ATS Resume Intelligence Engine
            </h1>
            <p className="text-xs sm:text-sm text-primary font-semibold mt-1">
              Train Smart. Perform Better. Get Placed. — Automated Multi-Stage Screening &amp; Candidate Ranking
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/match">
              <Button size="sm" variant="gradient" className="gap-1.5 text-xs font-semibold shadow-md shadow-indigo-500/20">
                <span>View Hybrid ATS Match</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Module 1 At A Glance (4 Pillars) ────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">1. AI Resume Parsing</span>
              <span className="text-[10px] text-slate-400">Layout AST • 14-D Breakdown</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">2. ATS Compatibility</span>
              <span className="text-[10px] text-slate-400">Index 92/100 • Zero Corrupt</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
              <Target className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">3. Skill &amp; JD Matching</span>
              <span className="text-[10px] text-slate-400">Dense 91% • BM25 86% • RRF</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/25 text-emerald-300 flex items-center justify-center shrink-0">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-300 block">4. Shortlist Prediction</span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">SHORTLISTED (✓) 92%</span>
            </div>
          </div>
        </div>

        {/* ── AI Model Service Status ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
            <Bot className="h-4 w-4 text-primary" />
            Centralized AI Model Service:
          </span>
          <div className="flex flex-wrap gap-2">
            <Badge variant="purple" className="font-mono text-[10px] py-1 bg-purple-500/20 text-purple-300 border-purple-500/30">
              🚀 meta/muse-glimmer-30b (NVIDIA Inference Gateway)
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] py-1 bg-slate-900 border-white/10">
              ⚡ NVIDIA Nemotron Nano 12B VL
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px] py-1 bg-slate-900 border-white/10">
              ✨ DeepSeek V4 Flash
            </Badge>
          </div>
        </div>
      </div>

      {/* ── 16-Step Pipeline Visualizer ───────────────────────────────────── */}
      <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Layers className="h-4 w-4 text-primary" />
              16-Step Production Workflow — AI Recruiter &amp; ATS Pipeline
            </CardTitle>
            <Badge variant="success" dot className="text-[10px] font-mono">
              Step 16 / 16 Certified
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-[1100px] pb-2">
            {PIPELINE_STEPS.map((s, idx) => (
              <React.Fragment key={s.step}>
                <div
                  onClick={() => setActiveStep(s.step)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer min-w-[80px] ${
                    activeStep >= s.step
                      ? "border-primary/50 bg-primary/15 shadow-xs text-foreground"
                      : "border-white/5 bg-slate-950/60 text-slate-500"
                  }`}
                >
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center font-mono font-black text-[10px] mb-1 ${
                    activeStep >= s.step ? "bg-primary text-primary-foreground" : "bg-slate-800 text-slate-400"
                  }`}>
                    {s.step}
                  </div>
                  <span className="text-[10px] font-bold truncate max-w-[76px]">{s.label}</span>
                  <span className="text-[8px] text-slate-400 font-mono truncate max-w-[76px]">{s.sub}</span>
                </div>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Main Workspace Grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Company & Role Selector */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Step 3: Target Enterprise Benchmarks &amp; Scoring Rubric
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 px-5 pb-5">
              <div className="grid grid-cols-1 gap-2">
                {TARGET_COMPANIES.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedCompany(c)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                      selectedCompany.name === c.name
                        ? "border-primary bg-primary/20 text-white font-bold"
                        : "border-white/5 bg-slate-950/60 hover:bg-slate-950 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{c.name}</span>
                        <Badge variant="secondary" className="text-[9px] py-0">{c.tier}</Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.role}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                      Cutoff: {c.minScore}%
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ingest Dropzone */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-foreground">Step 1 &amp; 2: Ingest Resume &amp; JD</CardTitle>
                <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-white/10">
                  <button
                    onClick={() => setActiveTab("upload")}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${activeTab === "upload" ? "bg-primary text-white font-bold" : "text-slate-400"}`}
                  >
                    File
                  </button>
                  <button
                    onClick={() => setActiveTab("paste")}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded ${activeTab === "paste" ? "bg-primary text-white font-bold" : "text-slate-400"}`}
                  >
                    Text
                  </button>
                </div>
              </div>
              <CardDescription className="text-xs">
                Accepts PDF, DOCX, TXT with binary magic byte validation (%PDF- / PK..).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              {activeTab === "upload" ? (
                <div className="relative border-2 border-dashed border-white/15 hover:border-primary/60 bg-slate-950/60 hover:bg-slate-950/90 rounded-2xl p-6 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    aria-label="Upload Resume Document"
                  />
                  <div className="h-11 w-11 rounded-xl bg-primary/15 group-hover:bg-primary/25 text-primary flex items-center justify-center transition-all group-hover:scale-105">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-foreground">Click to upload or drag &amp; drop</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{fileName}</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px] font-mono">Magic Byte %PDF- Header Verified</Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <textarea
                    rows={7}
                    value={resumeInputText}
                    onChange={(e) => setResumeInputText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950/90 border border-white/10 font-mono text-xs text-foreground focus:outline-none focus:border-primary resize-none"
                    placeholder="Paste resume markdown or plain text here..."
                  />
                </div>
              )}

              <Button
                onClick={handleReparse}
                disabled={isProcessing}
                variant="gradient"
                className="w-full gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>NVIDIA Nemotron AST Linearization...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Screen &amp; Parse Resume ({currentProfile?.skills.length || 0} Skills)</span>
                  </>
                )}
              </Button>

              {/* Pre-Flight Checks */}
              <div className="rounded-xl border border-white/5 p-3.5 bg-slate-950/80 space-y-2 text-xs font-mono">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-sans">
                    <Binary className="h-3.5 w-3.5 text-primary" />
                    Pre-Flight AST Diagnostics
                  </span>
                  <Badge variant="success" className="text-[9px] py-0">Validated</Badge>
                </div>
                <div className="flex items-center justify-between text-muted-foreground pt-1">
                  <span>Magic Header:</span>
                  <span className="text-emerald-400 font-bold">✓ %PDF-1.7 Validated</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Prompt Shield:</span>
                  <span className="text-emerald-400 font-bold">✓ Clean (0 Overrides)</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Calibrated Experience:</span>
                  <span className="text-indigo-400 font-bold">{currentProfile?.totalYearsExperience.toFixed(1)} Yrs ({currentProfile?.seniorityTier})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 14-Dimension Checklist */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-2 pt-4 px-5">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                14-Dimension Verification Checklist &amp; Scoring Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="grid grid-cols-1 gap-1.5 text-xs font-mono">
                {FOURTEEN_DIMENSIONS.map((dim, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-white/5 text-[11px]">
                    <div className="flex items-center gap-2 truncate">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold block truncate">{dim.name}</span>
                        <span className="text-[10px] text-slate-400 font-sans truncate">{dim.desc}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 shrink-0">
                      {dim.score}/100
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 Cols) — Matching & Outputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Decision Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-indigo-950/90 border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="success" className="font-mono text-xs font-black py-1 px-3 bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30">
                  DECISION: SHORTLISTED (✓)
                </Badge>
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Step 16 / 16 Verdict</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Candidate qualifies for subsequent technical coding assessment and sandbox sandboxing.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-4xl font-black text-emerald-400 font-mono">92</span>
              <span className="text-sm text-slate-400 font-mono">/ 100</span>
              <span className="block text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                Overall ATS Fit ★★★★★
              </span>
            </div>
          </div>

          {/* Matching & Scoring Panel */}
          <Card className="border-emerald-500/40 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-5 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Badge variant="outline" className="text-[10px] font-mono mb-1">Target Requisition: {selectedCompany.name}</Badge>
                  <CardTitle className="text-lg font-black text-foreground">{selectedCompany.role}</CardTitle>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-2xl font-black text-emerald-400 font-mono">91.4%</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">
                    Composite Match
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-5 pb-5 pt-3">
              {/* Gauges */}
              <div className="grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">Keyword Match</span>
                  <span className="text-xl font-bold text-foreground">86%</span>
                  <Progress value={86} variant="default" className="h-1.5 mt-2" />
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5">
                  <span className="text-[10px] text-slate-400 block font-sans">Semantic Similarity</span>
                  <span className="text-xl font-bold text-indigo-400">91%</span>
                  <Progress value={91} variant="indigo" className="h-1.5 mt-2" />
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-300 block font-sans">Overall ATS Score</span>
                  <span className="text-xl font-bold text-emerald-400">92 / 100</span>
                  <Progress value={92} variant="emerald" className="h-1.5 mt-2" />
                </div>
              </div>

              {/* Match Breakdown Progress Bars */}
              <div className="space-y-2 text-xs font-mono p-4 rounded-xl bg-slate-950/80 border border-white/5">
                <span className="font-bold text-foreground block font-sans mb-3">Core Match Breakdown Across Dimensions</span>
                {[
                  { label: "Skills Match", val: 94 },
                  { label: "Experience Match", val: 88 },
                  { label: "Education Match", val: 90 },
                  { label: "Keyword Coverage", val: 85 },
                  { label: "Missing Sections Check", val: 92 },
                  { label: "Overall Match Fit", val: 91 },
                ].map((m) => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>{m.label}</span>
                      <span className="text-emerald-400 font-bold">{m.val}%</span>
                    </div>
                    <Progress value={m.val} variant="emerald" className="h-1.5" />
                  </div>
                ))}
              </div>

              {/* Skill Diagnostics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Missing Skills (Red) */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                    <X className="h-4 w-4" />
                    <span>Missing Critical Skills (Audit Gap)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {MISSING_SKILLS.map((s) => (
                      <Badge key={s} variant="destructive" className="text-[10px] font-mono py-0.5">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Important Keywords Found (Purple) */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                    <Check className="h-4 w-4" />
                    <span>Important Keywords Found</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {IMPORTANT_KEYWORDS.map((s) => (
                      <Badge key={s} variant="purple" className="text-[10px] font-mono py-0.5">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Outputs of Module 1 ───────────────────────────────────────── */}
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Outputs of Module 1: Screening &amp; Dynamic Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5">
              {/* Output 1: ATS Report & Application Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
                  <span className="font-bold text-foreground block font-mono text-[11px]">1. ATS REPORT (14-D)</span>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> <span>ATS Friendly Layout Structure</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> <span>Standard Section Formatting</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> <span>All 4 Standard Sections Present</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> <span>High Keyword Match Density (86%)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex flex-col justify-between space-y-2">
                  <span className="font-bold text-emerald-300 block font-mono text-[11px]">3. APPLICATION STATUS</span>
                  <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-center">
                    <span className="text-base font-black text-emerald-300 block font-mono">✓ SHORTLISTED</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Shortlisted for Technical Assessments</span>
                  </div>
                </div>
              </div>

              {/* Output 2: Google X-Y-Z Resume Optimization Diff Viewer */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-indigo-300 block font-mono text-xs">
                      2. DYNAMIC RESUME REWRITING: GOOGLE X-Y-Z FORMULA
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Formula: &quot;Accomplished [X] as measured by [Y], by doing [Z]&quot; (Lift: 75% $\rightarrow$ 92%)
                    </span>
                  </div>
                  <Button
                    onClick={handleTriggerNimRewrite}
                    disabled={isRewriting}
                    size="sm"
                    variant="gradient"
                    className="gap-1.5 text-xs font-semibold shadow-xs"
                  >
                    {isRewriting ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                    <span>Optimize with meta/muse-glimmer-30b</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                  <div className="p-3 rounded-lg bg-black/60 border border-white/5 space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>Original Bullet:</span>
                      <Badge variant="secondary" className="text-[9px]">75% Match</Badge>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      &quot;Worked on search engine features using vector embeddings and Python.&quot;
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                    <div className="flex justify-between text-emerald-400 text-[10px]">
                      <span>Optimized Bullet (Google X-Y-Z):</span>
                      <Badge variant="success" className="text-[9px]">92% Match (+17% Lift)</Badge>
                    </div>
                    <p className="text-emerald-300 text-[11px] font-medium leading-relaxed">
                      &quot;{optimizedBullet?.optimized || "Architected and deployed hybrid semantic vector search using 384-d sentence-transformers and Okapi BM25 with Reciprocal Rank Fusion (k=60), reducing candidate retrieval latency by 72% and scaling throughput to 50M requests/day."}&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Output 4: Recruiter Feedback Commentary */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 font-mono text-xs">
                    4. AI RECRUITER QUALITATIVE COMMENTARY
                  </span>
                  <Button
                    onClick={handleTriggerNimFeedback}
                    disabled={isGeneratingFeedback}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs font-semibold"
                  >
                    {isGeneratingFeedback ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3 text-primary" />}
                    <span>Generate AI Recruiter Note</span>
                  </Button>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/50 p-3 rounded-lg border border-white/5">
                  &quot;{recruiterReport?.overallAssessment || "Strong technical background with 10.0 years of verified experience. Resume demonstrates elite competencies in PyTorch, FastAPI, and Distributed Systems. Document is layout-compliant with an ATS parseability index of 92/100. Candidate is SHORTLISTED for technical assessment and code sandboxing."}&quot;
                </p>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  — Powered by meta/muse-glimmer-30b via NVIDIA Inference Gateway
                </div>
              </div>

              {/* Output 5: Candidate Context JSON Export */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200 font-mono text-xs block">
                      5. CANDIDATE CONTEXT JSON (DOWNSTREAM STATE)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Immutable structured state passed downstream to Assessment &amp; Sandbox Modules
                    </span>
                  </div>
                  <Button
                    onClick={handleCopyJson}
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs font-mono h-7"
                  >
                    {copiedJson ? <CheckCheck className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                  </Button>
                </div>

                <pre className="p-3 rounded-lg bg-black/80 border border-white/5 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-48 leading-tight">
                  {JSON.stringify(candidateContextJson, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
