"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="text-3xl font-bold text-[#3b82f6]">
          IntelliHire
        </Link>
        <h1 className="mt-6 text-2xl font-semibold">Welcome back</h1>
        <p className="text-[#94a3b8] mt-2">Sign in to your career intelligence platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="p-3 rounded-md bg-red-900/30 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={cn(
              "w-full px-4 py-3 rounded-md bg-[#111827] border border-[#1f2937]",
              "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent",
              "text-[#f8fafc] placeholder-[#6b7280] transition-colors"
            )}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className={cn(
              "w-full px-4 py-3 rounded-md bg-[#111827] border border-[#1f2937]",
              "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent",
              "text-[#f8fafc] placeholder-[#6b7280] transition-colors"
            )}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-3 px-4 rounded-md font-medium text-lg transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0b0f19]",
            loading
              ? "bg-[#3b82f6]/70 cursor-not-allowed"
              : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
          )}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-[#94a3b8] text-sm">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-[#3b82f6] hover:underline font-medium"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex items-center justify-center px-4">
      <Suspense fallback={<div className="text-center text-[#94a3b8]">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
