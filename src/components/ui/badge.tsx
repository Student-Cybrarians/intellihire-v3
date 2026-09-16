import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning"
    | "info"
    | "purple";
  dot?: boolean;
}

function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "border-primary/40 bg-primary/15 text-primary-foreground font-semibold shadow-xs",
    secondary:
      "border-border/80 bg-secondary/70 text-secondary-foreground",
    destructive:
      "border-rose-500/30 bg-rose-500/15 text-rose-300 font-semibold",
    outline:
      "text-foreground border-border/80 bg-card/40",
    success:
      "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-semibold",
    warning:
      "border-amber-500/30 bg-amber-500/15 text-amber-300 font-semibold",
    info:
      "border-sky-500/30 bg-sky-500/15 text-sky-300 font-semibold",
    purple:
      "border-purple-500/30 bg-purple-500/15 text-purple-300 font-semibold",
  };

  const dotColor = {
    default: "bg-primary",
    secondary: "bg-muted-foreground",
    destructive: "bg-rose-400",
    outline: "bg-foreground",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    info: "bg-sky-400",
    purple: "bg-purple-400",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full animate-pulse", dotColor[variant])}
        />
      )}
      {children}
    </div>
  );
}

export { Badge };
