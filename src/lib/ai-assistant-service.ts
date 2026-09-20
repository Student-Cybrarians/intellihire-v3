/**
 * IntelliHire v3 - AI Career & Educational Assistant Service
 * Provides educational explanations, career coaching, technical interview prep,
 * and algorithm/system design intelligence with strict career-only guardrails.
 */

export interface AssistantMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  category?: "career" | "educational" | "technical" | "compliance" | "general";
  isStreaming?: boolean;
}

export interface AssistantCategoryPrompt {
  label: string;
  query: string;
  category: "career" | "educational" | "technical" | "compliance";
}

export const QUICK_PROMPT_CHIPS: AssistantCategoryPrompt[] = [
  {
    label: "Resume Optimization Heuristics",
    query: "How should I structure my resume bullet points according to Google's X-Y-Z formula for ATS parsers?",
    category: "career",
  },
  {
    label: "Kadane's Algorithm & Dynamic Programming",
    query: "Explain Kadane's algorithm for maximum subarray sum with step-by-step logic, time complexity, and Python code.",
    category: "technical",
  },
  {
    label: "TreeSHAP Lift Meaning in Hiring",
    query: "What is TreeSHAP explainability in candidate ranking, and what does a positive vs negative SHAP value represent?",
    category: "educational",
  },
  {
    label: "EEOC 80% Adverse Impact Rule",
    query: "Explain the Four-Fifths (80%) Rule under EEOC Uniform Guidelines for hiring fairness and compliance.",
    category: "compliance",
  },
  {
    label: "Behavioral STAR Method Guide",
    query: "How do I format answers to behavioral interview questions using the STAR framework?",
    category: "career",
  },
];

/**
 * Knowledge Base providing educational and career responses.
 * Structured with full Markdown formatting for the presentation layer.
 */
