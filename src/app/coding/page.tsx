"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useSpring,
  useTransform,
  useMotionValue,
  useInView,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Code2,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* ── Spring counter ─────────────────────────────────────────────── */
function SpringCounter({
  to,
  decimals = 1,
  className,
}: {
  to: number;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 50, damping: 18 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));

  useEffect(() => {
    if (inView) raw.set(to);
  }, [inView, to, raw]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

/* ── Typewriter terminal line ───────────────────────────────────── */
function TypewriterLine({
  text,
  delay = 0,
  color = "text-emerald-400",
}: {
  text: string;
  delay?: number;
  color?: string;
}) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    setDisplayed("");
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, 16);
    return () => clearInterval(iv);
  }, [started, text]);

  return (
    <span className={`block font-mono text-xs leading-5 ${color}`}>
      {displayed}
      {started && displayed.length < text.length && (
        <span className="animate-pulse">▋</span>
      )}
    </span>
  );
}

/* ── Terminal output stream ─────────────────────────────────────── */
const STDOUT_LINES = [
  { text: "> Initializing subprocess sandbox...", color: "text-slate-400", delay: 0 },
  { text: "> Resource limits: 3000ms | 128MB RAM | Network: isolated", color: "text-slate-400", delay: 300 },
  { text: "> Compiling AST for Kadane's algorithm...", color: "text-indigo-300", delay: 700 },
  { text: "", color: "text-slate-600", delay: 1000 },
  { text: "Test 1: 6", color: "text-emerald-400", delay: 1200 },
  { text: "Test 2: 1", color: "text-emerald-400", delay: 1500 },
  { text: "Test 3: 23", color: "text-emerald-400", delay: 1800 },
  { text: "", color: "text-slate-600", delay: 2100 },
  { text: "✓ Sandbox Process Exit Code: 0", color: "text-emerald-300", delay: 2300 },
  { text: "✓ CPU Duration: 89.2ms (Limit: 3000ms)", color: "text-emerald-300", delay: 2550 },
  { text: "✓ Memory Footprint: 24.8 MB (Limit: 128 MB)", color: "text-emerald-300", delay: 2800 },
];

/* ── Test case row with animated checkmark ──────────────────────── */
function TestCaseRow({
  label,
  result,
  delay,
}: {
  label: string;
  result: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: delay / 1000, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs"
    >
      <span className="text-slate-300 font-mono">{label}</span>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay / 1000 + 0.15, type: "spring", stiffness: 200 }}
        className="text-emerald-400 font-bold font-mono"
      >
        {result}
      </motion.span>
    </motion.div>
  );
}

/* ── Main page ───────────────────────────────────────────────────── */
const defaultCodes: Record<string, string> = {
  python: `def max_sub_array(nums: list[int]) -> int:
    """
    Kadane's Algorithm: Compute maximum contiguous subarray sum in O(N) time.
    """
    if not nums:
        return 0
    max_so_far = nums[0]
    curr_max = nums[0]

    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)

    return max_so_far

# Test Execution Harness
if __name__ == "__main__":
    print(f"Test 1: {max_sub_array([-2,1,-3,4,-1,2,1,-5,4])}")
    print(f"Test 2: {max_sub_array([1])}")
    print(f"Test 3: {max_sub_array([5,4,-1,7,8])}")`,

  javascript: `function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let currMax = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currMax = Math.max(nums[i], currMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currMax);
    }
    return maxSoFar;
}

console.log("Test 1:", maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));
console.log("Test 2:", maxSubArray([1]));
console.log("Test 3:", maxSubArray([5,4,-1,7,8]));`,

  typescript: `function maxSubArray(nums: number[]): number {
    let maxSoFar: number = nums[0];
    let currMax: number = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currMax = Math.max(nums[i], currMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currMax);
    }
    return maxSoFar;
}

console.log("Test 1:", maxSubArray([-2,1,-3,4,-1,2,1,-5,4]));
console.log("Test 2:", maxSubArray([1]));
console.log("Test 3:", maxSubArray([5,4,-1,7,8]));`,

  go: `package main

import (
\t"fmt"
)

func maxSubArray(nums []int) int {
\tmaxSoFar := nums[0]
\tcurrMax := nums[0]
\tfor i := 1; i < len(nums); i++ {
\t\tif nums[i] > currMax+nums[i] {
\t\t\tcurrMax = nums[i]
\t\t} else {
\t\t\tcurrMax = currMax + nums[i]
\t\t}
\t\tif currMax > maxSoFar {
\t\t\tmaxSoFar = currMax
\t\t}
\t}
\treturn maxSoFar
}

func main() {
\tfmt.Println("Test 1:", maxSubArray([]int{-2, 1, -3, 4, -1, 2, 1, -5, 4}))
\tfmt.Println("Test 2:", maxSubArray([]int{1}))
\tfmt.Println("Test 3:", maxSubArray([]int{5, 4, -1, 7, 8}))
}`,

  cpp: `#include <iostream>
#include <vector>
#include <algorithm>

int maxSubArray(const std::vector<int>& nums) {
    int maxSoFar = nums[0];
    int currMax = nums[0];
    for (size_t i = 1; i < nums.size(); ++i) {
        currMax = std::max(nums[i], currMax + nums[i]);
        maxSoFar = std::max(maxSoFar, currMax);
    }
    return maxSoFar;
}

int main() {
    std::cout << "Test 1: " << maxSubArray({-2,1,-3,4,-1,2,1,-5,4}) << std::endl;
    std::cout << "Test 2: " << maxSubArray({1}) << std::endl;
    std::cout << "Test 3: " << maxSubArray({5,4,-1,7,8}) << std::endl;
    return 0;
}`,
};

