"use client";

import React from "react";
import {
  Lightbulb,
  AlertTriangle,
  Info,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Zap,
  Target,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type CalloutType =
  | "example"
  | "tip"
  | "note"
  | "warning"
  | "takeaway"
  | "info"
  | "formula";

interface CalloutCardProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function CalloutCard({
  type = "note",
  title,
  children,
  className,
}: CalloutCardProps) {
  const configs: Record<
    CalloutType,
    {
      icon: React.ComponentType<{ className?: string }>;
      defaultTitle: string;
      borderClass: string;
      bgClass: string;
      titleColorClass: string;
      iconBgClass: string;
      iconColorClass: string;
      badgeClass: string;
    }
  > = {
    example: {
      icon: FlaskConical,
      defaultTitle: "Concrete Example",
      borderClass: "border-amber-500/35",
      bgClass: "bg-amber-950/20",
      titleColorClass: "text-amber-300",
      iconBgClass: "bg-amber-500/15 border-amber-500/30",
      iconColorClass: "text-amber-400",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    },
    tip: {
      icon: Zap,
      defaultTitle: "Pro Tip / Recommendation",
      borderClass: "border-emerald-500/35",
      bgClass: "bg-emerald-950/20",
      titleColorClass: "text-emerald-300",
      iconBgClass: "bg-emerald-500/15 border-emerald-500/30",
      iconColorClass: "text-emerald-400",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    },
    note: {
      icon: Info,
      defaultTitle: "Important Note",
      borderClass: "border-blue-500/35",
      bgClass: "bg-blue-950/20",
      titleColorClass: "text-blue-300",
      iconBgClass: "bg-blue-500/15 border-blue-500/30",
      iconColorClass: "text-blue-400",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    info: {
      icon: BookOpen,
      defaultTitle: "Educational Context",
      borderClass: "border-indigo-500/35",
      bgClass: "bg-indigo-950/20",
      titleColorClass: "text-indigo-300",
      iconBgClass: "bg-indigo-500/15 border-indigo-500/30",
      iconColorClass: "text-indigo-400",
      badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    },
    warning: {
      icon: AlertTriangle,
      defaultTitle: "Caution / Edge Case",
      borderClass: "border-rose-500/35",
      bgClass: "bg-rose-950/20",
      titleColorClass: "text-rose-300",
      iconBgClass: "bg-rose-500/15 border-rose-500/30",
      iconColorClass: "text-rose-400",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
    takeaway: {
      icon: Target,
      defaultTitle: "Key Takeaway",
      borderClass: "border-purple-500/35",
      bgClass: "bg-purple-950/20",
      titleColorClass: "text-purple-300",
      iconBgClass: "bg-purple-500/15 border-purple-500/30",
      iconColorClass: "text-purple-400",
      badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    },
    formula: {
      icon: Award,
      defaultTitle: "Mathematical Definition / Heuristic",
      borderClass: "border-cyan-500/35",
      bgClass: "bg-cyan-950/20",
      titleColorClass: "text-cyan-300",
      iconBgClass: "bg-cyan-500/15 border-cyan-500/30",
      iconColorClass: "text-cyan-400",
      badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    },
  };

  const config = configs[type] || configs.note;
  const IconComponent = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className={cn(
        "my-3.5 rounded-xl border p-3.5 sm:p-4 backdrop-blur-md shadow-md transition-all text-xs sm:text-sm",
        config.borderClass,
        config.bgClass,
        className
      )}
    >
      {/* Callout Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border",
            config.iconBgClass,
            config.iconColorClass
          )}
        >
          <IconComponent className="h-3.5 w-3.5" />
        </div>
        <span
          className={cn(
            "font-bold text-xs sm:text-sm tracking-tight",
            config.titleColorClass
          )}
        >
          {displayTitle}
        </span>
      </div>

      {/* Callout Body */}
      <div className="text-slate-200/95 leading-relaxed text-xs sm:text-[13px] pl-0 sm:pl-8 space-y-1.5 break-words overflow-hidden">
        {children}
      </div>
    </div>
  );
}
