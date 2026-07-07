import {
  CATEGORIES,
  getCategoryDefinition,
  type CategorySlug,
} from "@/config/taxonomy";
import { getArticlesByCategory, loadAllSummaries } from "@/lib/content/loader";
import { sortByDateDesc } from "@/lib/utils";
import type { ArticleSummary, CategoryFilterOption, CategoryPageData } from "@/types/content";

function buildFilters(
  articles: ArticleSummary[],
  filterKeys: string[] | undefined
): CategoryFilterOption[] {
  if (!filterKeys?.length) return [];

  return filterKeys.map((key) => {
    const valueCounts = new Map<string, number>();

    for (const article of articles) {
      const data = (article as ArticleSummary & { data?: Record<string, unknown> }).data;
      const value = data?.[key];
      if (typeof value === "string") {
        valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1);
      }
    }

    return {
      key,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase()),
      values: [...valueCounts.entries()]
        .map(([value, count]) => ({
          value,
          label: value.charAt(0).toUpperCase() + value.slice(1),
          count,
        }))
        .sort((a, b) => b.count - a.count),
    };
  });
}

export function getCategoryPageData(slug: CategorySlug): CategoryPageData {
  const definition = getCategoryDefinition(slug);
  const articles = getArticlesByCategory(slug);
  const sorted = sortByDateDesc(articles);

  return {
    slug,
    title: definition.title,
    description: definition.description,
    articles,
    featured: articles.slice(0, 6),
    newest: sorted.slice(0, 8),
    filters: buildFilters(articles, definition.filterKeys),
    relatedCategories: definition.relatedCategories,
  };
}

export function getAllCategorySlugs(): CategorySlug[] {
  return Object.keys(CATEGORIES) as CategorySlug[];
}

export function filterCategoryArticles(
  slug: CategorySlug,
  filters: Record<string, string>
): ArticleSummary[] {
  let articles = getArticlesByCategory(slug);

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;
    articles = articles.filter((article) => {
      const data = (article as ArticleSummary & { data?: Record<string, unknown> }).data;
      return data?.[key] === value;
    });
  }

  return articles;
}

export function searchWithinCategory(
  slug: CategorySlug,
  query: string
): ArticleSummary[] {
  const normalized = query.toLowerCase();
  return getArticlesByCategory(slug).filter(
    (a) =>
      a.title.toLowerCase().includes(normalized) ||
      a.summary.toLowerCase().includes(normalized) ||
      a.aliases?.some((alias) => alias.toLowerCase().includes(normalized))
  );
}

export function getGlobalStats() {
  const summaries = loadAllSummaries();
  return {
    totalArticles: summaries.length,
    totalCategories: getAllCategorySlugs().length,
  };
}
