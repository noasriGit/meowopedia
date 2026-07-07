import { ArticleImage } from "@/components/editorial/article-image";
import {
  HeroBadges,
  HeroBreadcrumbs,
  HeroMeta,
  HeroTitleBlock,
  type HeroSharedProps,
} from "./hero-shared";

export function MagazineHero({
  article,
  breadcrumbs,
  headings,
}: HeroSharedProps) {
  const tocPreview = headings.slice(0, 3);

  return (
    <section className="editorial-hero-magazine border-b border-border bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-6" />
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <HeroBadges article={article} />
            <HeroTitleBlock article={article} />
            <div className="mt-8">
              <HeroMeta article={article} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <ArticleImage
                articleId={article.id}
                featuredImage={article.featuredImage}
                featuredImageAlt={article.featuredImageAlt}
                category={article.category}
                title={article.title}
                priority
                aspectClassName="aspect-[5/4]"
                className="rotate-1 shadow-xl"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full rounded-2xl bg-[var(--theme-accent-muted)]" />
            </div>
          </div>
        </div>

        {tocPreview.length > 0 && (
          <nav
            aria-label="Article sections preview"
            className="mt-10 flex flex-wrap gap-2"
          >
            {tocPreview.map((h) => (
              <a
                key={h.id}
                href={`#${h.id}`}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
              >
                {h.text}
              </a>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
