import type { ReactNode } from "react";
import { AlertTriangle, Info, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "warning" | "danger" | "vet" | "expert";

const variants: Record<
  CalloutVariant,
  { icon: typeof Info; className: string; label: string }
> = {
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
    label: "Note",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    label: "Warning",
  },
  danger: {
    icon: AlertTriangle,
    className: "border-red-200 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100",
    label: "Health Alert",
  },
  vet: {
    icon: Stethoscope,
    className: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    label: "Vet Tip",
  },
  expert: {
    icon: Info,
    className: "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
    label: "Expert Note",
  },
};

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Callout({
  variant = "info",
  title,
  children,
  className,
}: CalloutProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <aside
      className={cn(
        "my-6 rounded-xl border p-5 not-prose",
        config.className,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{title ?? config.label}</p>
          <div className="mt-2 text-sm leading-relaxed opacity-90">
            {children}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function HealthAlertBox(props: Omit<CalloutProps, "variant">) {
  return <Callout variant="danger" {...props} />;
}

export function VetTip(props: Omit<CalloutProps, "variant">) {
  return <Callout variant="vet" {...props} />;
}

export function ExpertNote(props: Omit<CalloutProps, "variant">) {
  return <Callout variant="expert" {...props} />;
}

export function WarningBox(props: Omit<CalloutProps, "variant">) {
  return <Callout variant="warning" {...props} />;
}

export function DefinitionBox({
  term,
  children,
}: {
  term: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-6 rounded-xl border border-border bg-muted/40 p-5 not-prose">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Definition
      </p>
      <p className="mt-2 text-lg font-semibold">{term}</p>
      <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </aside>
  );
}
