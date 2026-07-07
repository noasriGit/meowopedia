import * as React from "react";
import { cn } from "@/lib/utils";

export const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: "default" | "secondary" | "outline" | "destructive" | "success";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
      {
        "border-transparent bg-primary text-primary-foreground": variant === "default",
        "border-transparent bg-secondary text-secondary-foreground":
          variant === "secondary",
        "border-border text-foreground": variant === "outline",
        "border-transparent bg-destructive text-destructive-foreground":
          variant === "destructive",
        "border-transparent bg-emerald-600 text-white": variant === "success",
      },
      className
    )}
    {...props}
  />
));
Badge.displayName = "Badge";
