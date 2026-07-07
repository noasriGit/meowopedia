import { QuickFactsCard } from "@/components/encyclopedia/quick-facts";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/content";

interface FoodData {
  safety?: "safe" | "moderate" | "toxic" | "avoid";
  category?: string;
  servingSize?: string;
  calories?: string;
  toxicCompound?: string;
}

const safetyConfig = {
  safe: { label: "Safe", variant: "success" as const },
  moderate: { label: "Moderate", variant: "secondary" as const },
  toxic: { label: "Toxic", variant: "destructive" as const },
  avoid: { label: "Avoid", variant: "destructive" as const },
};

export function FoodSidebar({ article }: { article: Article }) {
  const data = (article.data ?? {}) as FoodData;
  const safety = data.safety ? safetyConfig[data.safety] : null;

  const facts: Record<string, React.ReactNode> = {};
  if (data.category) facts["Category"] = data.category;
  if (data.servingSize) facts["Serving Size"] = data.servingSize;
  if (data.calories) facts["Calories"] = data.calories;
  if (data.toxicCompound) facts["Toxic Compound"] = data.toxicCompound;

  return (
    <>
      {safety && (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Can Cats Eat It?
          </p>
          <Badge variant={safety.variant} className="mt-3 px-4 py-1 text-base">
            {safety.label}
          </Badge>
        </div>
      )}
      <QuickFactsCard title="Nutrition Facts" facts={facts} />
    </>
  );
}
