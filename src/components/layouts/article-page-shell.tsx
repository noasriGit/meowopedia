import type { ReactNode } from "react";
import Link from "next/link";
import { ArticleDisclaimer } from "@/components/encyclopedia/article-disclaimer";
import { RelatedGrid } from "@/components/encyclopedia/related-grid";
import { FAQAccordion } from "@/components/encyclopedia/faq-accordion";
import {
  ReadingProgressBar,
  TableOfContents,
} from "@/components/encyclopedia/table-of-contents";
import { ArticleHero } from "@/components/editorial/heroes/article-hero";
import { CategoryThemeScope } from "@/components/editorial/category-theme-scope";
import { Reveal, StaggerReveal } from "@/components/editorial/motion/reveal";
import { extractHeadings } from "@/components/mdx/mdx-components";
import {
  buildInternalLinkSections,
  getYouMightAlsoLike,
  getRecentlyUpdated,
} from "@/lib/knowledge-graph/linking";
import { getArticlePresentation } from "@/lib/editorial/presentation";
import { getDisclaimerTier } from "@/lib/editorial/disclaimers";
import { articleBreadcrumbs } from "@/lib/seo/metadata";
import type { BodyLayoutVariant } from "@/lib/editorial/presentation";
import type { Article } from "@/types/content";
import { cn } from "@/lib/utils";

interface ArticlePageShellProps {
  article: Article;
  sidebar: ReactNode;
  hero?: ReactNode;
  children: ReactNode;
  sections?: ReactNode;
}

const PROSE_LAYOUT: Record<BodyLayoutVariant, string> = {
  classic: "prose-encyclopedia max-w-none",
  magazine: "prose-encyclopedia prose-magazine max-w-none",
  editorial: "prose-encyclopedia prose-editorial mx-auto max-w-2xl",
  visual: "prose-encyclopedia max-w-none",
};

const GRID_LAYOUT: Record<BodyLayoutVariant, string> = {
  classic:
    "lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[220px_minmax(0,1fr)_280px]",
  magazine:
    "lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[240px_minmax(0,1fr)_300px]",
  editorial: "lg:grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)]",
  visual:
    "lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[200px_minmax(0,1fr)_320px]",
};

export function ArticlePageShell({
  article,
  sidebar,
  hero,
  children,
  sections,
}: ArticlePageShellProps) {
  const breadcrumbs = articleBreadcrumbs(article);
  const headings = extractHeadings(article.content);
  const presentation = getArticlePresentation(article);
  const linkSections = buildInternalLinkSections(article);
  const youMightAlsoLike = getYouMightAlsoLike(article);
  const recentlyUpdated = getRecentlyUpdated(article.id, 4);
  const disclaimerTier = getDisclaimerTier(article);

  return (
    <CategoryThemeScope category={article.category}>
      <ReadingProgressBar />
      <article>
        {hero ?? (
          <ArticleHero
            variant={presentation.heroVariant}
            article={article}
            breadcrumbs={breadcrumbs}
            headings={headings}
          />
        )}

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            className={cn(
              "grid gap-10",
              GRID_LAYOUT[presentation.bodyLayout]
            )}
          >
            <aside className="hidden xl:block">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>

            <div className="min-w-0">
              {disclaimerTier ? (
                <Reveal className="mb-6">
                  <ArticleDisclaimer
                    tier={disclaimerTier}
                    variant="compact"
                    medicalReviewer={article.medicalReviewer}
                    lastReviewed={article.lastReviewed}
                  />
                </Reveal>
              ) : null}
              <Reveal>
                <div
                  className={cn(
                    "space-y-6",
                    PROSE_LAYOUT[presentation.bodyLayout]
                  )}
                >
                  {children}
                </div>
              </Reveal>
              {sections}
              {article.faq?.length ? (
                <Reveal className="mt-16" delay={100}>
                  <FAQAccordion items={article.faq} />
                </Reveal>
              ) : null}
              {disclaimerTier ? (
                <Reveal className="mt-16" delay={150}>
                  <ArticleDisclaimer
                    tier={disclaimerTier}
                    variant="full"
                    medicalReviewer={article.medicalReviewer}
                    lastReviewed={article.lastReviewed}
                  />
                </Reveal>
              ) : null}
            </div>

            <aside className="space-y-6">
              <div className="sticky top-24 space-y-6">
                {sidebar}
                <div className="xl:hidden">
                  <TableOfContents headings={headings} />
                </div>
              </div>
            </aside>
          </div>

          <StaggerReveal className="mt-16 space-y-16 border-t border-border pt-16">
            {linkSections.map((section) => (
              <Reveal key={section.id}>
                <RelatedGrid
                  title={section.title}
                  description={section.description}
                  articles={section.articles}
                />
              </Reveal>
            ))}

            {youMightAlsoLike.length > 0 && (
              <Reveal>
                <RelatedGrid
                  title="You Might Also Like"
                  articles={youMightAlsoLike}
                  columns={4}
                />
              </Reveal>
            )}

            {recentlyUpdated.length > 0 && (
              <Reveal>
                <RelatedGrid
                  title="Recently Updated"
                  articles={recentlyUpdated}
                  columns={4}
                />
              </Reveal>
            )}
          </StaggerReveal>

          {article.citations?.length ? (
            <Reveal className="mt-16 border-t border-border pt-10">
              <section>
                <h2 className="text-xl font-semibold">Sources & Citations</h2>
                <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                  {article.citations.map((citation, index) => (
                    <li key={index}>
                      <Link
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--theme-accent)] hover:underline"
                      >
                        {citation.title}
                        <span className="sr-only"> (opens in new tab)</span>
                      </Link>
                      {citation.publisher && ` — ${citation.publisher}`}
                    </li>
                  ))}
                </ol>
              </section>
            </Reveal>
          ) : null}
        </div>
      </article>
    </CategoryThemeScope>
  );
}
