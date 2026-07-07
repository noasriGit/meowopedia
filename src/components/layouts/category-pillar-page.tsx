import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, CATEGORY_SLUGS } from "@/config/taxonomy";
import { getCategoryPageData, getGlobalStats } from "@/lib/content/categories";
import { RelatedGrid } from "@/components/encyclopedia/related-grid";
import { CategoryThemeScope } from "@/components/editorial/category-theme-scope";
import { CategoryBadge } from "@/components/editorial/category-badge";
import { getCategoryTheme } from "@/config/category-themes";
import { getCategoryBanner } from "@/lib/images/category-banners";
import { isRemoteImageUrl, requiresAttribution } from "@/lib/images/registry";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleDisclaimer } from "@/components/encyclopedia/article-disclaimer";
import { getCategoryDisclaimerTier } from "@/lib/editorial/disclaimers";
import type { CategorySlug } from "@/config/taxonomy";

interface CategoryPillarPageProps {
  slug: CategorySlug;
}

export function CategoryPillarPage({ slug }: CategoryPillarPageProps) {
  const data = getCategoryPageData(slug);
  const definition = CATEGORIES[slug];
  const stats = getGlobalStats();
  const theme = getCategoryTheme(slug);
  const banner = getCategoryBanner(slug);
  const showBannerCredit =
    banner && requiresAttribution(banner.license) && banner.attribution;
  const disclaimerTier = getCategoryDisclaimerTier(slug);

  return (
    <CategoryThemeScope category={slug}>
      <div>
        <section className="editorial-hero-full relative min-h-[min(52vh,420px)] overflow-hidden border-b border-border">
          {banner ? (
            <>
              <Image
                src={banner.url}
                alt={banner.alt}
                fill
                priority
                unoptimized={isRemoteImageUrl(banner.url)}
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/55" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/20" />
            </>
          ) : (
            <div className="editorial-mesh absolute inset-0" />
          )}
          <div className="editorial-grain pointer-events-none absolute inset-0 opacity-40" />

          <div className="relative mx-auto flex min-h-[min(52vh,420px)] max-w-7xl flex-col justify-end px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <header className="max-w-2xl">
              <CategoryBadge category={slug} />
              <p className="mt-4 inline-flex rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
                {data.articles.length} articles
              </p>
              <h1 className="editorial-title mt-5 text-4xl font-bold tracking-tight lg:text-6xl">
                {data.title}
              </h1>
              <p className="editorial-deck mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {definition.pillarIntro}
              </p>
              {showBannerCredit && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Photo: {banner.attribution}
                  {banner.source ? ` / ${banner.source}` : ""}
                </p>
              )}
            </header>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <ArticleDisclaimer tier={disclaimerTier} variant="compact" className="mb-10" />

          {data.filters.length > 0 && (
            <section className="mt-2">
              <h2 className="text-xl font-semibold">Browse by Filter</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.filters.map((filter) => (
                  <Card key={filter.key} className="editorial-hover-card">
                    <CardContent className="p-5">
                      <h3 className="font-medium">{filter.label}</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {filter.values.slice(0, 6).map((v) => (
                          <Badge key={v.value} variant="outline">
                            {v.label} ({v.count})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {data.featured.length > 0 && (
            <div className="mt-16">
              <RelatedGrid title="Featured" articles={data.featured} columns={3} />
            </div>
          )}

          {data.newest.length > 0 && (
            <div className="mt-16">
              <RelatedGrid title="Newest Articles" articles={data.newest} columns={4} />
            </div>
          )}

          {data.articles.length > 0 && (
            <div className="mt-16">
              <RelatedGrid
                title={`All ${data.title}`}
                articles={data.articles}
                columns={3}
              />
            </div>
          )}

          <section className="mt-16 rounded-3xl border border-border bg-muted/20 p-8">
            <h2 className="text-xl font-semibold">Related Categories</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.relatedCategories.map((relatedSlug) => (
                <Link
                  key={relatedSlug}
                  href={`/${relatedSlug}`}
                  className="editorial-hover-card rounded-2xl border border-border bg-card p-5 transition-colors hover:border-[var(--theme-accent)]/40"
                >
                  <h3 className="font-semibold">{CATEGORIES[relatedSlug].title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {CATEGORIES[relatedSlug].description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <ArticleDisclaimer tier={disclaimerTier} variant="full" className="mt-16" />

          <p className="mt-10 text-sm text-muted-foreground">
            Part of {stats.totalArticles} articles across {stats.totalCategories}{" "}
            encyclopedia categories on Meowopedia.
          </p>
        </div>
      </div>
    </CategoryThemeScope>
  );
}

export function CategoryExplorerGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CATEGORY_SLUGS.map((slug) => {
        const category = CATEGORIES[slug];
        const data = getCategoryPageData(slug);
        const theme = getCategoryTheme(slug);

        return (
          <Link
            key={slug}
            href={`/${slug}`}
            className="editorial-hover-card group overflow-hidden rounded-2xl border border-border bg-card transition-all"
          >
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: theme.accent }}
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold transition-colors group-hover:text-[var(--theme-accent,var(--primary))]">
                {category.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {category.description}
              </p>
              <p className="mt-4 text-xs font-medium text-muted-foreground">
                {data.articles.length} articles
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
