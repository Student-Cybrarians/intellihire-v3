import * as React from "react";
import { cn } from "@/lib/utils";

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "success" | "warning" | "info" | "purple";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "bg-card text-foreground border-border/80",
    destructive:
      "border-rose-500/40 text-rose-300 [&>svg]:text-rose-400 bg-rose-500/10",
    success:
      "border-emerald-500/40 text-emerald-300 [&>svg]:text-emerald-400 bg-emerald-500/10",
    warning:
      "border-amber-500/40 text-amber-300 [&>svg]:text-amber-400 bg-amber-500/10",
    info:
      "border-sky-500/40 text-sky-300 [&>svg]:text-sky-400 bg-sky-500/10",
    purple:
      "border-purple-500/40 text-purple-300 [&>svg]:text-purple-400 bg-purple-500/10",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(
        "relative w-full rounded-xl border p-4 text-xs [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-2px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 shadow-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-bold leading-none tracking-tight text-xs", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-xs [&_p]:leading-relaxed text-muted-foreground/90 font-normal",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
