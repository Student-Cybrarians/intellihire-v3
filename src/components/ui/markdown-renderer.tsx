"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/code-block";
import { CalloutCard, CalloutType } from "@/components/ui/callout-card";
import {
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Hash,
  Award,
  Terminal,
} from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  compact?: boolean;
}

/**
 * Robust, high-fidelity Markdown and Rich-Text Parser & Renderer
 * Specifically engineered for AI Assistant educational, career, and technical responses.
 */
export function MarkdownRenderer({
  content,
  className,
  compact = false,
}: MarkdownRendererProps) {
  // Normalize line endings and preprocess
  const normalizedContent = useMemo(() => {
    if (!content) return "";
    return content.replace(/\r\n/g, "\n");
  }, [content]);

  // Parse into structured block elements
  const blocks = useMemo(() => {
    return parseBlocks(normalizedContent);
  }, [normalizedContent]);

  if (!content || content.trim() === "") {
    return null;
  }

  return (
    <div
      className={cn(
        "markdown-content w-full max-w-full overflow-hidden break-words text-xs sm:text-sm leading-relaxed text-slate-200 selection:bg-indigo-500/30",
        compact ? "space-y-2" : "space-y-3",
        className
      )}
      style={{ overflowWrap: "anywhere" }}
    >
      {blocks.map((block, index) => renderBlock(block, index, compact))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Block Parsing Types
// ---------------------------------------------------------------------------

type BlockType =
  | { type: "code"; language: string; code: string; filename?: string }
  | { type: "heading"; level: number; text: string }
  | { type: "callout"; calloutType: CalloutType; title?: string; content: string }
  | { type: "blockquote"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "ordered-list"; items: string[]; startNumber?: number }
  | { type: "unordered-list"; items: string[] }
  | { type: "divider" }
  | { type: "paragraph"; text: string };

function parseBlocks(raw: string): BlockType[] {
  const lines = raw.split("\n");
  const blocks: BlockType[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === "") {
      i++;
      continue;
    }

    // 1. Fenced Code Block: ```lang
    if (trimmed.startsWith("```")) {
      const langMatch = trimmed.match(/^```(\w+)?(?:\s+(.+))?$/);
      const language = langMatch?.[1] || "text";
      const filename = langMatch?.[2]?.trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      blocks.push({
        type: "code",
        language,
        filename,
        code: codeLines.join("\n"),
      });
      continue;
    }

    // 2. Horizontal Divider: --- or *** or ___
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider" });
      i++;
      continue;
    }

    // 3. Headings: #, ##, ###, ####
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      blocks.push({ type: "heading", level, text });
      i++;
      continue;
    }

    // 4. Blockquotes or Callout Quotes: > ...
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const fullQuoteText = quoteLines.join("\n").trim();

      // Check if this blockquote is a structured callout: > **[Type]**: Content or > [Type]: Content
      const calloutMatch = fullQuoteText.match(
        /^(?:💡|📌|⚠️|🎯|🔬|👉)?\s*\*{0,2}(?:\[?(Example|Tip|Pro Tip|Pro Tip \/ Recommendation|Note|Important Note|Important|Warning|Warning \/ Edge Case|Caution|Key Takeaway|Summary|Formula|Math)\]?)\*{0,2}:?\s*([\s\S]*)$/i
      );

      if (calloutMatch) {
        const rawType = calloutMatch[1].toLowerCase();
        const calloutType: CalloutType = mapCalloutType(rawType);
        blocks.push({
          type: "callout",
          calloutType,
          title: calloutMatch[1],
          content: calloutMatch[2].trim(),
        });
      } else {
        blocks.push({ type: "blockquote", text: fullQuoteText });
      }
      continue;
    }

    // 5. Standalone Callout Paragraphs without > : e.g. "**Example:**", "**Tip:**", "💡 Tip:", "📌 Note:"
    const standaloneCalloutMatch = trimmed.match(
      /^(?:💡|📌|⚠️|🎯|🔬|👉)?\s*\*{0,2}(?:\[?(Example|Tip|Pro Tip|Pro Tip \/ Recommendation|Note|Important Note|Important|Warning|Warning \/ Edge Case|Caution|Key Takeaway|Summary|Formula)\]?)\*{0,2}:?\s*([\s\S]*)$/i
    );
    if (standaloneCalloutMatch && !trimmed.startsWith("-") && !trimmed.startsWith("*") && !/^\d+\./.test(trimmed)) {
      const rawType = standaloneCalloutMatch[1].toLowerCase();
      const calloutType: CalloutType = mapCalloutType(rawType);
      const content = standaloneCalloutMatch[2].trim();
      blocks.push({
        type: "callout",
        calloutType,
        title: standaloneCalloutMatch[1],
        content: content || "",
      });
      i++;
      continue;
    }

    // 6. Markdown Table: | Header 1 | Header 2 |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        // line 1 is usually separator |---|---|
        const dataLines = tableLines.slice(1).filter((l) => !/^\|[\s\-:|]+\|$/.test(l));
        const rows = dataLines.map((l) =>
          l
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim())
        );
        blocks.push({ type: "table", headers, rows });
        continue;
      }
    }

    // 7. Ordered List: 1. Item or 1) Item
    if (/^\d+[\.\)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (/^\d+[\.\)]\s+/.test(cur)) {
          items.push(cur.replace(/^\d+[\.\)]\s+/, ""));
          i++;
        } else if (cur === "" && i + 1 < lines.length && /^\d+[\.\)]\s+/.test(lines[i + 1].trim())) {
          // empty line between list items
          i++;
        } else if (lines[i].startsWith("   ") || lines[i].startsWith("\t")) {
          // continuation line of current item
          if (items.length > 0) {
            items[items.length - 1] += "\n" + cur;
          }
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "ordered-list", items });
      continue;
    }

    // 8. Unordered List: * Item or - Item or • Item
    if (/^[\*\-•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (/^[\*\-•]\s+/.test(cur)) {
          items.push(cur.replace(/^[\*\-•]\s+/, ""));
          i++;
        } else if (cur === "" && i + 1 < lines.length && /^[\*\-•]\s+/.test(lines[i + 1].trim())) {
          // empty line between items
          i++;
        } else if (lines[i].startsWith("   ") || lines[i].startsWith("\t")) {
          // continuation line of current item
          if (items.length > 0) {
            items[items.length - 1] += "\n" + cur;
          }
          i++;
        } else {
          break;
        }
      }
      blocks.push({ type: "unordered-list", items });
      continue;
    }

    // 9. Standard Paragraph (accumulate until next block boundary or blank line)
    const paraLines: string[] = [];
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

function mapCalloutType(typeStr: string): CalloutType {
  const s = typeStr.toLowerCase();
  if (s.includes("example") || s.includes("e.g")) return "example";
  if (s.includes("tip")) return "tip";
  if (s.includes("warn") || s.includes("caution")) return "warning";
  if (s.includes("takeaway") || s.includes("summary")) return "takeaway";
  if (s.includes("formula") || s.includes("math")) return "formula";
  return "note";
}

// ---------------------------------------------------------------------------
// Block Rendering Engine
// ---------------------------------------------------------------------------

function renderBlock(block: BlockType, index: number, compact: boolean): React.ReactNode {
  switch (block.type) {
    case "code":
      return (
        <CodeBlock
          key={index}
          code={block.code}
          language={block.language}
          filename={block.filename}
          showLineNumbers={block.code.split("\n").length > 3}
        />
      );

    case "heading": {
      const { level, text } = block;
      if (level === 1) {
        return (
          <h1
            key={index}
            className="text-base sm:text-lg font-black tracking-tight text-white mt-4 mb-2 pb-1.5 border-b border-white/10 flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-primary inline-block" />
            <span>{renderInline(text)}</span>
          </h1>
        );
      }
      if (level === 2) {
        return (
          <h2
            key={index}
            className="text-sm sm:text-base font-bold tracking-tight text-slate-100 mt-3.5 mb-1.5 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block" />
            <span>{renderInline(text)}</span>
          </h2>
        );
      }
      if (level === 3) {
        return (
          <h3
            key={index}
            className="text-xs sm:text-sm font-bold text-indigo-300 mt-3 mb-1 flex items-center gap-1.5"
          >
            <ChevronRight className="h-3 w-3 text-indigo-400" />
            <span>{renderInline(text)}</span>
          </h3>
        );
      }
      return (
        <h4
          key={index}
          className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2.5 mb-1"
        >
          {renderInline(text)}
        </h4>
      );
    }

    case "callout":
      return (
        <CalloutCard
          key={index}
          type={block.calloutType}
          title={block.title}
        >
          <div className="space-y-1">
            {block.content.split("\n").map((line, lIdx) => (
              <p key={lIdx} className="leading-relaxed">
                {renderInline(line)}
              </p>
            ))}
          </div>
        </CalloutCard>
      );

    case "blockquote":
      return (
        <blockquote
          key={index}
          className="my-2.5 rounded-r-xl border-l-2 border-indigo-500/70 bg-indigo-950/20 px-3.5 py-2 text-xs sm:text-sm italic text-slate-300/95 space-y-1 shadow-inner backdrop-blur-xs"
        >
          {block.text.split("\n").map((line, lIdx) => (
            <p key={lIdx} className="leading-relaxed">
              {renderInline(line)}
            </p>
          ))}
        </blockquote>
      );

    case "table":
      return (
        <div
          key={index}
          className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-slate-950/70 shadow-md min-w-0 max-w-full"
        >
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/90 text-slate-200">
                {block.headers.map((h, hIdx) => (
                  <th
                    key={hIdx}
                    className="px-3.5 py-2 font-mono font-bold text-[11px] uppercase tracking-wider text-indigo-300"
                  >
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {block.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="transition-colors even:bg-white/[0.02] hover:bg-indigo-500/10"
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-slate-300 leading-relaxed align-top">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "ordered-list":
      return (
        <ol key={index} className="my-2.5 space-y-2 pl-0.5">
          {block.items.map((item, itIdx) => (
            <li key={itIdx} className="flex items-start gap-2.5 group">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold font-mono mt-0.5 shadow-xs">
                {itIdx + 1}
              </span>
              <div className="text-slate-200/95 leading-relaxed text-xs sm:text-sm pt-0.5 flex-1 break-words">
                {item.split("\n").map((line, lIdx) => (
                  <span key={lIdx} className={lIdx > 0 ? "block mt-1 pl-1 text-slate-400" : ""}>
                    {renderInline(line)}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      );

    case "unordered-list":
      return (
        <ul key={index} className="my-2.5 space-y-1.5 pl-0.5">
          {block.items.map((item, itIdx) => (
            <li key={itIdx} className="flex items-start gap-2.5 group">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0 mt-2 shadow-xs group-hover:scale-125 transition-transform" />
              <div className="text-slate-200/95 leading-relaxed text-xs sm:text-sm flex-1 break-words">
                {item.split("\n").map((line, lIdx) => (
                  <span key={lIdx} className={lIdx > 0 ? "block mt-1 pl-1 text-slate-400" : ""}>
                    {renderInline(line)}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      );

    case "divider":
      return (
        <hr
          key={index}
          className="my-4 border-t border-white/10"
        />
      );

    case "paragraph":
    default:
      return (
        <p
          key={index}
          className="text-slate-200/90 leading-relaxed text-xs sm:text-sm my-1.5 break-words"
        >
          {renderInline(block.text)}
        </p>
      );
  }
}

// ---------------------------------------------------------------------------
// Inline Rich-Text Parsing (Bold, Underline, Marks, Badges, Links, Symbols)
// ---------------------------------------------------------------------------

export function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // 1. Symbol beautification (arrows, checkmarks, etc.)
  let processed = text
    .replace(/->/g, "→")
    .replace(/=>/g, "⇒")
    .replace(/<-/g, "←")
    .replace(/<=>/g, "⇔");

  // Tokenize the string using regex patterns for inline markers
  // Supported tokens:
  // - Code: `code`
  // - Bold: **bold** or __bold__ or <strong>text</strong>
  // - Underline: <u>text</u> or <ins>text</ins>
  // - Highlight: <mark>text</mark> or ==text==
  // - Italic: *italic* or _italic_ or <em>text</em>
  // - Strikethrough: ~~text~~
  // - Link: [text](url)
  // - Badge: [[badge]] or [tag]
  // - Symbols: ✓, ✔, ✗, ✘, [x], [ ]

  const tokenPattern =
    /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|<u>[\s\S]*?<\/u>|<ins>[\s\S]*?<\/ins>|<mark>[\s\S]*?<\/mark>|==[^=]+==|\*[^*]+\*|_[^_]+_|~~[^~]+~~|\[[^\]]+\]\([^\)]+\)|\[x\]|\[\s\]|✓|✔|✗|✘)/g;

  const parts = processed.split(tokenPattern);

  return (
    <>
      {parts.map((part, pIdx) => {
        if (!part) return null;

        // Inline Code: `...`
        if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
          const codeText = part.slice(1, -1);
          return (
            <code
              key={pIdx}
              className="mx-0.5 rounded-md border border-indigo-500/30 bg-slate-900/90 px-1.5 py-0.5 font-mono text-[11px] sm:text-xs font-semibold text-indigo-300 shadow-xs"
            >
              {codeText}
            </code>
          );
        }

        // Bold: **...** or __...__
        if (
          (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
          (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
        ) {
          const inner = part.slice(2, -2);
          return (
            <strong
              key={pIdx}
              className="font-bold text-white tracking-tight"
            >
              {renderInline(inner)}
            </strong>
          );
        }

        // Underline: <u>...</u> or <ins>...</ins>
        if (
          (part.startsWith("<u>") && part.endsWith("</u>")) ||
          (part.startsWith("<ins>") && part.endsWith("</ins>"))
        ) {
          const inner = part.replace(/^<u(?:ns)?>|<\/u(?:ns)?>$/gi, "").replace(/^<ins>|<\/ins>$/gi, "");
          return (
            <span
              key={pIdx}
              className="underline decoration-indigo-400 decoration-2 underline-offset-4 font-semibold text-slate-100"
            >
              {renderInline(inner)}
            </span>
          );
        }

        // Highlight: <mark>...</mark> or ==...==
        if (
          (part.startsWith("<mark>") && part.endsWith("</mark>")) ||
          (part.startsWith("==") && part.endsWith("==") && part.length >= 4)
        ) {
          const inner = part.replace(/^<mark>|<\/mark>$/gi, "").replace(/^==|==$/g, "");
          return (
            <mark
              key={pIdx}
              className="rounded bg-indigo-500/25 px-1 py-0.5 font-semibold text-indigo-200 border border-indigo-500/40"
            >
              {renderInline(inner)}
            </mark>
          );
        }

        // Strikethrough: ~~...~~
        if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
          const inner = part.slice(2, -2);
          return (
            <del key={pIdx} className="line-through text-slate-500">
              {renderInline(inner)}
            </del>
          );
        }

        // Italic: *...* or _..._
        if (
          (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
          (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
        ) {
          const inner = part.slice(1, -1);
          return (
            <em key={pIdx} className="italic text-slate-300">
              {renderInline(inner)}
            </em>
          );
        }

        // Link: [label](url)
        const linkMatch = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
        if (linkMatch) {
          const label = linkMatch[1];
          const url = linkMatch[2];
          const isExternal = url.startsWith("http");

          if (isExternal) {
            return (
              <a
                key={pIdx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              >
                <span>{label}</span>
                <ExternalLink className="h-3 w-3 inline-block" />
              </a>
            );
          }

          return (
            <Link
              key={pIdx}
              href={url}
              className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              <span>{label}</span>
            </Link>
          );
        }

        // Checkmarks & X Marks
        if (part === "✓" || part === "✔" || part === "[x]") {
          return (
            <span
              key={pIdx}
              className="inline-flex items-center justify-center font-bold text-emerald-400 font-mono text-xs mx-0.5"
            >
              ✓
            </span>
          );
        }

        if (part === "✗" || part === "✘" || part === "[ ]") {
          return (
            <span
              key={pIdx}
              className="inline-flex items-center justify-center font-bold text-slate-500 font-mono text-xs mx-0.5"
            >
              ○
            </span>
          );
        }

        // Plain Text
        return <span key={pIdx}>{part}</span>;
      })}
    </>
  );
}
