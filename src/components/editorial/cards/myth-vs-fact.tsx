import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MythVsFact({
  myth,
  fact,
  className,
}: {
  myth: ReactNode;
  fact: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "editorial-card my-8 grid gap-4 rounded-2xl border border-border bg-card p-5 not-prose sm:grid-cols-2 sm:p-6",
        className
      )}
    >
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
          Myth
        </p>
        <div className="mt-2 text-sm leading-relaxed text-amber-950/90 dark:text-amber-50/90">
          {myth}
        </div>
      </div>
      <div
        className="rounded-xl border p-4"
        style={{
          borderColor: "color-mix(in srgb, var(--theme-accent) 25%, transparent)",
          backgroundColor: "color-mix(in srgb, var(--theme-accent-muted) 60%, transparent)",
        }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--theme-accent)" }}
        >
          Fact
        </p>
        <div className="mt-2 text-sm leading-relaxed text-foreground/90">
          {fact}
        </div>
      </div>
    </div>
  );
}
