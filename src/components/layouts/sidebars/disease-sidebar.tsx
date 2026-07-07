import { QuickFactsCard } from "@/components/encyclopedia/quick-facts";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/content";

interface DiseaseData {
  severity?: string;
  bodySystem?: string;
  chronicAcute?: string;
  contagious?: string;
  commonIn?: string[];
  emergency?: boolean;
}

export function DiseaseSidebar({ article }: { article: Article }) {
  const data = (article.data ?? {}) as DiseaseData;

  const facts: Record<string, React.ReactNode> = {};
  if (data.severity) facts["Severity"] = data.severity;
  if (data.bodySystem) facts["Body System"] = data.bodySystem;
  if (data.chronicAcute) facts["Type"] = data.chronicAcute;
  if (data.contagious) facts["Contagious"] = data.contagious;

  return (
    <>
      {data.emergency && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">
            May Require Emergency Care
          </p>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            Seek immediate veterinary attention if severe symptoms appear.
          </p>
        </div>
      )}
      <QuickFactsCard title="Condition Overview" facts={facts} />
      {data.commonIn?.length ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Common In
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.commonIn.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