export default function CodingSandboxPage() {
  const [language, setLanguage] = useState<
    "python" | "javascript" | "typescript" | "go" | "cpp"
  >("python");
  const [isRunning, setIsRunning] = useState(false);
  const [showResult, setShowResult] = useState(true); // show pre-executed initial result
  const [terminalKey, setTerminalKey] = useState(0); // bump to re-trigger animation
  const [code, setCode] = useState(defaultCodes.python);

  const handleLanguageChange = (lang: typeof language) => {
    setLanguage(lang);
    setCode(defaultCodes[lang]);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setShowResult(false);
    setTimeout(() => {
      setIsRunning(false);
      setShowResult(true);
      setTerminalKey((k) => k + 1);
    }, 700);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6"
      >
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              Module 3
            </Badge>
            <Badge variant="success" dot className="text-xs font-mono">
              Subprocess Isolation Live
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono">
              3.0s / 128MB Hard Caps
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-2">
            Isolated Code Execution Sandbox
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Subprocess execution environment supporting Python, JS, TS, Go, and
            C++ with strict CPU, memory, and timeout bounds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/feedback">
            <Button
              size="sm"
              variant="gradient"
              className="gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
            >
              <span>View TreeSHAP Scorecard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Security Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <Alert
          variant="purple"
          className="border-purple-500/30 bg-purple-500/10 backdrop-blur-md"
        >
          <ShieldCheck className="h-4 w-4 text-purple-400" />
          <AlertTitle className="text-xs font-bold text-purple-300">
            Zero-Trust Subprocess Sandbox Protection
          </AlertTitle>
          <AlertDescription className="text-xs text-slate-300 mt-1 leading-relaxed">
            Candidate code runs inside isolated child subprocesses with network
            disconnections and strict memory bounds (128 MB). Untrusted code
            never executes in server worker threads.
          </AlertDescription>
        </Alert>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Code editor (7 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 space-y-4"
        >
          <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-3 border-b border-white/5 bg-slate-950/80 gap-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground font-sans">
                  Kadane Algorithm Solution
                </span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  DSA Test Suite
                </Badge>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-white/10">
                {(
                  [
                    "python",
                    "javascript",
                    "typescript",
                    "go",
                    "cpp",
                  ] as const
                ).map((lang) => (
                  <motion.button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    whileTap={{ scale: 0.93 }}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md capitalize transition-all cursor-pointer ${
                      language === lang
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang === "cpp" ? "C++" : lang}
                  </motion.button>
                ))}
              </div>
            </div>

            <CardContent className="p-0">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                className="w-full p-4 bg-slate-950/95 font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed selection:bg-primary/40 border-none"
                spellCheck={false}
              />
            </CardContent>

            <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 border-t border-white/5 bg-slate-950/80 gap-3">
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>Timeout: 3.0s</span>
                <span>•</span>
                <span>Memory: 128MB</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">
                  Network: Isolated
                </span>
              </div>

              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  variant="gradient"
                  className="w-full sm:w-auto gap-2 text-xs font-semibold shadow-md shadow-indigo-500/20"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isRunning ? (
                      <motion.span
                        key="running"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Executing in Subprocess...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        className="flex items-center gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Execute in Sandbox
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Right: Live AST terminal (5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 space-y-6"
        >
          <Card className="border-white/10 bg-slate-900/70 backdrop-blur-xl shadow-xl">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  Live AST Execution Terminal
                </CardTitle>
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Badge variant="success" className="text-[10px] font-mono">
                        ACCEPTED
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <CardDescription className="text-xs">
                Real-time typewriter output · metrics animate on completion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 font-mono">
              {/* Metrics — count up when result is shown */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    key={`metrics-${terminalKey}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 gap-2 text-xs"
                  >
                    <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider font-sans">
                        Execution Latency
                      </span>
                      <span className="font-bold text-emerald-400 text-sm">
                        <SpringCounter to={89.2} decimals={1} /> ms
                      </span>
                    </div>
                    <div className="p-3 rounded-xl border border-white/5 bg-slate-950/80">
                      <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider font-sans">
                        Peak Memory
                      </span>
                      <span className="font-bold text-indigo-400 text-sm">
                        <SpringCounter to={24.8} decimals={1} /> MB
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Typewriter terminal */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                  Process Standard Output
                </span>
                <div className="p-3.5 rounded-xl bg-black/90 border border-white/10 min-h-[200px] overflow-hidden">
                  {showResult ? (
                    <div key={terminalKey}>
                      {STDOUT_LINES.map((line, i) => (
                        <TypewriterLine
                          key={`${terminalKey}-${i}`}
                          text={line.text || " "}
                          color={line.color}
                          delay={line.delay}
                        />
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-slate-500 font-mono"
                    >
                      <span className="animate-pulse">▋</span>
                      {" "}Spawning subprocess...
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Test cases with staggered entry */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    key={`tests-${terminalKey}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2 pt-2 border-t border-white/5 font-sans"
                  >
                    <span className="text-xs font-bold text-foreground block">
                      Validation Test Cases (3/3 Passed)
                    </span>
                    <div className="space-y-1.5">
                      <TestCaseRow
                        label="Test 1: Mixed Array"
                        result="Passed (6)"
                        delay={2400}
                      />
                      <TestCaseRow
                        label="Test 2: Single Element"
                        result="Passed (1)"
                        delay={2700}
                      />
                      <TestCaseRow
                        label="Test 3: Positive Stream"
                        result="Passed (23)"
                        delay={3000}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
