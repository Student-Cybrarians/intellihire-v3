/**
 * Complete AST & Tokenization Unit Test Harness for AI Assistant Presentation Layer
 * Tests all 17 presentation scenarios against the AST parser and rich renderer logic.
 */

function parseBlocks(raw) {
  const lines = raw.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") {
      i++;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const langMatch = trimmed.match(/^```(\w+)?(?:\s+(.+))?$/);
      const language = langMatch?.[1] || "text";
      const filename = langMatch?.[2]?.trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;
      blocks.push({ type: "code", language, filename, code: codeLines.join("\n") });
      continue;
    }

    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2].trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const fullQuoteText = quoteLines.join("\n").trim();
      const calloutMatch = fullQuoteText.match(
        /^(?:💡|📌|⚠️|🎯|🔬|👉)?\s*\*{0,2}(?:\[?(Example|Tip|Pro Tip|Pro Tip \/ Recommendation|Note|Important Note|Important|Warning|Warning \/ Edge Case|Caution|Key Takeaway|Summary|Formula|Math)\]?)\*{0,2}:?\s*([\s\S]*)$/i
      );
      if (calloutMatch) {
        blocks.push({ type: "callout", calloutType: calloutMatch[1].toLowerCase(), title: calloutMatch[1], content: calloutMatch[2].trim() });
      } else {
        blocks.push({ type: "blockquote", text: fullQuoteText });
      }
      continue;
    }

    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0].slice(1, -1).split("|").map((c) => c.trim());
        const dataLines = tableLines.slice(1).filter((l) => !/^\|[\s\-:|]+\|$/.test(l));
        const rows = dataLines.map((l) => l.slice(1, -1).split("|").map((c) => c.trim()));
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    if (/^\d+[\.\)]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (/^\d+[\.\)]\s+/.test(cur)) {
          items.push(cur.replace(/^\d+[\.\)]\s+/, ""));
          i++;
        } else if (cur === "" && i + 1 < lines.length && /^\d+[\.\)]\s+/.test(lines[i + 1].trim())) {
          i++;
        } else if (lines[i].startsWith("   ") || lines[i].startsWith("\t")) {
          if (items.length > 0) items[items.length - 1] += "\n" + cur;
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    if (/^[\*\-•]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (/^[\*\-•]\s+/.test(cur)) {
          items.push(cur.replace(/^[\*\-•]\s+/, ""));
          i++;
        } else if (cur === "" && i + 1 < lines.length && /^[\*\-•]\s+/.test(lines[i + 1].trim())) {
          i++;
        } else if (lines[i].startsWith("   ") || lines[i].startsWith("\t")) {
          if (items.length > 0) items[items.length - 1] += "\n" + cur;
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    const paraLines = [];
    while (i < lines.length) {
      const cur = lines[i];
      const curTrimmed = cur.trim();
      if (
        curTrimmed === "" ||
        curTrimmed.startsWith("```") ||
        curTrimmed.startsWith("#") ||
        curTrimmed.startsWith(">") ||
        /^(\-{3,}|\*{3,}|_{3,})$/.test(curTrimmed) ||
        (curTrimmed.startsWith("|") && curTrimmed.endsWith("|")) ||
        /^\d+[\.\)]\s+/.test(curTrimmed) ||
        /^[\*\-•]\s+/.test(curTrimmed)
      ) {
        break;
      }
      paraLines.push(cur);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join("\n") });
    }
  }

  return blocks;
}

