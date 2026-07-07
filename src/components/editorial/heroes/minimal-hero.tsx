import {
  HeroBadges,
  HeroBreadcrumbs,
  HeroMeta,
  HeroTitleBlock,
  HeroTocPreview,
  type HeroSharedProps,
} from "./hero-shared";

export function MinimalHero({
  article,
  breadcrumbs,
  headings,
}: HeroSharedProps) {
  return (
    <section className="editorial-hero-minimal relative border-b border-border">
      <div className="editorial-shapes pointer-events-none absolute inset-0 overflow-hidden">
        <div className="editorial-shape editorial-shape-a" />
        <div className="editorial-shape editorial-shape-b" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-5" />
        <HeroBadges article={article} />
        <HeroTitleBlock article={article} />
        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <HeroMeta article={article} />
          <HeroTocPreview
            headings={headings}
            className="md:max-w-xs md:text-right"
          />
        </div>
      </div>
    </section>
  );
}
