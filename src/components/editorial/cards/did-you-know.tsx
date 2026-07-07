import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

export function DidYouKnow({
  children,
  title = "Did You Know?",
  className,
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "editorial-card my-8 overflow-hidden rounded-2xl border border-border bg-card not-prose",
        className
      )}
    >
      <div className="flex items-stretch">
        <div
          className="flex w-14 shrink-0 items-center justify-center sm:w-16"
          style={{ backgroundColor: "var(--theme-accent-muted)" }}
        >
          <Lightbulb
            className="h-6 w-6"
            style={{ color: "var(--theme-accent)" }}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 p-5 sm:p-6">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--theme-accent)" }}
          >
            {title}
          </p>
          <div className="mt-2 text-base leading-relaxed text-foreground/90">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}
