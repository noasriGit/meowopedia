import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PullQuote({
  children,
  attribution,
  className,
}: {
  children: ReactNode;
  attribution?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "editorial-pull-quote my-10 not-prose",
        className
      )}
    >
      <blockquote className="relative pl-6 text-2xl font-medium leading-snug tracking-tight text-foreground sm:text-3xl">
        <span
          className="absolute left-0 top-0 h-full w-1 rounded-full"
          style={{ backgroundColor: "var(--theme-accent)" }}
          aria-hidden="true"
        />
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-4 pl-6 text-sm font-medium text-muted-foreground">
          — {attribution}
        </figcaption>
      )}
    </figure>
  );
}
