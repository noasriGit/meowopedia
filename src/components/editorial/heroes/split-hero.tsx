import { HeroGradientShell } from "@/components/editorial/article-hero-gradient";
import {
  HeroBadges,
  HeroBreadcrumbs,
  HeroMeta,
  HeroTitleBlock,
  HeroTocPreview,
  type HeroSharedProps,
} from "./hero-shared";

export function SplitHero({
  article,
  breadcrumbs,
  headings,
}: HeroSharedProps) {
  return (
    <HeroGradientShell
      articleId={article.id}
      category={article.category}
      scrim="soft"
      contentClassName="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-5" />
      <HeroBadges article={article} />
      <HeroTitleBlock article={article} />
      <div className="mt-8">
        <HeroMeta article={article} />
      </div>
      <HeroTocPreview
        headings={headings}
        className="mt-8 rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm lg:max-w-md"
      />
    </HeroGradientShell>
  );
}
