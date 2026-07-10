import { ChevronDown } from "lucide-react";
import { HomeGradient } from "@/components/editorial/category-gradient";
import { HomeHeroSearch } from "@/components/navigation/home-hero-search";
import { SITE } from "@/config/site";
import { getGlobalStats } from "@/lib/content/categories";

export function HomeHero() {
  const stats = getGlobalStats();

  return (
    <section
      id="home-hero"
      className="editorial-home-hero relative -mt-16 min-h-[min(85vh,720px)]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <HomeGradient className="h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[min(85vh,720px)] max-w-7xl flex-col justify-end px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pb-16">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">
          {SITE.name} · Est. 2026
        </p>

        <h1 className="editorial-title mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
          Everything worth knowing about cats.
        </h1>

        <p className="editorial-deck mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Breeds, health, behavior, nutrition — researched and interlinked.
        </p>

        <div className="mt-8 overflow-visible">
          <HomeHeroSearch />
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {stats.totalArticles}+ articles · {stats.totalCategories} categories ·
          50+ topics
        </p>
      </div>

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-muted-foreground/50"
        aria-hidden="true"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
}
