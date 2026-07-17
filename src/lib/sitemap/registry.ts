import { SITEMAP_RECENT_LIMIT, SITEMAP_TOOL_PATHS } from "@/config/sitemap";
import { CATEGORIES, type CategorySlug } from "@/config/taxonomy";
import { getAllSitemapEntries } from "@/lib/sitemap/entries";
import type {
  SitemapCategoryGroup,
  SitemapEntry,
  SitemapPageData,
} from "@/lib/sitemap/types";

function sortByTitle(entries: SitemapEntry[]): SitemapEntry[] {
  return [...entries].sort((a, b) =>
    a.title.localeCompare(b.title, "en", { sensitivity: "base" })
  );
}

function getPublicationDate(entry: SitemapEntry): string | undefined {
  return entry.publishedAt ?? entry.updatedAt;
}

function buildRecentEntries(articles: SitemapEntry[]): SitemapEntry[] {
  return [...articles]
    .filter((entry) => Boolean(getPublicationDate(entry)))
    .sort((a, b) => {
      const dateA = new Date(getPublicationDate(a)!).getTime();
      const dateB = new Date(getPublicationDate(b)!).getTime();
      return dateB - dateA;
    })
    .slice(0, SITEMAP_RECENT_LIMIT);
}

function getAlphabeticalKey(title: string): string {
  const normalized = title.trim();
  const withoutArticle = normalized.replace(/^(a|an|the)\s+/i, "");
  const letter = (withoutArticle[0] ?? normalized[0] ?? "#").toUpperCase();
  return /[A-Z]/.test(letter) ? letter : "#";
}

function buildAlphabeticalIndex(articles: SitemapEntry[]): Record<string, SitemapEntry[]> {
  const sorted = sortByTitle(articles);
  const groups: Record<string, SitemapEntry[]> = {};

  for (const entry of sorted) {
    const key = getAlphabeticalKey(entry.title);
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }

  return Object.fromEntries(
    Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  );
}

function buildCategoryGroups(
  categories: SitemapEntry[],
  articles: SitemapEntry[]
): SitemapCategoryGroup[] {
  const articlesByCategory = articles.reduce(
    (acc, article) => {
      if (!article.category) return acc;
      if (!acc[article.category]) acc[article.category] = [];
      acc[article.category].push(article);
      return acc;
    },
    {} as Record<CategorySlug, SitemapEntry[]>
  );

  return categories
    .map((categoryEntry) => {
      const slug = categoryEntry.category as CategorySlug;
      const categoryArticles = sortByTitle(articlesByCategory[slug] ?? []);
      if (categoryArticles.length === 0) return null;

      const definition = CATEGORIES[slug];
      return {
        slug,
        title: definition.title,
        description: definition.description,
        hubUrl: categoryEntry.url,
        entries: categoryArticles,
      };
    })
    .filter((group): group is SitemapCategoryGroup => Boolean(group))
    .sort((a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" }));
}

function buildToolSection(allEntries: SitemapEntry[]): SitemapEntry[] {
  return SITEMAP_TOOL_PATHS.map((tool) => {
    const existing = allEntries.find((entry) => entry.url === tool.path);
    if (existing) {
      return {
        ...existing,
        title: tool.title,
        description: tool.description,
        contentType: "tool" as const,
      };
    }

    return {
      id: `tool:${tool.path}`,
      title: tool.title,
      url: tool.path,
      description: tool.description,
      contentType: "tool" as const,
      sortPriority: 40,
    };
  });
}

export function buildSitemapPageData(): SitemapPageData {
  const allEntries = getAllSitemapEntries();

  const categories = allEntries.filter((e) => e.contentType === "category");
  const articles = allEntries.filter((e) => e.contentType === "article");
  const staticPages = sortByTitle(allEntries.filter((e) => e.contentType === "static"));
  const tools = buildToolSection(allEntries);

  const featured = sortByTitle(
    allEntries.filter((entry) => entry.featured || entry.contentType === "homepage")
  );

  return {
    featured,
    recent: buildRecentEntries(articles),
    categories: buildCategoryGroups(categories, articles),
    tools,
    staticPages,
    alphabetical: buildAlphabeticalIndex(articles),
    totalIndexable: allEntries.length,
  };
}
