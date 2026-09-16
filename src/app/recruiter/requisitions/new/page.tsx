"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Plus,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Cpu,
  ArrowLeft,
  Binary
} from "lucide-react";

export default function NewRequisitionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("AI Platform & Infrastructure");
  const [location, setLocation] = useState("San Francisco, CA / Remote");
  const [seniority, setSeniority] = useState("Lead / Principal");
  const [description, setDescription] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "Python",
    "Go",
    "PyTorch",
    "Qdrant",
    "TreeSHAP",
    "FastAPI"
  ]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([
    "Kubeflow",
    "Docker",
    "Cloudflare D1/KV/R2"
  ]);

  const handleAddRequiredSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleRemovePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  const handleSaveRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/recruiter/candidates");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
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
              <Badge variant="outline" className="text-xs font-mono">Module 1: Requisition Builder</Badge>
              <Badge variant="success" dot className="text-xs font-mono">Dense Embed Ready</Badge>
              <Badge variant="purple" className="text-xs font-mono">384-d Cosine Vector Space</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
              Create Enterprise Requisition
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Define canonical skill taxonomy constraints, seniority weights, and semantic bi-encoder vector embeddings.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveRequisition} className="space-y-6">
        <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Briefcase className="h-4 w-4 text-primary" />
              Role Specification &amp; Targeting
            </CardTitle>
            <CardDescription className="text-xs">
              Requisition parameters for hybrid ATS indexing and EEOC compliance tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Requisition Job Title</label>
              <Input
                placeholder="e.g. Principal AI & Distributed Systems Architect"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-slate-950/80 border-white/10 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Department</label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="bg-slate-950/80 border-white/10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Location / Remote Policy</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-slate-950/80 border-white/10 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Seniority Threshold</label>
                <Input
                  value={seniority}
                  onChange={(e) => setSeniority(e.target.value)}
                  className="bg-slate-950/80 border-white/10 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Technical Mandate &amp; Systems Architecture Scope</label>
              <textarea
                rows={4}
                placeholder="Describe key responsibilities, systems architecture scope, and technical deliverables..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-foreground focus:outline-none focus:border-primary leading-relaxed resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skill Taxonomy Mapping */}
        <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-3 pt-5 px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Binary className="h-4 w-4 text-emerald-400" />
              Canonical Skill Taxonomy Requirements
            </CardTitle>
            <CardDescription className="text-xs">
              Skills mapped to verified character spans in candidate resumes with zero hallucination
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-5 pb-5">
            {/* Add Skill Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type canonical skill name (e.g. TreeSHAP, Qdrant, Docker)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="bg-slate-950/80 border-white/10 text-xs"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRequiredSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddRequiredSkill} variant="secondary" className="gap-1 text-xs shrink-0 bg-slate-800 hover:bg-slate-700 text-foreground">
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </Button>
            </div>

            {/* Required Skills Badges */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                Required Core Skills ({requiredSkills.length}) — 80% RRF Weight
              </label>
              <div className="flex flex-wrap gap-2">
                {requiredSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="success"
                    className="gap-1.5 py-1 px-2.5 font-mono text-xs flex items-center bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequiredSkill(skill)}
                      className="hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="space-y-2 pt-3 border-t border-white/5">
              <label className="text-xs font-bold text-foreground block">
                Preferred Bonus Skills ({preferredSkills.length}) — 20% RRF Weight
              </label>
              <div className="flex flex-wrap gap-2">
                {preferredSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="gap-1.5 py-1 px-2.5 font-mono text-xs flex items-center border border-white/10 bg-slate-950/80 text-slate-300"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePreferredSkill(skill)}
                      className="hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-5 pb-5 border-t border-white/5">
            <Link href="/recruiter/dashboard">
              <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto text-xs">
                Cancel
              </Button>
            </Link>

            <Button type="submit" size="sm" variant="gradient" className="w-full sm:w-auto gap-2 shadow-md shadow-indigo-500/20 font-semibold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>Generate 384-d Embedding &amp; Publish Requisition</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
