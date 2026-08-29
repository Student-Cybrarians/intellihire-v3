"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate" as "candidate" | "recruiter",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f8fafc] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-[#3b82f6]">
            IntelliHire
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">Create your account</h1>
          <p className="text-[#94a3b8] mt-2">
            One user. One persistent career context.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="p-3 rounded-md bg-red-900/30 border border-red-700 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "w-full px-4 py-3 rounded-md bg-[#111827] border border-[#1f2937]",
                "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent",
                "text-[#f8fafc] placeholder-[#6b7280] transition-colors"
              )}
              placeholder="Alex Mercer"
            />
          </div>

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
              placeholder="alex@example.com"
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={cn(
                "w-full px-4 py-3 rounded-md bg-[#111827] border border-[#1f2937]",
                "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent",
                "text-[#f8fafc] placeholder-[#6b7280] transition-colors"
              )}
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "candidate" })}
                className={cn(
                  "py-2.5 px-3 rounded-md border text-sm font-medium transition-colors",
                  formData.role === "candidate"
                    ? "bg-[#3b82f6]/20 border-[#3b82f6] text-[#60a5fa]"
                    : "bg-[#111827] border-[#1f2937] text-[#94a3b8] hover:border-[#374151]"
                )}
              >
                Job Seeker / Candidate
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "recruiter" })}
                className={cn(
                  "py-2.5 px-3 rounded-md border text-sm font-medium transition-colors",
                  formData.role === "recruiter"
                    ? "bg-[#3b82f6]/20 border-[#3b82f6] text-[#60a5fa]"
                    : "bg-[#111827] border-[#1f2937] text-[#94a3b8] hover:border-[#374151]"
                )}
              >
                Recruiter / Employer
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 px-4 rounded-md font-medium text-lg transition-colors mt-6",
              "focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 focus:ring-offset-[#0b0f19]",
              loading
                ? "bg-[#3b82f6]/70 cursor-not-allowed"
                : "bg-[#3b82f6] hover:bg-[#2563eb] text-white"
            )}
          >
            {loading ? "Creating account..." : "Get Started"}
          </button>
        </form>

        <p className="mt-6 text-center text-[#94a3b8] text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#3b82f6] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
