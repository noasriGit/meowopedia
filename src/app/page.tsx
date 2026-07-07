import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Network } from "lucide-react";
import { HomeHero } from "@/components/editorial/heroes/home-hero";
import { CategoryExplorerGrid } from "@/components/layouts/category-pillar-page";
import { RelatedGrid } from "@/components/encyclopedia/related-grid";
import { CategoryThemeScope } from "@/components/editorial/category-theme-scope";
import { StaggerReveal } from "@/components/editorial/motion/reveal";
import { Button } from "@/components/ui/button";
import { loadAllSummaries } from "@/lib/content/loader";
import { resolveArticleImage, isRemoteImageUrl } from "@/lib/images/registry";

export default function HomePage() {
  const featured = loadAllSummaries().slice(0, 6);
  const spotlight = featured[0];
  const spotlightImage = spotlight
    ? resolveArticleImage(
        spotlight.featuredImage,
        spotlight.featuredImageAlt,
        spotlight.category,
        spotlight.title,
        spotlight.id
      )
    : null;

  return (
    <>
      <HomeHero />

      {spotlight && spotlightImage && (
        <CategoryThemeScope category={spotlight.category}>
          <section className="border-b border-border bg-muted/15">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--theme-accent)]">
                Editor&apos;s Spotlight
              </p>
              <div className="mt-6 grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                <Link href={spotlight.url} className="group block overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border/50">
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={spotlightImage.src}
                      alt={spotlightImage.alt}
                      fill
                      priority
                      unoptimized={isRemoteImageUrl(spotlightImage.src)}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div>
                  <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">
                    <Link href={spotlight.url} className="hover:text-[var(--theme-accent)]">
                      {spotlight.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                    {spotlight.summary}
                  </p>
                  <Button asChild className="mt-6" variant="outline">
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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Articles</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Handcrafted encyclopedia entries — each with its own visual identity
            and editorial layout.
          </p>
        </div>
        <StaggerReveal className="mt-8">
          <RelatedGrid title="" articles={featured} columns={3} />
        </StaggerReveal>
      </section>

      <section className="border-y border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="editorial-hover-card rounded-3xl border border-border bg-card p-8 lg:p-10">
              <BookOpen className="h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-2xl font-bold">Not a Blog</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Meowopedia is structured like Britannica meets National
                Geographic — entity-based articles with rotating hero layouts,
                category palettes, and a knowledge graph that rewards exploration.
              </p>
            </div>
            <div className="editorial-hover-card rounded-3xl border border-border bg-card p-8 lg:p-10">
              <Network className="h-8 w-8 text-primary" aria-hidden="true" />
              <h3 className="mt-4 text-2xl font-bold">Knowledge Graph</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Breeds connect to diseases, foods, behaviors, and care guides.
                Every article strengthens every other through explicit
                relationships and intelligent internal linking.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">Explore Categories</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Each category has its own visual identity — warm earth tones for
          breeds, clinical blues for health, fresh greens for nutrition.
        </p>
        <div className="mt-10">
          <CategoryExplorerGrid />
        </div>
      </section>
    </>
  );
}
