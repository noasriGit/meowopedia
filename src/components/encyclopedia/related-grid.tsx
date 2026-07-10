import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryGradient } from "@/components/editorial/category-gradient";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryTheme } from "@/config/category-themes";
import type { ArticleSummary } from "@/types/content";
import { readingTimeLabel } from "@/lib/utils";

interface RelatedGridProps {
  title: string;
  description?: string;
  articles: ArticleSummary[];
  columns?: 2 | 3 | 4;
  compact?: boolean;
}

export function RelatedGrid({
  title,
  description,
  articles,
  columns = 4,
  compact = true,
}: RelatedGridProps) {
  if (!articles.length) return null;

  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <section className="space-y-4">
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={`grid gap-3 ${gridCols[columns]}`}>
        {articles.map((article) => {
          const theme = getCategoryTheme(article.category);

          return (
            <Link key={article.id} href={article.url} className="group">
              <Card className="editorial-hover-card h-full overflow-hidden border-border/70 bg-card transition-all duration-200">
                <CategoryGradient
                  category={article.category}
                  variant="strip"
                  className="h-12 rounded-none"
                />
                <CardContent
                  className={
                    compact
                      ? "flex h-full flex-col p-3.5"
                      : "flex h-full flex-col p-5"
                  }
                >
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: theme.accent }}
                  >
                    {article.entityType.replace(/-/g, " ")}
                  </span>
                  <h3 className="mt-1.5 text-sm font-semibold leading-snug transition-colors group-hover:text-[var(--theme-accent,var(--primary))]">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {article.summary}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{readingTimeLabel(article.readingTimeMinutes)}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 opacity-50 transition-all duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
