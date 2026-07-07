import { ArticleImage } from "@/components/editorial/article-image";
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
    <section className="editorial-hero-full relative min-h-[min(72vh,640px)] overflow-hidden">
      <div className="absolute inset-0">
        <ArticleImage
          articleId={article.id}
          featuredImage={article.featuredImage}
          featuredImageAlt={article.featuredImageAlt}
          category={article.category}
          title={article.title}
          priority
          fill
          className="rounded-none"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/20" />
        <div className="editorial-mesh absolute inset-0 opacity-60" />
      </div>

      <div className="relative mx-auto flex min-h-[min(72vh,640px)] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pb-16">
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
      </div>
    </section>
  );
}
