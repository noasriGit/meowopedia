import { cn } from "@/lib/utils";

export function StatCard({
  value,
  label,
  detail,
  className,
}: {
  value: string;
  label: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "editorial-stat rounded-2xl border border-border bg-card p-5 not-prose",
        className
      )}
    >
      <p
        className="text-3xl font-bold tracking-tight sm:text-4xl"
        style={{ color: "var(--theme-accent)" }}
      >
        {value}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{label}</p>
      {detail && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  );
}
