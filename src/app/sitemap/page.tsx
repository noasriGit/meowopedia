import { buildSitemapPageData } from "@/lib/sitemap/registry";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  collectionPageSchema,
  JsonLdScript,
  websiteSchema,
} from "@/lib/seo/json-ld";
import { Breadcrumbs } from "@/components/encyclopedia/breadcrumbs";
import {
  SitemapAlphabeticalIndex,
  SitemapCategorySection,
  SitemapEntryList,
} from "@/components/sitemap/sitemap-sections";

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: "Sitemap",
  description:
    "Browse every page on Meowopedia — cat breeds, health, behavior, nutrition, foods, plants, guides, and encyclopedia articles.",
  path: "/sitemap",
});

export default function SitemapPage() {
  const data = buildSitemapPageData();
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: "Sitemap", path: "/sitemap" },
  ];

  const listedArticleEntries = [
    ...data.featured,
    ...data.recent,
    ...data.categories.flatMap((group) => group.entries),
    ...data.tools,
    ...data.staticPages,
    ...Object.values(data.alphabetical).flat(),
  ];

  const uniqueEntries = [
    ...new Map(listedArticleEntries.map((entry) => [entry.id, entry])).values(),
  ];

  const structuredData = [
    websiteSchema(),
    breadcrumbSchema(breadcrumbs),
    collectionPageSchema(
      "Meowopedia Sitemap",
      "Browse every page on Meowopedia — cat breeds, health, behavior, nutrition, foods, plants, guides, and encyclopedia articles.",
      "/sitemap",
      uniqueEntries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        url: entry.url,
        summary: entry.description ?? "",
        slug: entry.url.split("/").pop() ?? entry.id,
        category: entry.category ?? "guides",
        entityType: "guide" as const,
        aliases: [],
        tags: [],
        readingTimeMinutes: 0,
      }))
    ),
  ];

  return (
    <>
      <JsonLdScript data={structuredData} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Breadcrumbs items={breadcrumbs} className="mb-6" />
        <header className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sitemap</h1>
          <p className="mt-3 text-muted-foreground">
            A complete guide to every indexable page on Meowopedia — organized by
            category so you can explore breeds, health, behavior, nutrition, and the
            full cat encyclopedia.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {data.totalIndexable} indexable pages
          </p>
        </header>

        <div className="mt-12 space-y-14">
          <section aria-labelledby="sitemap-featured-heading">
            <h2 id="sitemap-featured-heading" className="text-2xl font-semibold tracking-tight">
              Featured pages
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Core category hubs and the homepage — the best places to start exploring.
            </p>
            <div className="mt-6">
              <SitemapEntryList entries={data.featured} showDescription />
            </div>
          </section>

          {data.recent.length > 0 && (
            <section aria-labelledby="sitemap-recent-heading">
              <h2 id="sitemap-recent-heading" className="text-2xl font-semibold tracking-tight">
                Recently published
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                The newest encyclopedia articles, sorted by publication date.
              </p>
              <div className="mt-6">
                <SitemapEntryList entries={data.recent} showDate />
              </div>
            </section>
          )}

          <section aria-labelledby="sitemap-categories-heading">
            <h2 id="sitemap-categories-heading" className="text-2xl font-semibold tracking-tight">
              Categories
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse articles grouped by encyclopedia category. Each section links to
              its category hub page.
            </p>
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              {data.categories.map((group) => (
                <SitemapCategorySection key={group.slug} group={group} />
              ))}
            </div>
          </section>

          {data.tools.length > 0 && (
            <section aria-labelledby="sitemap-tools-heading">
              <h2 id="sitemap-tools-heading" className="text-2xl font-semibold tracking-tight">
                Tools
              </h2>
              <div className="mt-6">
                <SitemapEntryList entries={data.tools} showDescription />
              </div>
            </section>
          )}

          {data.staticPages.length > 0 && (
            <section aria-labelledby="sitemap-about-heading">
              <h2 id="sitemap-about-heading" className="text-2xl font-semibold tracking-tight">
                About &amp; legal
              </h2>
              <div className="mt-6">
                <SitemapEntryList entries={data.staticPages} />
              </div>
            </section>
          )}

          {Object.keys(data.alphabetical).length > 0 && (
            <section aria-labelledby="sitemap-az-heading">
              <h2 id="sitemap-az-heading" className="text-2xl font-semibold tracking-tight">
                A–Z index
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                All encyclopedia articles in alphabetical order.
              </p>
              <div className="mt-8">
                <SitemapAlphabeticalIndex groups={data.alphabetical} />
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
