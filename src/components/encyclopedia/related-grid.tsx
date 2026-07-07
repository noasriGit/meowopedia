import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { resolveArticleImage, isRemoteImageUrl } from "@/lib/images/registry";
import { getCategoryTheme } from "@/config/category-themes";
import type { ArticleSummary } from "@/types/content";
import { readingTimeLabel } from "@/lib/utils";

interface RelatedGridProps {
  title: string;
  description?: string;
  articles: ArticleSummary[];
  columns?: 2 | 3 | 4;
}

export function RelatedGrid({
  title,
  description,
  articles,
  columns = 3,
}: RelatedGridProps) {
  if (!articles.length) return null;

  const gridCols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <section className="space-y-5">
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className={`grid gap-5 ${gridCols[columns]}`}>
        {articles.map((article) => {
          const image = resolveArticleImage(
            article.featuredImage,
            article.featuredImageAlt,
            article.category,
            article.title,
            article.id
          );
          const theme = getCategoryTheme(article.category);

          return (
            <Link key={article.id} href={article.url} className="group">
              <Card className="editorial-hover-card h-full overflow-hidden border-border/80 bg-card transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    unoptimized={isRemoteImageUrl(image.src)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
                    className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{ backgroundColor: theme.accent }}
                  />
                </div>
                <CardContent className="flex h-full flex-col p-5">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {article.entityType.replace(/-/g, " ")}
                  </span>
                  <h3 className="mt-2 text-base font-semibold leading-snug transition-colors group-hover:text-[var(--theme-accent,var(--primary))]">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
                    {article.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{readingTimeLabel(article.readingTimeMinutes)}</span>
                    <ArrowRight
                      className="h-4 w-4 translate-x-0 opacity-60 transition-all duration-300 motion-safe:group-hover:translate-x-1 motion-safe:group-hover:opacity-100"
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
