"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import {
  Brain,
  FileText,
  User,
  Search,
  CheckCircle2,
  Code2,
  BarChart3,
  Briefcase,
  ShieldCheck,
  Activity,
  Sliders,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Award,
  Layers,
  Cpu,
  Globe,
  Radio,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const pathname = usePathname();
  const { user, role, switchRole, logout } = useAuth();
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menus when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsRoleMenuOpen(false);
  }, [pathname]);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const candidateNav = [
    { name: "Dashboard", href: "/dashboard", icon: Activity, badge: "Overview" },
    { name: "Resume Parser", href: "/resume", icon: FileText, badge: "NLP" },
    { name: "Structured Profile", href: "/profile", icon: User, badge: "Provenance" },
    { name: "Hybrid ATS Match", href: "/match", icon: Search, badge: "RRF" },
    { name: "Psychometrics", href: "/assessment", icon: Sliders, badge: "Telemetry" },
    { name: "Coding Sandbox", href: "/coding", icon: Code2, badge: "Isolated" },
    { name: "TreeSHAP Scorecard", href: "/feedback", icon: Award, badge: "Explainable" },
  ];

  const recruiterNav = [
    { name: "Recruiter Dashboard", href: "/recruiter/dashboard", icon: BarChart3, badge: "Overview" },
    { name: "Create Requisition", href: "/recruiter/requisitions/new", icon: Briefcase, badge: "Embed" },
    { name: "Candidate Pipeline", href: "/recruiter/candidates", icon: Search, badge: "RRF k=60" },
  ];

  const adminNav = [
    { name: "Governance Center", href: "/admin/dashboard", icon: Layers, badge: "Edge Topology" },
    { name: "IRT Telemetry", href: "/admin/telemetry", icon: Sliders, badge: "N≥200 Gate" },
    { name: "EEOC 80% Audits", href: "/admin/audits", icon: Award, badge: "NYC LL144" },
    { name: "Prompt Shield", href: "/admin/security", icon: ShieldCheck, badge: "Defenses" },
  ];

  const navItems =
    role === "recruiter"
      ? recruiterNav
      : role === "admin"
      ? adminNav
      : candidateNav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/70">
      {/* Top micro-bar: edge telemetry status */}
      <div className="hidden md:flex h-6 w-full items-center justify-between border-b border-white/5 bg-black/40 px-4 sm:px-6 lg:px-8 text-[10px] text-muted-foreground font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Cloudflare Edge Live (275+ PoPs)
          </span>
          <span className="text-white/20">•</span>
          <span className="text-slate-400">D1 SQLite + KV + R2 Storage</span>
          <span className="text-white/20">•</span>
          <span className="text-indigo-400">TreeSHAP Explainability Active</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400">EEOC 80% Rule Audited</span>
          <span className="text-white/20">•</span>
          <span className="text-purple-400">NYC LL144 Compliant</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-1 py-1 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Brain className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  IntelliHire
                </span>
                <Badge variant="default" className="text-[9px] py-0 px-1 font-mono">
                  v3.0
                </Badge>
              </div>
              <span className="text-[9px] text-slate-400 tracking-wider font-mono uppercase">
                Enterprise AI Placement
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden xl:flex items-center gap-1"
            aria-label="Main Navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  item.href !== "/recruiter/dashboard" &&
                  item.href !== "/admin/dashboard" &&
                  pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "bg-primary/20 text-white border border-primary/40 font-semibold shadow-xs"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-primary" : "text-slate-400")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Persona Selector & Quick Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <Button
              variant="glass"
              size="sm"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="flex items-center gap-2 text-xs h-8 px-2.5 bg-slate-900/80 border-white/10 hover:border-primary/40"
              aria-expanded={isRoleMenuOpen}
              aria-label="Switch User Persona"
            >
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span className="capitalize font-semibold text-white">
                {role === "candidate"
                  ? "Candidate (Vishnu)"
                  : role === "recruiter"
                  ? "Recruiter (Priya)"
                  : "Auditor (Michael)"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </Button>

            {isRoleMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/15 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in-80">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Switch Enterprise Persona
                </div>

                <button
                  onClick={() => {
                    switchRole("candidate");
                    setIsRoleMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-all",
                    role === "candidate"
                      ? "bg-primary/20 text-white font-semibold border border-primary/30"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                      VS
                    </div>
                    <div>
                      <div className="font-semibold text-white">Candidate</div>
                      <div className="text-[10px] text-slate-400">Vishnu Sharma</div>
                    </div>
                  </div>
                  {role === "candidate" && (
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">
                      Active
                    </Badge>
                  )}
                </button>

                <button
                  onClick={() => {
                    switchRole("recruiter");
                    setIsRoleMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-all mt-1",
                    role === "recruiter"
                      ? "bg-primary/20 text-white font-semibold border border-primary/30"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                      PP
                    </div>
                    <div>
                      <div className="font-semibold text-white">Recruiter</div>
                      <div className="text-[10px] text-slate-400">Priya Patel</div>
                    </div>
                  </div>
                  {role === "recruiter" && (
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">
                      Active
                    </Badge>
                  )}
                </button>

                <button
                  onClick={() => {
                    switchRole("admin");
                    setIsRoleMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-left transition-all mt-1",
                    role === "admin"
                      ? "bg-primary/20 text-white font-semibold border border-primary/30"
                      : "hover:bg-slate-800 text-slate-300 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                      BM
                    </div>
                    <div>
                      <div className="font-semibold text-white">Auditor &amp; Admin</div>
                      <div className="text-[10px] text-slate-400">Boss Michael</div>
                    </div>
                  </div>
                  {role === "admin" && (
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">
                      Active
                    </Badge>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Sign Out"
                aria-label="Sign Out"
                className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="h-8 text-xs font-semibold">
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="glass"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden h-8 w-8 text-slate-300"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl p-4 space-y-2 animate-in slide-in-from-top-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono px-2 py-1">
            Navigation ({role})
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary/20 text-white font-semibold border border-primary/40"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{item.name}</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono">
                  {item.badge}
                </Badge>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
