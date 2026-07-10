import { Breadcrumbs } from "@/components/encyclopedia/breadcrumbs";
import { ArticleMetaBar } from "@/components/encyclopedia/article-meta";
import { CategoryBadge } from "@/components/editorial/category-badge";
import type { Article } from "@/types/content";
import { formatDate, readingTimeLabel } from "@/lib/utils";

export interface HeroSharedProps {
  article: Article;
  breadcrumbs: { name: string; path: string }[];
  headings: { id: string; text: string; level: number }[];
  showTocPreview?: boolean;
}

export function HeroMeta({ article }: { article: Article }) {
  return (
    <ArticleMetaBar
      readingTime={readingTimeLabel(article.readingTimeMinutes)}
      lastReviewed={
        article.lastReviewed ? formatDate(article.lastReviewed) : undefined
      }
      difficulty={article.difficulty}
      url={article.url}
    />
  );
}

export function HeroBreadcrumbs({
  breadcrumbs,
  className,
}: {
  breadcrumbs: HeroSharedProps["breadcrumbs"];
  className?: string;
}) {
  return <Breadcrumbs items={breadcrumbs} className={className} />;
}

export function HeroBadges({ article }: { article: Article }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CategoryBadge
        category={article.category}
        entityType={article.entityType}
      />
      <span className="rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
        {readingTimeLabel(article.readingTimeMinutes)}
      </span>
      {article.difficulty && (
        <span className="rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium capitalize text-muted-foreground backdrop-blur-sm">
          {article.difficulty}
        </span>
      )}
    </div>
  );
}

export function HeroTocPreview({
  headings,
  className,
}: {
  headings: HeroSharedProps["headings"];
  className?: string;
}) {
  const preview = headings.slice(0, 4);
  if (!preview.length) return null;

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        In this article
      </p>
      <ul className="mt-2 space-y-1">
        {preview.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="text-sm text-foreground/80 transition-colors hover:text-[var(--theme-accent)]"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function HeroTitleBlock({ article }: { article: Article }) {
  return (
    <>
        <h1 className="editorial-title mt-4 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
        {article.title}
      </h1>
      <p className="editorial-deck mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
        {article.summary}
      </p>
    </>
  );
}