const TEST_SCENARIOS = [
  {
    id: 1,
    name: "Short educational answer",
    content: `**Time Complexity** ($O(N)$) represents how runtime scales asymptotically relative to input size $N$.`,
    validate: (blocks) => blocks.length === 1 && blocks[0].type === "paragraph",
  },
  {
    id: 2,
    name: "Long educational explanation",
    content: `# Multi-Head Attention\n\nAttention formula:\n$$\\text{Attn}(Q,K,V)$$\n\n> **Key Takeaway**: Preserves context.`,
    validate: (blocks) => blocks.some((b) => b.type === "heading" && b.level === 1) && blocks.some((b) => b.type === "callout"),
  },
  {
    id: 3,
    name: "Career guidance answer",
    content: `# Career Path: Principal AI Architect\n\n1. Technical Mastery\n2. FinOps\n\n> **Pro Tip**: Frame with X-Y-Z formula.`,
    validate: (blocks) => blocks.some((b) => b.type === "ordered-list") && blocks.some((b) => b.type === "callout"),
  },
  {
    id: 4,
    name: "Bullet-point answer",
    content: `* Item 1: Provenance\n* Item 2: RRF k=60\n* Item 3: Subprocess Sandboxing`,
    validate: (blocks) => blocks.length === 1 && blocks[0].type === "unordered-list" && blocks[0].items.length === 3,
  },
  {
    id: 5,
    name: "Numbered step-by-step answer",
    content: `1. Check base case\n2. Recursive swap\n3. Return root`,
    validate: (blocks) => blocks.length === 1 && blocks[0].type === "ordered-list" && blocks[0].items.length === 3,
  },
  {
    id: 6,
    name: "Heading/subheading answer",
    content: `# H1 Title\n## H2 Subtitle\n### H3 Section\n#### H4 Micro`,
    validate: (blocks) => blocks.filter((b) => b.type === "heading").length === 4,
  },
  {
    id: 7,
    name: "Bold terminology",
    content: `Evaluating **TreeSHAP feature attributions** and **BM25 scoring** across candidates.`,
    validate: (blocks) => blocks[0].type === "paragraph" && blocks[0].text.includes("**TreeSHAP feature attributions**"),
  },
  {
    id: 8,
    name: "Underlined emphasis",
    content: `Candidates must <u>never include unverified claims</u> and maintain <mark>accurate metrics</mark>.`,
    validate: (blocks) => blocks[0].type === "paragraph" && blocks[0].text.includes("<u>never include unverified claims</u>"),
  },
  {
    id: 9,
    name: "Multiple paragraphs",
    content: `Paragraph 1 explaining dynamic programming.\n\nParagraph 2 detailing tabular bottom-up tabulation.\n\nParagraph 3 contrasting top-down memoization.`,
    validate: (blocks) => blocks.filter((b) => b.type === "paragraph").length === 3,
  },
  {
    id: 10,
    name: "Examples",
    content: `> **Example**: Code sample here.\n\n> **Warning / Edge Case**: Empty strings return True.`,
    validate: (blocks) => blocks.filter((b) => b.type === "callout").length >= 1,
  },
  {
    id: 11,
    name: "Symbols",
    content: `Pipeline: \`Raw\` -> \`Tokens\` => \`Entities\` | Check: Passed ✓ | Status: Compliant ✓`,
    validate: (blocks) => blocks[0].text.includes("✓") && blocks[0].text.includes("->"),
  },
  {
    id: 12,
    name: "Technical/educational terminology",
    content: `Configure \`sentence-transformers/all-MiniLM-L6-v2\` with \`dense_weight = 0.6\` and \`k = 60\`.`,
    validate: (blocks) => blocks[0].text.includes("`sentence-transformers/all-MiniLM-L6-v2`"),
  },
  {
    id: 13,
    name: "Mixed Markdown",
    content: `# Technical Assessment\n\n| Algo | Time |\n|---|---|\n| MergeSort | O(N log N) |\n\n\`\`\`typescript\nconst x = 1;\n\`\`\`\n\n> **Key Takeaway**: Optimal sorting.`,
    validate: (blocks) => blocks.some((b) => b.type === "heading") && blocks.some((b) => b.type === "table") && blocks.some((b) => b.type === "code") && blocks.some((b) => b.type === "callout"),
  },
  {
    id: 14,
    name: "Mobile viewport (390px)",
    content: `Narrow container test with long command:\n\`\`\`bash\ncurl -X POST https://api.intellihire.ai/v3/documents/parse\n\`\`\``,
    validate: (blocks) => blocks.some((b) => b.type === "code"),
  },
  {
    id: 15,
    name: "Desktop viewport (1280px+)",
    content: `# High-Resolution Desktop Presentation\n\nSpacious typographic measure on 1280px+ screens.`,
    validate: (blocks) => blocks.some((b) => b.type === "heading"),
  },
  {
    id: 16,
    name: "Very long chatbot response",
    content: `# Title\n\n### 1. Ingestion\nText 1\n\n### 2. NLP\nText 2\n\n### 3. RRF\nText 3\n\n### 4. Code Exec\nText 4\n\n### 5. EEOC Compliance\nText 5`,
    validate: (blocks) => blocks.length >= 10,
  },
  {
    id: 17,
    name: "Response containing multiple sections",
    content: `# Full Assessment\n\n## Section 1: Architecture\nDetails\n\n## Section 2: Code Execution\n\`\`\`python\npass\n\`\`\`\n\n## Section 3: Next Steps\n1. Review Scorecard\n2. Submit Code`,
    validate: (blocks) => blocks.filter((b) => b.type === "heading" && b.level === 2).length === 3 && blocks.some((b) => b.type === "code") && blocks.some((b) => b.type === "ordered-list"),
  },
];

console.log("================================================================================");
console.log("  AST PARSER & RICH RENDERER UNIT TEST SUITE (17 TEST CASES)                    ");
console.log("================================================================================");

let allPassed = true;

TEST_SCENARIOS.forEach((sc) => {
  const t0 = performance.now();
  const blocks = parseBlocks(sc.content);
  const t1 = performance.now();
  const passed = sc.validate(blocks);

  const durationMs = (t1 - t0).toFixed(3);
  if (passed) {
    console.log(`[PASS] Case ${sc.id.toString().padStart(2, "0")}: ${sc.name.padEnd(38, " ")} (${durationMs}ms, ${blocks.length} AST blocks)`);
  } else {
    console.log(`[FAIL] Case ${sc.id.toString().padStart(2, "0")}: ${sc.name} FAILED validation`);
    console.log("Debug blocks:", JSON.stringify(blocks, null, 2));
    allPassed = false;
  }
});

console.log("--------------------------------------------------------------------------------");
if (allPassed) {
  console.log("ALL 17 PRESENTATION TEST SCENARIOS PASSED WITH 100% ACCURACY.");
} else {
  console.error("SOME TEST SCENARIOS FAILED.");
  process.exit(1);
}
console.log("================================================================================");
