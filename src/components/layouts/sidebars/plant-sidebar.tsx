import { QuickFactsCard } from "@/components/encyclopedia/quick-facts";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/content";

interface PlantData {
  toxicityLevel?: "none" | "mild" | "moderate" | "severe" | "fatal";
  toxicParts?: string[];
  indoorOutdoor?: string;
}

const toxicityConfig = {
  none: { label: "Non-Toxic", variant: "success" as const },
  mild: { label: "Mild Toxicity", variant: "secondary" as const },
  moderate: { label: "Moderate Toxicity", variant: "outline" as const },
  severe: { label: "Severe Toxicity", variant: "destructive" as const },
  fatal: { label: "Potentially Fatal", variant: "destructive" as const },
};

export function PlantSidebar({ article }: { article: Article }) {
  const data = (article.data ?? {}) as PlantData;
  const toxicity = data.toxicityLevel
    ? toxicityConfig[data.toxicityLevel]
    : null;

  const facts: Record<string, React.ReactNode> = {};
  if (data.indoorOutdoor) facts["Environment"] = data.indoorOutdoor;
  if (data.toxicParts?.length) facts["Toxic Parts"] = data.toxicParts.join(", ");

  return (
    <>
      {toxicity && (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Poison Level
          </p>
          <Badge variant={toxicity.variant} className="mt-3 px-4 py-1 text-base">
            {toxicity.label}
          </Badge>
        </div>
      )}
      <QuickFactsCard title="Plant Facts" facts={facts} />
    </>
  );
}
