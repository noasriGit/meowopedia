import { HeroGradientShell } from "@/components/editorial/article-hero-gradient";
import {
  HeroBadges,
  HeroBreadcrumbs,
  HeroMeta,
  HeroTitleBlock,
  HeroTocPreview,
  type HeroSharedProps,
} from "./hero-shared";

export function MinimalHero({
  article,
  breadcrumbs,
  headings,
}: HeroSharedProps) {
  return (
    <HeroGradientShell
      articleId={article.id}
      category={article.category}
      scrim="none"
      contentClassName="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-5" />
      <HeroBadges article={article} />
      <HeroTitleBlock article={article} />
      <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <HeroMeta article={article} />
        <HeroTocPreview
          headings={headings}
          className="rounded-2xl border border-border bg-card/70 p-4 backdrop-blur-sm md:max-w-xs md:text-right"
        />
      </div>
    </HeroGradientShell>
  );
}
