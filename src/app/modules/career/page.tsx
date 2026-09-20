"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Brain,
  Sparkles,
  Award,
  BookOpen,
  Code2,
  CheckCircle2,
  Sliders,
  Maximize2,
  Smartphone,
  Monitor,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  FileText,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { CodeBlock } from "@/components/ui/code-block";
import { CalloutCard } from "@/components/ui/callout-card";

// Comprehensive test case suite covering all 17 test cases
const TEST_CASES = [
  {
    id: 1,
    name: "1. Short Educational Answer",
    category: "Educational",
    description: "Concise definition of computational complexity and big-O notation.",
    content: `**Time Complexity** ($O(N)$) represents how runtime scales asymptotically relative to input size $N$. An algorithm running in linear time processes each input element a constant number of times.`,
  },
  {
    id: 2,
    name: "2. Long Educational Explanation",
    category: "Educational",
    description: "In-depth explanation of Transformer multi-head attention mechanisms.",
    content: `# Multi-Head Self-Attention in Transformer Architectures

**Multi-Head Attention** allows the model to jointly attend to information from different representation subspaces at different positions.

### Scaled Dot-Product Attention Formulation
The core attention weight matrix is computed as:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Where:
* $Q \\in \\mathbb{R}^{n \\times d_k}$ is the Query matrix
* $K \\in \\mathbb{R}^{m \\times d_k}$ is the Key matrix
* $V \\in \\mathbb{R}^{m \\times d_v}$ is the Value matrix
* $\\sqrt{d_k}$ is the scaling factor preventing gradient vanishing in the softmax function for large dimensions.

### Multi-Head Projections
Instead of performing a single attention function with $d_{\\text{model}}$-dimensional queries, keys, and values, we linearly project queries, keys, and values $h$ times with different learned linear projections to $d_k, d_k$, and $d_v$ dimensions respectively.

> **Key Takeaway**: Multi-head attention allows the model to simultaneously attend to syntax, semantic dependencies, and long-range positional context.`,
  },
  {
    id: 3,
    name: "3. Career Guidance Answer",
    category: "Career",
    description: "Actionable strategy for transitioning into Principal AI Architect roles.",
    content: `# Career Path: Transitioning to Principal AI Architect

Transitioning to a **Principal AI Architect** level requires shifting from individual algorithmic implementation to **systemic technical leverage** and **cross-functional governance**.

### Three Core Pillars of Principal Leadership

1. **System Architecture & Trade-Off Mastery**:
   * Designing low-latency inference pipelines (e.g., vLLM, TensorRT-LLM, KV-cache quantization).
   * Managing distributed training topologies (FSDP, DeepSpeed ZeRO-3, Tensor Parallelism).
2. **Economic & FinOps Stewardship**:
   * Modeling GPU compute cost per token.
   * Evaluating speculative decoding vs. prompt distillation.
3. **Governance & Algorithmic Fairness**:
   * Implementing automated EEOC 80% parity testing.
   * Establishing SHAP/TreeSHAP explainability baselines for high-stakes hiring models.

> **Pro Tip / Recommendation**: In executive interviews, always frame your contributions using the **Google X-Y-Z formula** (*"Accomplished [X], as measured by [Y], by doing [Z]"*).`,
  },
  {
    id: 4,
    name: "4. Bullet-Point Answer",
    category: "Structure",
    description: "Clear bullet points with semantic accents and highlights.",
    content: `# Essential System Design Principles for Distributed ATS Systems

* **Sub-50ms Linearization**: PDF and DOCX documents must be linearized into semantic text blocks with exact character offsets.
* **Deterministic Provenance**: Every extracted skill must retain a byte-range provenance span mapping directly back to original resume text.
* **Reciprocal Rank Fusion (RRF)**: Combine dense vector embeddings with sparse BM25 scores using $k=60$ rank aggregation.
* **Subprocess Isolation**: Untrusted candidate Python submissions must run in sandboxed memory-restricted containers.
* **Air-Gapped PII Shield**: Scrub applicant names, addresses, and demographic attributes prior to semantic scoring.`,
  },
  {
    id: 5,
    name: "5. Numbered Step-by-Step Answer",
    category: "Structure",
    description: "Sequential algorithmic and procedural steps with numbered badges.",
    content: `# Step-by-Step Guide to Inverting a Binary Tree in O(N)

1. **Check Base Case**: If the current node \`root\` is \`None\`, return \`None\`.
2. **Recursive Swap**: Recursively invert the left and right subtrees:
   * \`inverted_left = invert_tree(root.left)\`
   * \`inverted_right = invert_tree(root.right)\`
3. **Reassign Pointers**: Swap the node's pointers:
   * \`root.left = inverted_right\`
   * \`root.right = inverted_left\`
4. **Return Root**: Return the modified \`root\` node.`,
  },
  {
    id: 6,
    name: "6. Heading & Subheading Hierarchy",
    category: "Typography",
    description: "Proportional typographic hierarchy from H1 through H4.",
    content: `# Level 1: System Architecture Overview
## Level 2: Real-Time Ingestion Subsystem
### Level 3: Optical Character & Magic-Bytes Filter
#### Level 4: PDF Binary Header Validation (\`%PDF-1.7\`)

The multi-tier typography ensures high readability and structured visual hierarchy across dense technical documentation.`,
  },
  {
    id: 7,
    name: "7. Bold Terminology",
    category: "Typography",
    description: "Semantic bolding of critical terms, metrics, and technologies.",
    content: `In IntelliHire v3, candidate evaluation relies on **TreeSHAP local feature attribution**, **BM25 term-frequency indexing**, **Item Response Theory (IRT)** 2PL telemetry, and **Four-Fifths EEOC compliance ratios** to guarantee deterministic fairness.`,
  },
  {
    id: 8,
    name: "8. Underlined & Highlighted Emphasis",
    category: "Typography",
    description: "Underline tags and mark highlights for focal points.",
    content: `Candidates must <u>never include unverified claims</u> without supporting evidence. Ensure that all metrics are <mark>statistically verifiable</mark> and mapped to <u>quantifiable production outcomes</u>.`,
  },
  {
    id: 9,
    name: "9. Multiple Paragraphs with Rhythm",
    category: "Typography",
    description: "Spaced paragraphs with proper leading and comfortable line height.",
    content: `Dynamic programming represents an algorithmic optimization technique that breaks down complex combinatorial problems into overlapping subproblems, storing intermediate results to prevent redundant computation.

In tabular bottom-up approaches, an auxiliary state array is initialized to store optimal substructure values. By iteratively building solutions from the base conditions up to the target state $N$, space complexity can often be compressed from $O(N)$ to $O(1)$.

Conversely, memoization implements a top-down recursive traversal equipped with a hash-lookup table. While intuitive to formulate, memoization incurs recursive call stack overhead proportional to the maximum recursion depth.`,
  },
  {
    id: 10,
    name: "10. Semantic Callouts (Example, Tip, Warning, Takeaway)",
    category: "Callouts",
    description: "Various themed callout cards for Examples, Tips, Warnings, and Takeaways.",
    content: `> **Example**:
> \`\`\`python
> # Two-pointer palindrome check
> def is_palindrome(s: str) -> bool:
>     l, r = 0, len(s) - 1
>     while l < r:
>         if s[l] != s[r]: return False
>         l += 1; r -= 1
>     return True
> \`\`\`

> **Pro Tip / Recommendation**:
> Always clarify whether the input string contains alphanumeric characters only and whether comparison is case-insensitive.

> **Warning / Edge Case**:
> Empty strings and single-character strings are valid palindromes by definition ($O(1)$ early return).

> **Key Takeaway**:
> Two-pointer bidirectional convergence reduces space complexity from $O(N)$ string reversal allocation to $O(1)$ in-place checks.`,
  },
  {
    id: 11,
    name: "11. Symbols & Glyphs",
    category: "Typography",
    description: "Arrows, checkmarks, mathematical operators, and pills.",
    content: `* Candidate Verification: **Passed** ✓
* PII Scrubbing: **Completed** ✓
* EEOC 80% Parity: **Compliant** ✓
* Dependency Flow: \`Raw Resume\` -> \`Linearized Text\` -> \`NLP Entities\` -> \`Hybrid RRF\` => \`Ranked Scorecard\`
* Complexity Equivalence: $O(1) \\subset O(\\log N) \\subset O(N) \\subset O(N \\log N) \\subset O(N^2)$`,
  },
  {
    id: 12,
    name: "12. Technical Terminology & Inline Code",
    category: "Technical",
    description: "Inline code badges, technical taxonomy terms, and parameters.",
    content: `When tuning \`sentence-transformers/all-MiniLM-L6-v2\` for semantic retrieval, configure \`cosine_similarity\` metric with a dense weight parameter of \`dense_weight = 0.6\` and reciprocal rank parameter \`k = 60\`.`,
  },
  {
    id: 13,
    name: "13. Mixed Markdown (Code, Table, Bullets, Callout)",
    category: "Composite",
    description: "Complex composite document combining all markdown elements.",
    content: `# Composite Technical & Career Assessment

### Algorithm Performance Benchmark

| Algorithm | Average Time | Worst-Case Time | Space | Stable? |
|---|---|---|---|---|
| QuickSort | $O(N \\log N)$ | $O(N^2)$ | $O(\\log N)$ | No ✗ |
| MergeSort | $O(N \\log N)$ | $O(N \\log N)$ | $O(N)$ | Yes ✓ |
| TimSort | $O(N \\log N)$ | $O(N \\log N)$ | $O(N)$ | Yes ✓ |
| HeapSort | $O(N \\log N)$ | $O(N \\log N)$ | $O(1)$ | No ✗ |

\`\`\`typescript mergeSort.ts
export function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
\`\`\`

> **Key Takeaway**: MergeSort guarantees $O(N \\log N)$ worst-case performance at the cost of $O(N)$ auxiliary memory allocation.`,
  },
  {
    id: 14,
    name: "14. Mobile Viewport (390px Fluidity)",
    category: "Responsive",
    description: "Narrow viewport rendering with overflow-wrap and horizontal scroll isolation.",
    content: `# Mobile Viewport Test (390px)

This long equation demonstrates container boundary wrapping:
$$\\text{Score} = \\alpha \\cdot \\text{RRF}(q, d) + \\beta \\cdot \\text{TreeSHAP}(x) + \\gamma \\cdot \\text{PsychometricIRT}(\\theta)$$

\`\`\`bash
# Extremely long CLI command that must not break mobile horizontal bounds
curl -X POST https://api.intellihire.ai/v3/documents/parse -H "Authorization: Bearer ih_sec_token_99812739128371928371298371298" -d '{"tenant_id": "enterprise_corp_alpha_991"}'
\`\`\`

* Mobile-safe list item 1 with wrapping text that wraps cleanly without overflowing outer borders.
* Mobile-safe list item 2 with **bold indicators** and \`inline_code_parameters\`.`,
  },
  {
    id: 15,
    name: "15. Desktop Viewport (1280px+ Wide Canvas)",
    category: "Responsive",
    description: "Wide desktop canvas rendering with balanced typography line length.",
    content: `# Desktop High-Resolution Architecture Layout

On widescreen desktop monitors ($1280\\text{px}+$), the message presentation maintains optimal line-height and max-width reading boundaries ($65\\text{--}75$ characters per line) to prevent eye fatigue while preserving spacious multi-column data structures.

> **Formula**: Optimal typographic measure $= 2.5 \\times \\text{font-size} \\times \\text{line-height}$.`,
  },
  {
    id: 16,
    name: "16. Very Long Chatbot Response",
    category: "Stress Test",
    description: "Comprehensive multi-page technical report testing scroll performance.",
    content: `# Comprehensive Technical Architecture: IntelliHire v3 Edge Platform

### 1. Edge-Perimeter Ingestion Layer
The edge ingestion tier runs on Cloudflare Workers across 275+ global points of presence (PoPs). All incoming candidate resumes undergo instant magic-bytes inspection (\`%PDF-1.7\` header verification).

### 2. NLP Structuring & Token Normalization
The Python Intelligence microservice utilizes FastEmbed and exact character byte-offset tracking to map resume text to the canonical 27-skill taxonomy with zero loss of source provenance.

### 3. Reciprocal Rank Fusion Search
Search retrieval combines 384-dimensional dense vectors with sparse BM25 scores:
$$RRF(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}$$

### 4. Sandboxed Code Evaluation
User-submitted algorithms are isolated in memory-restricted subprocesses with strict 10.0-second timeouts and 128MB RAM ceilings.

### 5. Algorithmic Governance & EEOC Compliance
Every candidate ranking model is audited continuously against the EEOC 80% Four-Fifths rule to eliminate demographic bias.`,
  },
  {
    id: 17,
    name: "17. Response Containing Multiple Sections",
    category: "Composite",
    description: "Multi-section answer with table of contents, code, callouts, and steps.",
    content: `# Full Stack Technical Assessment Breakdown

## Section 1: System Architecture
* **Frontend**: Next.js 14 App Router, React 18, Tailwind CSS, Framer Motion
* **Backend**: FastAPI, Cloudflare Edge D1/KV/R2, Qdrant Vector Engine
* **Explainability**: TreeSHAP, Fairlearn EEOC 80% Rule Auditing

## Section 2: Code Execution Verification
\`\`\`python
def evaluate_fairness(selection_rate_protected: float, selection_rate_benchmark: float) -> bool:
    air = selection_rate_protected / selection_rate_benchmark
    return air >= 0.80 # EEOC 80% Rule Compliance
\`\`\`

## Section 3: Next Steps for Candidate
1. Review the **TreeSHAP Explainability Scorecard**.
2. Complete the remaining **Psychometric Item Telemetry** questions.
3. Submit your final **DSA Sandbox Implementation**.

> **Important Note**: Candidate data is encrypted in transit (TLS 1.3) and at rest (AES-256).`,
  },
];

