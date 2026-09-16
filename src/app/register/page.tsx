"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth, UserRole } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Brain, Lock, Mail, User, ArrowRight, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("candidate");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role, email || undefined, name || undefined);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 mb-1">
            <Brain className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Create Enterprise Account
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Join IntelliHire Enterprise Placement &amp; Career Intelligence
          </p>
        </div>

        <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-5 px-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Account Role</label>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-950/80 border border-white/5 p-1">
                  <button
                    type="button"
                    onClick={() => setRole("candidate")}
                    className={`rounded-md py-1.5 text-xs font-medium capitalize transition-all ${
                      role === "candidate"
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("recruiter")}
                    className={`rounded-md py-1.5 text-xs font-medium capitalize transition-all ${
                      role === "recruiter"
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Recruiter
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Full Name
                </label>
                <Input
                  placeholder="e.g. Vishnu Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950/60 border-white/10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Work or Academic Email
                </label>
                <Input
                  type="email"
                  placeholder="name@enterprise.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950/60 border-white/10"
                  required
                />
              </div>

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
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2 px-5 pb-5">
              <Button type="submit" variant="gradient" className="w-full gap-2 font-semibold shadow-lg shadow-indigo-500/20">
                <span>Complete Registration</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="text-center text-xs text-muted-foreground">
                Already registered?{" "}
                <Link href="/login" className="text-primary hover:underline font-semibold">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
