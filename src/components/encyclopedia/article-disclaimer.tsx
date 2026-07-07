import Link from "next/link";
import { AlertTriangle, Info, Stethoscope } from "lucide-react";
import {
  DISCLAIMER_COPY,
  POISON_HELPLINES,
  type DisclaimerTier,
} from "@/config/disclaimers";
import type { Author } from "@/types/content";
import { cn } from "@/lib/utils";

interface ArticleDisclaimerProps {
  tier: DisclaimerTier;
  variant: "compact" | "full";
  medicalReviewer?: Author;
  lastReviewed?: string;
  className?: string;
}

const TIER_ICONS = {
  medical: Stethoscope,
  safety: AlertTriangle,
  general: Info,
} as const;

const TIER_STYLES = {
  medical:
    "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  safety:
    "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
  general:
    "border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100",
} as const;

function formatReviewDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleDisclaimer({
  tier,
  variant,
  medicalReviewer,
  lastReviewed,
  className,
}: ArticleDisclaimerProps) {
  const copy = DISCLAIMER_COPY[tier];
  const Icon = TIER_ICONS[tier];

  if (variant === "compact") {
    return (
      <aside
        role="note"
        aria-label={copy.ariaLabel}
        className={cn(
          "rounded-lg border px-4 py-3 text-sm leading-relaxed not-prose",
          TIER_STYLES[tier],
          className
        )}
      >
        <div className="flex items-start gap-2.5">
          <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            {copy.compact}{" "}
            <Link
              href={copy.link.href}
              className="font-medium underline underline-offset-2 hover:opacity-80"
            >
              {copy.link.label}
            </Link>
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      role="note"
      aria-label={copy.ariaLabel}
      className={cn(
        "rounded-xl border p-5 not-prose",
        TIER_STYLES[tier],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 space-y-3 text-sm leading-relaxed">
          <h2 className="text-base font-semibold">{copy.full.heading}</h2>

          {medicalReviewer && tier === "medical" ? (
            <p className="opacity-90">
              Reviewed by{" "}
              <span className="font-medium">{medicalReviewer.name}</span>
              {medicalReviewer.credentials
                ? ` (${medicalReviewer.credentials})`
                : ""}
              {lastReviewed
                ? ` · Last reviewed ${formatReviewDate(lastReviewed)}`
                : ""}
              . See our{" "}
              <Link
                href="/editorial-standards"
                className="font-medium underline underline-offset-2 hover:opacity-80"
              >
                editorial standards
              </Link>
              .
            </p>
          ) : lastReviewed ? (
            <p className="opacity-90">
              Last reviewed {formatReviewDate(lastReviewed)}.
            </p>
          ) : null}

          {copy.full.paragraphs.map((paragraph) => (
            <p key={paragraph} className="opacity-90">
              {paragraph}
            </p>
          ))}

          {(tier === "medical" || tier === "safety") && (
            <ul className="space-y-1 opacity-90">
              <li>
                <span className="font-medium">{POISON_HELPLINES.aspca.label}</span>
                :{" "}
                <a
                  href={`tel:${POISON_HELPLINES.aspca.phone.replace(/\D/g, "")}`}
                  className="underline underline-offset-2 hover:opacity-80"
                >
                  {POISON_HELPLINES.aspca.phone}
                </a>{" "}
                (fee may apply)
              </li>
              <li>
                <span className="font-medium">
                  {POISON_HELPLINES.petPoison.label}
                </span>
                :{" "}
                <a
                  href={`tel:${POISON_HELPLINES.petPoison.phone.replace(/\D/g, "")}`}
                  className="underline underline-offset-2 hover:opacity-80"
                >
                  {POISON_HELPLINES.petPoison.phone}
                </a>{" "}
                (fee may apply)
              </li>
            </ul>
          )}

          <p>
            <Link
              href={copy.link.href}
              className="font-medium underline underline-offset-2 hover:opacity-80"
            >
              {copy.link.label}
            </Link>
          </p>
        </div>
      </div>
    </aside>
  );
}
