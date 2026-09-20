"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({
  code,
  language = "text",
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const cleanCode = code.trim();
  const normalizedLang = (language || "text").toLowerCase().trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy mechanism
      const textArea = document.createElement("textarea");
      textArea.value = cleanCode;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // silent
      }
      document.body.removeChild(textArea);
    }
  };

  const lines = cleanCode.split("\n");

  const getLanguageLabel = (lang: string): string => {
    const map: Record<string, string> = {
      py: "PYTHON",
      python: "PYTHON",
      ts: "TYPESCRIPT",
      typescript: "TYPESCRIPT",
      js: "JAVASCRIPT",
      javascript: "JAVASCRIPT",
      tsx: "REACT TSX",
      jsx: "REACT JSX",
      go: "GO",
      golang: "GO",
      cpp: "C++",
      "c++": "C++",
      c: "C",
      rust: "RUST",
      rs: "RUST",
      sql: "SQL",
      bash: "BASH",
      sh: "SHELL",
      shell: "SHELL",
      zsh: "ZSH",
      json: "JSON",
      yaml: "YAML",
      yml: "YAML",
      markdown: "MARKDOWN",
      md: "MARKDOWN",
      html: "HTML",
      css: "CSS",
    };
    return map[lang] || lang.toUpperCase();
  };

  return (
    <div
      className={cn(
        "my-3.5 rounded-xl border border-white/10 bg-slate-950/90 shadow-xl overflow-hidden min-w-0 max-w-full group/code",
        className
      )}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm text-[11px] font-mono select-none">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500/80 inline-block" />
            <span className="h-2 w-2 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-white/20 ml-1">|</span>
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold tracking-wider">
            {normalizedLang === "bash" || normalizedLang === "sh" ? (
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            ) : (
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
            )}
            <span>{filename || getLanguageLabel(normalizedLang)}</span>
          </div>
        </div>

        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Code copied to clipboard" : "Copy code to clipboard"}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            copied
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
              : "bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-white/5"
          )}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400 group-hover/code:text-slate-200" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-3.5 overflow-x-auto text-[11px] sm:text-xs font-mono leading-relaxed text-slate-200 selection:bg-indigo-500/30">
        {showLineNumbers ? (
          <table className="w-full border-collapse">
            <tbody>
              {lines.map((line, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="pr-3 text-right text-slate-600 select-none font-mono text-[10px] w-8 align-top">
                    {idx + 1}
                  </td>
                  <td className="pl-2 whitespace-pre text-slate-200 break-normal">
                    {line || " "}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="m-0 p-0 whitespace-pre overflow-x-auto font-mono text-slate-200">
            <code>{cleanCode}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