export const KNOWLEDGE_BASE: Record<string, string> = {
  xyz_resume: `# Google X-Y-Z Resume Optimization Formula

To maximize ATS score and recruiter engagement, every bullet point on your resume should follow the **Google X-Y-Z Formula**:

> **Formula**: *"Accomplished **[X]**, as measured by **[Y]**, by doing **[Z]**."*

### Key Components of the Formula

1. **[X] Action & Outcome**: Start with a high-impact action verb (*Engineered*, *Architected*, *Optimized*, *Reduced*).
2. **[Y] Quantified Impact**: Concrete numerical metric, percentage, latency, or revenue (*42% latency reduction*, *+$1.2M pipeline revenue*, *99.99% uptime*).
3. **[Z] Method & Tooling**: The specific technologies, algorithms, or architectural patterns used (*using Rust, Tokio, and Redis pipelining*).

### Before vs. After Comparison

| Weak Resume Bullet ✗ | Optimized X-Y-Z Bullet ✓ | ATS Impact |
|---|---|---|
| Worked on backend APIs for order processing. | Engineered distributed order ingestion API handling 45K req/sec, reducing p99 latency by 38% via Redis connection pooling in Go. | High (+34% Match) |
| Built machine learning model for churn prediction. | Developed XGBoost churn prediction pipeline yielding 0.89 ROC-AUC, preventing $240K in annual ARR churn across 14 enterprise tenants. | High (+41% Match) |

> **Pro Tip / Recommendation**: Never submit generic descriptions like *"responsible for maintaining systems"*. Always highlight **quantifiable leverage** and **technical provenance**!`,

  kadane_algo: `# Kadane's Algorithm (Maximum Subarray Sum)

**Kadane's Algorithm** is an optimal dynamic programming technique used to find the contiguous subarray within a one-dimensional array of numbers which has the largest sum.

### Computational Complexity
* **Time Complexity**: \`O(N)\` — Single linear pass over the array.
* **Space Complexity**: \`O(1)\` — In-place scalar accumulators.

---

### Step-by-Step Mathematical Logic

1. Initialize two variables:
   * \`current_max\`: Maximum sum ending at the current position.
   * \`global_max\`: Overall maximum subarray sum encountered so far.
2. For each element \`x\` in the array:
   * Update \`current_max = max(x, current_max + x)\`
   * Update \`global_max = max(global_max, current_max)\`
3. Return \`global_max\`.

---

### Python Implementation

\`\`\`python kadane.py
def max_subarray_sum(nums: list[int]) -> int:
    """
    Computes maximum contiguous subarray sum in O(N) time and O(1) space.
    """
    if not nums:
        return 0

    current_max = nums[0]
    global_max = nums[0]

    for x in nums[1:]:
        # Decide whether to extend the existing subarray or start fresh from x
        current_max = max(x, current_max + x)
        global_max = max(global_max, current_max)

    return global_max

# Example execution
test_data = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
result = max_subarray_sum(test_data)
print(f"Maximum Subarray Sum: {result}") # Output: 6 -> [4, -1, 2, 1]
\`\`\`

> **Key Takeaway**: When \`current_max + x < x\`, any preceding subarray prefix is a net negative liability, so the algorithm greedily resets the subarray at index \`i\`.`,

  treeshap_lift: `# TreeSHAP Explainability in Hiring Intelligence

**TreeSHAP** (Tree-based *SHapley Additive exPlanations*) provides mathematically grounded, game-theoretic local feature attributions for tree-ensemble models (e.g., LightGBM, XGBoost, Random Forest).

### The Additive Attribution Property

$$\\phi_0 + \\sum_{i=1}^{M} \\phi_i(x) = f(x)$$

Where:
* $f(x)$ is the model's predicted match/readiness score (e.g., **88.4%**).
* $\\phi_0$ is the **base value** (the expected score across the general candidate population, e.g., **62.0%**).
* $\\phi_i$ is the **SHAP attribution** (positive or negative lift) for feature $i$.

---

### Interpreting Positive vs. Negative SHAP Values

* **Positive SHAP Value ($+\\phi_i$)**: Feature pushes candidate readiness **above** the population average.
  * *Example*: Candidate holds 5+ years of verified distributed systems experience -> $+\\text{8.4% SHAP Lift}$.
* **Negative SHAP Value ($-\\phi_i$)**: Feature depresses the candidate score **below** the population baseline.
  * *Example*: Low semantic proximity on cloud infrastructure tokens -> $-\\text{4.2% SHAP Penalty}$.

> **Important Note**: In IntelliHire v3, TreeSHAP attributions are strictly audited to ensure **no protected demographic characteristics** (race, gender, age, nationality) enter the model input tensor.`,

  eeoc_compliance: `# The EEOC 80% Rule (Four-Fifths Rule)

The **Four-Fifths (80%) Rule** is a quantitative test defined by the **U.S. Equal Employment Opportunity Commission (EEOC)** under the *Uniform Guidelines on Employee Selection Procedures (1978)* to identify potential **adverse impact** in employment selection decisions.

### Mathematical Formulation

$$\\text{Adverse Impact Ratio (AIR)} = \\frac{\\text{Selection Rate of Protected Group}}{\\text{Selection Rate of Highest-Selected Group}}$$

* **Compliant Condition**: $\\text{AIR} \\ge 0.80$ (80%)
* **Potential Adverse Impact**: $\\text{AIR} < 0.80$ (triggers mandatory procedural validation).

---

### Audit Example

| Demographic Group | Applicants | Selected | Selection Rate ($SR$) | Adverse Impact Ratio (vs. Benchmark) | Compliance Status |
|---|---|---|---|---|---|
| Majority Group (A) | 200 | 100 | **50.0%** (Benchmark) | 1.00 (100%) | Compliant ✓ |
| Protected Group (B) | 100 | 44 | **44.0%** | $\\frac{44\\%}{50\\%} = 0.88$ (88%) | Compliant ✓ |
| Protected Group (C) | 100 | 36 | **36.0%** | $\\frac{36\\%}{50\\%} = 0.72$ (72%) | Non-Compliant ✗ |

> **Warning / Edge Case**: Group C's ratio of **72%** is below the 80% threshold. IntelliHire's Automated Governance Center flags this anomaly to prevent discriminatory filtering in ATS candidate ranking pipelines.`,

  star_method: `# Mastering the STAR Method for Behavioral Interviews

The **STAR Framework** is the gold standard for structuring behavioral interview responses to demonstrate competencies like leadership, conflict resolution, problem-solving, and resilience.

### The 4 Phases of STAR

1. **S — Situation (15% of time)**: Set the context, environment, company stage, and core challenge.
   * *Example*: *"At Acme Corp during a 3x traffic spike during Black Friday..."*
2. **T — Task (15% of time)**: Clarify your specific responsibility and the target metric.
   * *Example*: *"I was tasked with diagnosing a cascade failure in the payment checkout pipeline."*
3. **A — Action (50% of time)**: Detail your technical execution, leadership decisions, and tools.
   * *Example*: *"I instrumented OpenTelemetry traces, identified a database connection pool starvation bug, and wrote a backpressure throttling middleware in TypeScript."*
4. **R — Result (20% of time)**: Quantify the outcome and key business learnings.
   * *Example*: *"Recovered system p99 latency to 120ms within 45 minutes, saving $85K in transactions, with zero data loss."*

> **Pro Tip / Recommendation**: Spend 50% or more of your total talking time on the **Action** phase. Interviewers want to know *what you personally contributed*, not just the team's general output.`,
};

