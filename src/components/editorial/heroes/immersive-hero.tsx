import { HeroGradientShell } from "@/components/editorial/article-hero-gradient";
import {
  HeroBadges,
  HeroBreadcrumbs,
  HeroMeta,
  HeroTitleBlock,
  HeroTocPreview,
  type HeroSharedProps,
} from "./hero-shared";

export function ImmersiveHero({
  article,
  breadcrumbs,
  headings,
}: HeroSharedProps) {
  return (
    <HeroGradientShell
      articleId={article.id}
      category={article.category}
      minHeight="min-h-[min(48vh,400px)]"
      scrim="strong"
      contentClassName="mx-auto flex min-h-[min(48vh,400px)] max-w-7xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pb-12"
    >
      <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-6 text-foreground/70" />
      <HeroBadges article={article} />
      <HeroTitleBlock article={article} />
      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <HeroMeta article={article} />
        <HeroTocPreview
          headings={headings}
          className="rounded-2xl border border-border/60 bg-background/70 p-4 backdrop-blur-md lg:max-w-xs"
        />
      </div>
    </HeroGradientShell>
  );
}
