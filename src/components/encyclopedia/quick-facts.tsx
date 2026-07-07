import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface QuickFactsProps {
  title?: string;
  facts: Record<string, ReactNode>;
  className?: string;
}

export function QuickFactsCard({
  title = "Quick Facts",
  facts,
  className,
}: QuickFactsProps) {
  return (
    <aside
      className={cn(
        "editorial-card overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div
        className="px-5 py-3"
        style={{ backgroundColor: "var(--theme-accent-muted, var(--muted))" }}
      >
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--theme-accent-foreground, var(--foreground))" }}
        >
          {title}
        </h2>
      </div>
      <dl className="divide-y divide-border/60 px-5">
        {Object.entries(facts).map(([key, value]) => (
          <div
            key={key}
            className="grid grid-cols-[1fr_1.2fr] gap-3 py-3.5 text-sm"
          >
            <dt className="font-medium text-muted-foreground">{key}</dt>
            <dd className="font-semibold text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