/**
 * Dispatches queries to the educational/career AI knowledge engine.
 */
export async function queryAssistant(
  userQuery: string,
  onStreamChunk?: (chunk: string) => void
): Promise<string> {
  const queryLower = userQuery.toLowerCase().trim();

  // Guardrail check: Disallow non-educational/non-career requests
  if (
    queryLower.includes("write a song") ||
    queryLower.includes("tell a joke") ||
    queryLower.includes("recipe for cake") ||
    queryLower.includes("who won the game")
  ) {
    return `> **Career Intelligence Guardrail**: I am the **IntelliHire AI Career & Placement Assistant**. I specialize in educational technical concepts, algorithmic problem solving, resume optimization, TreeSHAP model explainability, and EEOC compliance standards. Please ask a career, interview, or technical education question!`;
  }

  // Find matching educational topic or generate dynamic structured response
  let responseText = "";

  if (queryLower.includes("x-y-z") || queryLower.includes("resume") || queryLower.includes("bullet")) {
    responseText = KNOWLEDGE_BASE.xyz_resume;
  } else if (queryLower.includes("kadane") || queryLower.includes("subarray") || queryLower.includes("dynamic programming")) {
    responseText = KNOWLEDGE_BASE.kadane_algo;
  } else if (queryLower.includes("shap") || queryLower.includes("treeshap") || queryLower.includes("explainability") || queryLower.includes("lift")) {
    responseText = KNOWLEDGE_BASE.treeshap_lift;
  } else if (queryLower.includes("eeoc") || queryLower.includes("80%") || queryLower.includes("adverse impact") || queryLower.includes("four-fifths")) {
    responseText = KNOWLEDGE_BASE.eeoc_compliance;
  } else if (queryLower.includes("star") || queryLower.includes("behavioral") || queryLower.includes("interview question")) {
    responseText = KNOWLEDGE_BASE.star_method;
  } else {
    // Dynamic structured response following presentation standards
    responseText = `# Career & Educational Guidance: ${userQuery}

Thank you for your question regarding **${userQuery}**. Here is a structured breakdown:

### Core Principles & Architecture
1. **Understanding the Requirements**: Analyze technical expectations, edge cases, and performance constraints.
2. **Deterministic Implementation**: Develop structured, testable code with minimal memory footprint.
3. **Continuous Verification**: Validate against automated test suites and behavioral metrics.

> **Pro Tip / Recommendation**: In technical assessments, communicate your thought process out loud. State time and space complexity explicitly before writing code.

### Recommended Next Steps
* Review relevant assessment modules in **Coding Sandbox** and **Psychometrics**.
* Optimize your profile provenance in **Structured Profile**.
* Inspect algorithmic matches in **Hybrid ATS Match**.`;
  }

  // Simulate smooth streaming chunk response if callback provided
  if (onStreamChunk) {
    const words = responseText.split(" ");
    let accumulated = "";
    for (let i = 0; i < words.length; i++) {
      accumulated += (i > 0 ? " " : "") + words[i];
      onStreamChunk(accumulated);
      // Fast simulation
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  return responseText;
}
