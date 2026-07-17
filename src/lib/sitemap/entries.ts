import {
  FEATURED_CATEGORY_SLUGS,
  SITEMAP_REDIRECT_SOURCES,
  SITEMAP_TOOL_PATHS,
} from "@/config/sitemap";
import { CATEGORIES, type CategorySlug } from "@/config/taxonomy";
import { getAllCategorySlugs } from "@/lib/content/categories";
import { loadAllArticles } from "@/lib/content/loader";
import { loadAllStaticPages } from "@/lib/content/static-pages";
import type { SitemapEntry } from "@/lib/sitemap/types";

function normalizeUrl(url: string): string {
  if (!url.startsWith("/")) return `/${url}`;
  return url.endsWith("/") && url.length > 1 ? url.slice(0, -1) : url;
}

function isRedirectSource(url: string): boolean {
  return (SITEMAP_REDIRECT_SOURCES as readonly string[]).includes(normalizeUrl(url));
}

function buildHomepageEntry(): SitemapEntry {
  return {
    id: "homepage",
    title: "Home",
    url: "/",
    description: "The definitive encyclopedia of cats.",
    contentType: "homepage",
    featured: true,
    sortPriority: 100,
  };
}

function buildCategoryEntry(slug: CategorySlug, articleCount: number): SitemapEntry {
  const category = CATEGORIES[slug];
  return {
    id: `category:${slug}`,
    title: category.title,
    url: `/${slug}`,
    description: category.description,
    contentType: "category",
    category: slug,
    featured: FEATURED_CATEGORY_SLUGS.includes(slug),
    sortPriority: FEATURED_CATEGORY_SLUGS.includes(slug) ? 90 : 50,
    ...(articleCount === 0 ? {} : {}),
  };
}

function buildArticleEntry(article: ReturnType<typeof loadAllArticles>[number]): SitemapEntry | null {
  if (article.noindex) return null;
  if (isRedirectSource(article.url)) return null;

  return {
    id: article.id,
    title: article.title,
    url: normalizeUrl(article.url),
    description: article.summary,
    contentType: "article",
    category: article.category,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt ?? article.lastReviewed,
    sortPriority: 30,
  };
}

function buildStaticEntry(page: ReturnType<typeof loadAllStaticPages>[number]): SitemapEntry {
  return {
    id: `static:${page.slug}`,
    title: page.title,
    url: normalizeUrl(page.path),
    description: page.description,
    contentType: "static",
    updatedAt: page.lastUpdated,
    sortPriority: 10,
  };
}

function buildToolEntries(): SitemapEntry[] {
  return SITEMAP_TOOL_PATHS.map((tool) => ({
    id: `tool:${tool.path}`,
    title: tool.title,
    url: tool.path,
    description: tool.description,
    contentType: "tool" as const,
    sortPriority: 40,
  }));
}

/**
 * Returns all indexable sitemap entries from authoritative content sources.
 * Filters noindex articles, redirect sources, and duplicate URLs.
 */
export function getAllSitemapEntries(): SitemapEntry[] {
  const articles = loadAllArticles();
  const staticPages = loadAllStaticPages();
  const categorySlugs = getAllCategorySlugs();

  const articleCounts = articles.reduce(
    (acc, article) => {
      if (article.noindex) return acc;
      acc[article.category] = (acc[article.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const entries: SitemapEntry[] = [
    buildHomepageEntry(),
    ...categorySlugs.map((slug) => buildCategoryEntry(slug, articleCounts[slug] ?? 0)),
    ...articles.map(buildArticleEntry).filter((entry): entry is SitemapEntry => Boolean(entry)),
    ...staticPages.map(buildStaticEntry),
    ...buildToolEntries(),
  ];

  const seenUrls = new Set<string>();
  return entries.filter((entry) => {
    const url = normalizeUrl(entry.url);
    if (seenUrls.has(url)) return false;
    seenUrls.add(url);
    return true;
  });
}

/** Entries suitable for the XML sitemap (preserves existing XML scope). */
export function getXmlSitemapEntries(): SitemapEntry[] {
  const entries = getAllSitemapEntries().filter((entry) => {
    if (entry.contentType === "article" && entry.url) {
      return true;
    }
    if (entry.contentType === "homepage") return true;
    if (entry.contentType === "category") return true;
    if (entry.contentType === "static") return true;
    if (entry.contentType === "tool" && entry.url === "/search") return true;
    return false;
  });

  if (!entries.some((entry) => entry.url === "/sitemap")) {
    entries.push({
      id: "html-sitemap",
      title: "Sitemap",
      url: "/sitemap",
      description:
        "Browse every page on Meowopedia — cat breeds, health, behavior, nutrition, foods, plants, guides, and encyclopedia articles.",
      contentType: "static",
      sortPriority: 20,
    });
  }

  return entries;
}
