"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, UserRole } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Lock, Mail, ArrowRight, UserCheck, ShieldCheck, Briefcase, Sparkles, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { login, switchRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("candidate");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, email || undefined);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 mb-1">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Sign in to IntelliHire
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select a verified enterprise persona or enter custom credentials
          </p>
        </div>

        {/* Quick Demo Instant-Login Badges */}
        <Card className="border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <CardHeader className="pb-2.5 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                1-Click Instant Persona Access
              </CardTitle>
              <Badge variant="outline" className="text-[9px] font-mono">Demo Ready</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2.5 px-4 pb-4 pt-1">
            <button
              type="button"
              onClick={() => switchRole("candidate")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-slate-950/60 hover:border-blue-500/60 hover:bg-blue-500/10 transition-all text-center group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <UserCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Candidate</span>
              <span className="text-[10px] text-slate-400 font-mono">Vishnu S.</span>
            </button>

            <button
              type="button"
              onClick={() => switchRole("recruiter")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-slate-950/60 hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-all text-center group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Recruiter</span>
              <span className="text-[10px] text-slate-400 font-mono">Priya P.</span>
            </button>

            <button
              type="button"
              onClick={() => switchRole("admin")}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-white/10 bg-slate-950/60 hover:border-purple-500/60 hover:bg-purple-500/10 transition-all text-center group cursor-pointer"
            >
              <div className="h-8 w-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-foreground">Auditor</span>
              <span className="text-[10px] text-slate-400 font-mono">Michael</span>
            </button>
          </CardContent>
        </Card>

        {/* Standard Auth Form */}
        <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-5 px-5">
              {/* Role Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Target Role</label>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-950/80 border border-white/5 p-1">
                  {(["candidate", "recruiter", "admin"] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`rounded-md py-1.5 text-xs font-medium capitalize transition-all ${
                        selectedRole === r
                          ? "bg-primary text-primary-foreground font-bold shadow-xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Enterprise Work / Academic Email
                </label>
                <Input
                  type="email"
                  placeholder={`${selectedRole}@demo.intellihire.ai`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950/60 border-white/10"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950/60 border-white/10"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2 px-5 pb-5">
              <Button type="submit" variant="gradient" className="w-full gap-2 font-semibold shadow-lg shadow-indigo-500/20">
                <span>Continue as {selectedRole}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Don&apos;t have an enterprise account?{" "}
                <Link href="/register" className="text-primary hover:underline font-semibold">
                  Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
