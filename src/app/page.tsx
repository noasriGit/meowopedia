import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Network } from "lucide-react";
import { HomeHero } from "@/components/editorial/heroes/home-hero";
import { CategoryExplorerGrid } from "@/components/layouts/category-pillar-page";
import { RelatedGrid } from "@/components/encyclopedia/related-grid";
import { CategoryThemeScope } from "@/components/editorial/category-theme-scope";
import { CategoryGradient } from "@/components/editorial/category-gradient";
import { StaggerReveal } from "@/components/editorial/motion/reveal";
import { Button } from "@/components/ui/button";
import { SITE } from "@/config/site";
import { loadAllSummaries } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  path: "/",
  image: SITE.defaultOgImage,
  imageAlt: SITE.tagline,
});

export default function HomePage() {
  const summaries = loadAllSummaries();
  const featured = summaries.slice(0, 6);
  const discoverMore = summaries
    .filter((article) => !featured.some((item) => item.id === article.id))
    .slice(0, 12);
  const spotlight = featured[0];

  return (
    <>
      <HomeHero />

      {spotlight && (
        <CategoryThemeScope category={spotlight.category}>
          <section className="border-b border-border bg-muted/15">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--theme-accent)]">
                Editor&apos;s Spotlight
              </p>
              <div className="mt-5 flex gap-5">
                <CategoryGradient
                  category={spotlight.category}
                  variant="strip"
                  className="hidden w-1.5 shrink-0 rounded-full sm:block"
                  showAccentBar={false}
                />
                <div className="min-w-0 flex-1">
                  <h2 className="text-2xl font-bold tracking-tight lg:text-3xl">
                    <Link
                      href={spotlight.url}
                      className="hover:text-[var(--theme-accent)]"
                    >
                      {spotlight.title}
                    </Link>
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                    {spotlight.summary}
                  </p>
                  <Button asChild className="mt-5" size="sm" variant="outline">
                    <Link href={spotlight.url}>
                      Read the full entry
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </CategoryThemeScope>
      )}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Featured Articles</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Handcrafted encyclopedia entries — each interlinked across the
            knowledge graph.
          </p>
        </div>
        <StaggerReveal className="mt-6">
          <RelatedGrid title="" articles={featured} columns={3} />
        </StaggerReveal>
      </section>

      {discoverMore.length > 0 && (
        <section className="border-t border-border bg-muted/10">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight">Discover More</h2>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Recently reviewed entries across breeds, health, behavior,
              nutrition, and care.
            </p>
            <StaggerReveal className="mt-6">
              <RelatedGrid title="" articles={discoverMore} columns={4} />
            </StaggerReveal>
          </div>
        </section>
      )}

      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="editorial-hover-card rounded-2xl border border-border bg-card p-6 lg:p-8">
              <BookOpen className="h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-3 text-xl font-bold">Not a Blog</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Meowopedia is structured like Britannica meets National
                Geographic — entity-based articles with category palettes and a
                knowledge graph that rewards exploration.
              </p>
            </div>
            <div className="editorial-hover-card rounded-2xl border border-border bg-card p-6 lg:p-8">
              <Network className="h-7 w-7 text-primary" aria-hidden="true" />
              <h3 className="mt-3 text-xl font-bold">Knowledge Graph</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Breeds connect to diseases, foods, behaviors, and care guides.
                Every article strengthens every other through explicit
                relationships and intelligent internal linking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight">Explore Categories</h2>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Each category has its own calm color palette — warm earth tones for
          breeds, soft blues for health, fresh greens for nutrition.
        </p>
        <div className="mt-8">
          <CategoryExplorerGrid />
        </div>
      </section>
    </>
  );
}
