"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
}

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

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [context, setContext] = useState<CareerContext | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const sessionRes = await fetch("/api/auth/me");
        if (!sessionRes.ok) {
          redirect("/login");
        }

        const sessionData = await sessionRes.json();
        setUser(sessionData.user);

        // Load career context
        const contextRes = await fetch("/api/career/context");
        if (contextRes.ok) {
          const contextData = await contextRes.json();
          setContext(contextData.context);
        }

        // Load activities
        const activitiesRes = await fetch("/api/career/activities");
        if (activitiesRes.ok) {
          const activitiesData = await activitiesRes.json();
          setActivities(activitiesData.activities);
        }
      } catch (err) {
        setError("Failed to load dashboard");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    redirect("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b82f6]"></div>
          <p className="mt-4 text-[#94a3b8]">Loading your career dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link href="/" className="text-[#3b82f6] hover:underline">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc]">
      {/* Header */}
      <header className="border-b border-[#1f2937] bg-[#111827]/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#3b82f6]">
            IntelliHire
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#94a3b8]">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-md text-sm border border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, <span className="text-[#3b82f6]">{user?.name}</span>
          </h1>
          <p className="text-[#94a3b8]">Your unified career intelligence platform</p>
        </div>

        {/* Career Context Summary */}
        {context && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
            <div className="p-6 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-[#3b82f6] transition-colors">
              <div className="text-sm text-[#94a3b8] mb-1">Target Role</div>
              <div className="text-2xl font-bold text-[#3b82f6]">{context.targetRole}</div>
            </div>

            <div className="p-6 rounded-lg bg-[#111827] border border-[#1f2937]">
              <div className="text-sm text-[#94a3b8] mb-1">Readiness Score</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-[#10b981]">{context.readinessScore}</div>
                <div className="text-sm text-[#94a3b8]">/100</div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#111827] border border-[#1f2937]">
              <div className="text-sm text-[#94a3b8] mb-1">ATS Score</div>
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-[#8b5cf6]">{context.atsScore}</div>
                <div className="text-sm text-[#94a3b8]">/100</div>
              </div>
            </div>

            <div className="p-6 rounded-lg bg-[#111827] border border-[#1f2937]">
              <div className="text-sm text-[#94a3b8] mb-1">Industry</div>
              <div className="text-2xl font-bold text-[#f59e0b]">{context.targetIndustry}</div>
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Career Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Career Intelligence",
                desc: "Resume analysis, career roadmap, ATS optimization",
                icon: "🎯",
                color: "text-[#10b981]",
                href: "/modules/career",
              },
              {
                title: "Adaptive Assessment",
                desc: "Skills assessment with adaptive difficulty",
                icon: "📊",
                color: "text-[#8b5cf6]",
                href: "/modules/assessment",
              },
              {
                title: "Technical Interviews",
                desc: "AI-powered technical interview simulator",
                icon: "💻",
                color: "text-[#3b82f6]",
                href: "/modules/tech-interview",
              },
              {
                title: "HR Interviews",
                desc: "Behavioral interview preparation & coaching",
                icon: "🤝",
                color: "text-[#f59e0b]",
                href: "/modules/hr-interview",
              },
              {
                title: "Readiness Report",
                desc: "Aggregate readiness and hiring recommendation",
                icon: "📈",
                color: "text-[#06b6d4]",
                href: "/modules/readiness",
              },
              {
                title: "AI Assistant",
                desc: "Chat with your unified career AI",
                icon: "🤖",
                color: "text-[#ec4899]",
                href: "/modules/assistant",
              },
            ].map((module) => (
              <Link
                key={module.href}
                href={module.href}
                className="p-6 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-[#3b82f6] transition-colors group cursor-pointer"
              >
                <div className={`text-4xl mb-3 ${module.color}`}>{module.icon}</div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-[#3b82f6] transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-[#94a3b8]">{module.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 rounded-lg bg-[#111827] border border-[#1f2937] flex items-start gap-4"
                >
                  <div className="text-2xl">{activity.type === "resume" ? "📄" : activity.type === "assessment" ? "📊" : activity.type === "interview" ? "💬" : "✓"}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#f8fafc]">{activity.title}</h4>
                    <p className="text-sm text-[#94a3b8]">{activity.description}</p>
                  </div>
                  <span className="text-xs text-[#6b7280] whitespace-nowrap">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}