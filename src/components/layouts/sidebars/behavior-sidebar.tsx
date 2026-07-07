import { QuickFactsCard } from "@/components/encyclopedia/quick-facts";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/content";

interface BehaviorData {
  normalRange?: string;
  urgency?: "low" | "medium" | "high";
  commonTriggers?: string[];
  relatedSounds?: string[];
}

const urgencyConfig = {
  low: { label: "Usually Normal", variant: "success" as const },
  medium: { label: "Monitor Closely", variant: "secondary" as const },
  high: { label: "May Need Attention", variant: "destructive" as const },
};

export function BehaviorSidebar({ article }: { article: Article }) {
  const data = (article.data ?? {}) as BehaviorData;
  const urgency = data.urgency ? urgencyConfig[data.urgency] : null;

  const facts: Record<string, React.ReactNode> = {};
  if (data.normalRange) facts["Normal Range"] = data.normalRange;

  return (
    <>
      {urgency && (
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Urgency
          </p>
          <Badge variant={urgency.variant} className="mt-3 px-4 py-1 text-base">
            {urgency.label}
          </Badge>
        </div>
      )}
      <QuickFactsCard title="Behavior Profile" facts={facts} />
      {data.commonTriggers?.length ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Common Triggers
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.commonTriggers.map((trigger) => (
              <Badge key={trigger} variant="outline">
                {trigger}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
