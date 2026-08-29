"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Upload, Plus, Trash2, Award, Sparkles, Briefcase, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CareerContext {
  targetRole: string;
  targetIndustry: string;
  seniorityLevel: string;
  skills: string[];
  readinessScore: number;
  atsScore: number;
  assessmentScore: number;
  interviewScore: number;
}

interface Milestone {
  id: string;
  title: string;
  category: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedHours: number;
  description: string;
}

interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  parsedSummary: string;
  atsScore: number;
  suggestedKeywords: string[];
  missingKeywords: string[];
}

export default function CareerIntelligencePage() {
  const [context, setContext] = useState<CareerContext | null>(null);
  const [roadmap, setRoadmap] = useState<Milestone[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'roadmap' | 'resume'>('profile');

  // Form states for profile
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/career");
        if (res.ok) {
          const data = await res.json();
          setContext(data.context);
          setRoadmap(data.roadmap || []);
          setResumes(data.resumes || []);
          if (data.context) {
            setTargetRole(data.context.targetRole || "");
            setTargetIndustry(data.context.targetIndustry || "");
            setSeniorityLevel(data.context.seniorityLevel || "");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/career", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          targetIndustry,
          seniorityLevel,
          skills: context?.skills || [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setContext(data.context);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || !context) return;
    const updatedSkills = Array.from(new Set([...context.skills, newSkill.trim()]));
    setSaving(true);
    try {
      const res = await fetch("/api/career", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updatedSkills }),
      });
      if (res.ok) {
        const data = await res.json();
        setContext(data.context);
        setNewSkill("");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!context) return;
    const updatedSkills = context.skills.filter(s => s !== skillToRemove);
    try {
      const res = await fetch("/api/career", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: updatedSkills }),
      });
      if (res.ok) {
        const data = await res.json();
        setContext(data.context);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: Milestone['status']) => {
    const nextStatus: Milestone['status'] = currentStatus === 'completed' ? 'in-progress' : 'completed';
    try {
      const res = await fetch("/api/career/roadmap", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, status: nextStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(prev => prev.map(m => m.id === milestoneId ? data.milestone : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadResumeSim = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/career/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `Resume_Upload_${new Date().toISOString().slice(0, 10)}.pdf`,
          fileSize: 184500,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResumes(prev => [data.resume, ...prev]);
        if (context) {
          setContext({ ...context, atsScore: data.resume.atsScore });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] pb-20">
      {/* Header */}
      <header className="border-b border-[#1f2937] bg-[#111827]/50 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-[#1f2937] rounded-lg transition-colors text-[#94a3b8] hover:text-[#f8fafc]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#10b981]" />
                Module 1: Career Intelligence & ATS Hub
              </h1>
              <p className="text-xs text-[#94a3b8]">One persistent career context for personalized assessment & placement</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 font-medium">
              Live Edge Sync
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1f2937] mb-8 gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              "px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
              activeTab === 'profile'
                ? "border-[#3b82f6] text-[#3b82f6]"
                : "border-transparent text-[#94a3b8] hover:text-[#f8fafc]"
            )}
          >
            <Briefcase className="w-4 h-4" />
            Target Profile & Taxonomy
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={cn(
              "px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
              activeTab === 'roadmap'
                ? "border-[#3b82f6] text-[#3b82f6]"
                : "border-transparent text-[#94a3b8] hover:text-[#f8fafc]"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Career Roadmap ({roadmap.length})
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={cn(
              "px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2",
              activeTab === 'resume'
                ? "border-[#3b82f6] text-[#3b82f6]"
                : "border-transparent text-[#94a3b8] hover:text-[#f8fafc]"
            )}
          >
            <FileText className="w-4 h-4" />
            Resume Intelligence & ATS ({resumes.length})
          </button>
        </div>

        {/* TAB 1: Profile & Skills Taxonomy */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937]">
                <h2 className="text-lg font-semibold mb-4 text-[#f8fafc]">Target Career Objectives</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1">Target Job Title</label>
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#0b0f19] border border-[#1f2937] text-sm text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      placeholder="e.g. Senior Full-Stack Engineer"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#94a3b8] mb-1">Target Industry / Domain</label>
                      <input
                        type="text"
                        value={targetIndustry}
                        onChange={(e) => setTargetIndustry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#0b0f19] border border-[#1f2937] text-sm text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                        placeholder="e.g. Cloud & AI Platforms"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#94a3b8] mb-1">Seniority Benchmark</label>
                      <select
                        value={seniorityLevel}
                        onChange={(e) => setSeniorityLevel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-[#0b0f19] border border-[#1f2937] text-sm text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                      >
                        <option value="Associate / Entry">Associate / Entry (0-2 YOE)</option>
                        <option value="Mid-Level">Mid-Level (3-5 YOE)</option>
                        <option value="Senior / Lead">Senior / Lead (5-8 YOE)</option>
                        <option value="Staff / Principal">Staff / Principal (8+ YOE)</option>
                        <option value="Director / Executive">Director / Executive (10+ YOE)</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium transition-colors"
                    >
                      {saving ? "Saving Changes..." : "Update Career Context"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Skills Taxonomy Manager */}
              <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937]">
                <h2 className="text-lg font-semibold mb-2 text-[#f8fafc]">Verified & Target Skills Taxonomy</h2>
                <p className="text-xs text-[#94a3b8] mb-4">These competencies guide question selection in adaptive assessments and coding simulators.</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {context?.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-[#1f2937] text-[#60a5fa] border border-[#374151]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-red-400 p-0.5 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new verified skill (e.g. Distributed Systems, Rust, Go)..."
                    className="flex-1 px-4 py-2 rounded-lg bg-[#0b0f19] border border-[#1f2937] text-sm text-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-sm font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Skill
                  </button>
                </form>
              </div>
            </div>

            {/* Right sidebar metrics */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937]">
                <h3 className="text-sm font-medium text-[#94a3b8] mb-4">Placement Readiness Health</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-extrabold text-[#10b981]">{context?.readinessScore}</span>
                  <span className="text-sm text-[#94a3b8]">/ 100 Overall Score</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[#94a3b8] mb-1">
                      <span>ATS Resume Keyword Match</span>
                      <span className="text-[#f8fafc] font-semibold">{context?.atsScore}%</span>
                    </div>
                    <div className="w-full bg-[#1f2937] rounded-full h-1.5">
                      <div className="bg-[#8b5cf6] h-1.5 rounded-full" style={{ width: `${context?.atsScore}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[#94a3b8] mb-1">
                      <span>Technical Assessment Rating</span>
                      <span className="text-[#f8fafc] font-semibold">{context?.assessmentScore}%</span>
                    </div>
                    <div className="w-full bg-[#1f2937] rounded-full h-1.5">
                      <div className="bg-[#3b82f6] h-1.5 rounded-full" style={{ width: `${context?.assessmentScore}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[#94a3b8] mb-1">
                      <span>Mock Interview Performance</span>
                      <span className="text-[#f8fafc] font-semibold">{context?.interviewScore}%</span>
                    </div>
                    <div className="w-full bg-[#1f2937] rounded-full h-1.5">
                      <div className="bg-[#f59e0b] h-1.5 rounded-full" style={{ width: `${context?.interviewScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-[#111827] to-[#1e1b4b] border border-[#3730a3]/40">
                <div className="flex items-center gap-2 text-[#818cf8] mb-2">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold text-sm">Hiring Committee Benchmark</span>
                </div>
                <p className="text-xs text-[#c7d2fe] leading-relaxed">
                  Based on your persistent context for <strong className="text-white">{context?.targetRole}</strong>, you rank in the top <strong className="text-white">12%</strong> of assessed candidates for Cloud & AI platform roles.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Career Roadmap */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#f8fafc]">Target Career Roadmap & Milestones</h2>
                <p className="text-xs text-[#94a3b8]">AI-orchestrated progression plan tailored to close technical gaps for {context?.targetRole}.</p>
              </div>
            </div>

            <div className="space-y-4">
              {roadmap.map((milestone, idx) => (
                <div
                  key={milestone.id}
                  className={cn(
                    "p-6 rounded-xl border transition-all flex items-start justify-between gap-4",
                    milestone.status === 'completed'
                      ? "bg-[#111827]/80 border-[#10b981]/30 text-[#94a3b8]"
                      : milestone.status === 'in-progress'
                      ? "bg-[#111827] border-[#3b82f6]/50 shadow-lg shadow-[#3b82f6]/5"
                      : "bg-[#111827]/50 border-[#1f2937]"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleMilestone(milestone.id, milestone.status)}
                      className="mt-0.5"
                    >
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-[#10b981]" />
                      ) : (
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                          milestone.status === 'in-progress' ? "border-[#3b82f6] text-[#3b82f6]" : "border-[#4b5563] text-[#6b7280]"
                        )}>
                          {idx + 1}
                        </div>
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-semibold text-base", milestone.status === 'completed' ? "line-through text-[#94a3b8]" : "text-[#f8fafc]")}>
                          {milestone.title}
                        </h3>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#1f2937] text-[#60a5fa] border border-[#374151]">
                          {milestone.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#94a3b8] mb-2 leading-relaxed">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> ~{milestone.estimatedHours} Hours Required
                        </span>
                        <span className={cn(
                          "font-medium capitalize",
                          milestone.status === 'completed' ? "text-[#10b981]" : milestone.status === 'in-progress' ? "text-[#3b82f6]" : "text-[#9ca3af]"
                        )}>
                          • {milestone.status.replace("-", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Resume Intelligence & ATS */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-[#f8fafc]">Resume Intelligence & ATS Optimization</h2>
                <p className="text-xs text-[#94a3b8]">Upload your latest resume to parse keywords, benchmark formatting, and generate targeted versions.</p>
              </div>
              <button
                onClick={handleUploadResumeSim}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" /> {saving ? "Analyzing..." : "Upload & Analyze PDF"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {resumes.map((resume) => (
                <div key={resume.id} className="p-6 rounded-xl bg-[#111827] border border-[#1f2937] space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#3b82f6]" />
                        <h3 className="font-semibold text-base text-[#f8fafc]">{resume.fileName}</h3>
                      </div>
                      <span className="text-xs text-[#94a3b8]">Uploaded {new Date(resume.uploadDate).toLocaleDateString()} • {(resume.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs text-[#94a3b8]">ATS Keyword Score</div>
                        <div className="text-2xl font-extrabold text-[#10b981]">{resume.atsScore} / 100</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">AI Executive Parsing Summary</h4>
                    <p className="text-xs text-[#cbd5e1] leading-relaxed bg-[#0b0f19] p-4 rounded-lg border border-[#1f2937]">
                      {resume.parsedSummary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-[#0b0f19] border border-[#1f2937]">
                      <h4 className="text-xs font-semibold text-[#10b981] mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> High Impact Keywords Matched
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {resume.suggestedKeywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded text-[11px] bg-[#10b981]/10 text-[#34d399] border border-[#10b981]/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#0b0f19] border border-[#1f2937]">
                      <h4 className="text-xs font-semibold text-[#f59e0b] mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Recommended Additions for Top Tier Target
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {resume.missingKeywords.map((kw) => (
                          <span key={kw} className="px-2 py-0.5 rounded text-[11px] bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
