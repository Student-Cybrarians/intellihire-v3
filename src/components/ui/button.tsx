import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "glow"
    | "gradient"
    | "glass";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variantStyles = {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20",
      glow:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/40",
      gradient:
        "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-md shadow-indigo-500/20",
      glass:
        "bg-slate-800/60 backdrop-blur-md border border-white/10 text-foreground hover:bg-slate-700/70 hover:border-white/20 shadow-sm",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm shadow-destructive/20",
      outline:
        "border border-border/80 bg-background/50 hover:bg-secondary/60 hover:text-foreground hover:border-primary/50",
      secondary:
        "bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border/50",
      ghost:
        "hover:bg-secondary/70 hover:text-foreground",
      link:
        "text-primary underline-offset-4 hover:underline",
    };

    const sizeStyles = {
      xs: "h-7 rounded-md px-2 text-[11px]",
      sm: "h-8 rounded-md px-3 text-xs",
      default: "h-9.5 px-4 py-2 text-xs font-semibold",
      lg: "h-11 rounded-lg px-6 text-sm font-semibold",
      icon: "h-9 w-9",
    };

    return (
      <button
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
