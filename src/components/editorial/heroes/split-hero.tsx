import { ArticleImage } from "@/components/editorial/article-image";
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
    <section className="editorial-hero-split border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-14">
        <div className="order-2 lg:order-1">
          <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-5" />
          <HeroBadges article={article} />
          <HeroTitleBlock article={article} />
          <div className="mt-8">
            <HeroMeta article={article} />
          </div>
          <HeroTocPreview headings={headings} className="mt-8 lg:hidden" />
        </div>
        <div className="order-1 lg:order-2">
          <ArticleImage
            articleId={article.id}
            featuredImage={article.featuredImage}
            featuredImageAlt={article.featuredImageAlt}
            category={article.category}
            title={article.title}
            priority
            aspectClassName="aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5]"
            className="shadow-2xl ring-1 ring-border/50"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className="mx-auto hidden max-w-7xl px-4 pb-10 sm:px-6 lg:block lg:px-8">
        <HeroTocPreview
          headings={headings}
          className="rounded-2xl border border-border bg-card/50 p-5"
        />
      </div>
    </section>
  );
}
