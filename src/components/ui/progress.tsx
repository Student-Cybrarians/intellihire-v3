import * as React from "react";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    max?: number;
    variant?: "default" | "emerald" | "amber" | "indigo" | "purple";
  }
>(({ className, value = 0, max = 100, variant = "default", ...props }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const barVariants = {
    default: "bg-primary shadow-xs shadow-primary/50",
    emerald: "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/50",
    amber: "bg-gradient-to-r from-amber-500 to-orange-400 shadow-xs shadow-amber-500/50",
    indigo: "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-xs shadow-indigo-500/50",
    purple: "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xs shadow-purple-500/50",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-secondary/80 border border-border/40",
        className
      )}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
          barVariants[variant]
        )}
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
});
Progress.displayName = "Progress";

export { Progress };