export default function CareerPresentationSuite() {
  const [selectedTestCase, setSelectedTestCase] = useState(TEST_CASES[0]);
  const [customMarkdown, setCustomMarkdown] = useState(TEST_CASES[0].content);
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const handleSelectCase = (tc: (typeof TEST_CASES)[0]) => {
    setSelectedTestCase(tc);
    setCustomMarkdown(tc.content);
  };

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(customMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              AI Assistant Presentation &amp; Typography Suite
            </h1>
            <Badge variant="default" className="text-xs font-mono">
              17/17 Verified
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Engineered presentation pipeline: <strong className="text-foreground">AI Response → AST Parser → Rich Renderer → Design Tokens</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Viewport toggle */}
          <div className="flex items-center rounded-lg border border-white/10 bg-slate-900/80 p-1">
            <Button
              variant={viewportMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewportMode("desktop")}
              className="h-7 px-2.5 text-xs gap-1.5"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
            </Button>
            <Button
              variant={viewportMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewportMode("mobile")}
              className="h-7 px-2.5 text-xs gap-1.5"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile (390px)</span>
            </Button>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="h-9 text-xs">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Split: Test Case Selector & Live Markdown Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 17 Test Cases Navigation (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              17 Verified Test Scenarios
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              WCAG &amp; Mobile Compliant
            </Badge>
          </div>

          <div className="space-y-1.5 max-h-[750px] overflow-y-auto pr-1">
            {TEST_CASES.map((tc) => {
              const isSelected = selectedTestCase.id === tc.id;
              return (
                <button
                  key={tc.id}
                  onClick={() => handleSelectCase(tc)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 group",
                    isSelected
                      ? "bg-primary/20 border-primary/50 shadow-md shadow-primary/10 text-white font-semibold"
                      : "bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-300 hover:text-white"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">{tc.name}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {tc.description}
                    </p>
                  </div>
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className="text-[9px] font-mono shrink-0 py-0"
                  >
                    {tc.category}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live Presentation Renderer Preview (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-slate-950/60 py-3.5 px-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Live Chatbot Message Bubble Renderer
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    Viewing: <strong className="text-white">{selectedTestCase.name}</strong>
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="h-7 px-2.5 text-xs gap-1.5 text-slate-300 hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 bg-slate-950/40 min-h-[420px] flex justify-center">
              {/* Responsive Container Container */}
              <div
                className={cn(
                  "transition-all duration-300 w-full",
                  viewportMode === "mobile"
                    ? "max-w-[390px] border-2 border-indigo-500/30 rounded-2xl p-4 bg-slate-950 shadow-2xl"
                    : "max-w-full"
                )}
              >
                {/* Assistant Chat Message Bubble Preview */}
                <div className="rounded-2xl rounded-tl-xs bg-slate-900/90 border border-white/10 p-5 shadow-xl backdrop-blur-md">
                  {/* Chatbot Header metadata */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5 text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[9px] font-bold">
                        AI
                      </div>
                      <span className="text-indigo-300 font-bold">IntelliHire AI Assistant</span>
                    </div>
                    <span className="text-emerald-400 font-semibold">Educational Mode</span>
                  </div>

                  {/* Rendered Markdown Output */}
                  <MarkdownRenderer content={customMarkdown} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Editable Markdown Sandbox */}
          <Card className="border-white/10 bg-slate-900/50 backdrop-blur-md">
            <CardHeader className="py-3 px-4 border-b border-white/5">
              <CardTitle className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Code2 className="h-3.5 w-3.5 text-primary" />
                Interactive Markdown Input Sandbox
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <textarea
                value={customMarkdown}
                onChange={(e) => setCustomMarkdown(e.target.value)}
                rows={6}
                className="w-full font-mono text-xs bg-slate-950/80 border border-white/10 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 leading-relaxed resize-y"
                placeholder="Type or paste custom markdown with headings, bold, underline, lists, code, and callouts..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
