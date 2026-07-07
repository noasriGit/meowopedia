import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { HomeHeroSearch } from "@/components/navigation/home-hero-search";
import { SITE } from "@/config/site";
import { getGlobalStats } from "@/lib/content/categories";

export function HomeHero() {
  const stats = getGlobalStats();
  const { homeHero } = SITE;

  return (
    <section id="home-hero" className="editorial-home-hero relative -mt-16 min-h-screen">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={homeHero.src}
          alt={homeHero.alt}
          fill
          priority
          sizes="100vw"
          className="editorial-home-hero-image object-cover"
        />
        <div className="editorial-home-scrim absolute inset-0" aria-hidden="true" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-4 pb-10 pt-16 sm:px-6 lg:px-8 lg:pb-16">
        <p className="text-sm font-medium tracking-wide text-white/70">
          {SITE.name} · Est. 2026
        </p>

        <h1 className="editorial-title mt-4 max-w-3xl text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
          Everything worth knowing about cats.
        </h1>

        <p className="editorial-deck mt-5 max-w-xl text-lg leading-relaxed text-white/80">
          Breeds, health, behavior, nutrition — researched and interlinked.
        </p>

        <div className="mt-8 overflow-visible">
          <HomeHeroSearch />
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-white/60">
            {stats.totalArticles}+ articles · {stats.totalCategories} categories
            · 50+ topics
          </p>
          {homeHero.attribution && (
            <p className="text-xs text-white/40">
              Photo{" "}
              {homeHero.sourceUrl ? (
                <Link
                  href={homeHero.sourceUrl}
                  className="underline decoration-white/30 underline-offset-2 hover:text-white/60"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {homeHero.attribution}
                </Link>
              ) : (
                homeHero.attribution
              )}
              {homeHero.license === "cc-by-sa" && " · CC BY-SA 2.0"}
            </p>
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/40"
        aria-hidden="true"
      >
        <ChevronDown className="h-5 w-5 animate-bounce" />
      </div>
    </section>
  );
}
