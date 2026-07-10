import { HeroGradientShell } from "@/components/editorial/article-hero-gradient";
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
    <HeroGradientShell
      articleId={article.id}
      category={article.category}
      scrim="soft"
      contentClassName="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <HeroBreadcrumbs breadcrumbs={breadcrumbs} className="mb-6" />
      <HeroBadges article={article} />
      <HeroTitleBlock article={article} />
      <div className="mt-8">
        <HeroMeta article={article} />
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
              className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)]"
            >
              {h.text}
            </a>
          ))}
        </nav>
      )}
    </HeroGradientShell>
  );
}
