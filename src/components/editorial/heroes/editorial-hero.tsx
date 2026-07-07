import {
  HeroBadges,
  HeroBreadcrumbs,
  HeroMeta,
  HeroTitleBlock,
  HeroTocPreview,
  type HeroSharedProps,
} from "./hero-shared";

export function EditorialHero({
  article,
  breadcrumbs,
  headings,
}: HeroSharedProps) {
  return (
    <section className="editorial-hero-editorial relative overflow-hidden border-b border-border">
      <div className="editorial-mesh absolute inset-0" />
      <div className="editorial-grain pointer-events-none absolute inset-0 opacity-[0.35]" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-6" />
        <HeroBadges article={article} />

        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <div>
            <HeroTitleBlock article={article} />
            <div className="mt-8">
              <HeroMeta article={article} />
            </div>
          </div>
          <HeroTocPreview
            headings={headings}
            className="rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-sm"
          />
        </div>

        <div className="editorial-rule mt-12 h-px w-24 bg-[var(--theme-accent)]" />
      </div>
    </section>
  );
}
