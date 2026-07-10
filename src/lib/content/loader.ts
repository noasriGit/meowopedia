import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import {
  ENTITY_ROUTES,
  getRouteForEntityType,
  type EntityRouteDefinition,
} from "@/config/taxonomy";
import { validateFrontmatter } from "@/lib/content/validators";
import type {
  Article,
  ArticleSummary,
  SearchDocument,
} from "@/types/content";

const CONTENT_ROOT = path.join(process.cwd(), "content");

let articleCache: Article[] | null = null;
let summaryCache: ArticleSummary[] | null = null;
let idIndex: Map<string, ArticleSummary> | null = null;
let slugIndex: Map<string, ArticleSummary> | null = null;

function collectMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectMdxFiles(fullPath));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

function resolveUrl(
  frontmatter: ReturnType<typeof validateFrontmatter>
): string {
  const route = getRouteForEntityType(frontmatter.entityType);
  if (route) {
    // Articles filed under a different category (e.g. health content with disease entityType)
    // should use the editorial category URL, not the default entity route prefix.
    if (route.category !== frontmatter.category) {
      return `/${frontmatter.category}/${frontmatter.slug}`;
    }
    return `${route.urlPrefix}/${frontmatter.slug}`;
  }
  return `/${frontmatter.category}/${frontmatter.slug}`;
}

function parseArticleFile(filePath: string): Article {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = validateFrontmatter(data, filePath);
  const stats = readingTime(content);

  return {
    ...frontmatter,
    content,
    readingTimeMinutes: frontmatter.readingTime ?? stats.minutes,
    url: resolveUrl(frontmatter),
  };
}

function toSummary(article: Article): ArticleSummary {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    entityType: article.entityType,
    summary: article.summary,
    aliases: article.aliases,
    featuredImage: article.featuredImage,
    featuredImageAlt: article.featuredImageAlt,
    difficulty: article.difficulty,
    lastReviewed: article.lastReviewed,
    updatedAt: article.updatedAt,
    readingTimeMinutes: article.readingTimeMinutes,
    url: article.url,
    tags: article.tags,
    data: article.data,
  };
}

function buildIndexes(articles: Article[]) {
  const summaries = articles.map(toSummary);
  articleCache = articles;
  summaryCache = summaries;
  idIndex = new Map(summaries.map((s) => [s.id, s]));
  slugIndex = new Map(summaries.map((s) => [s.slug, s]));
}

export function loadAllArticles(): Article[] {
  if (articleCache) return articleCache;

  const contentDirs = ENTITY_ROUTES.map((r) =>
    path.join(CONTENT_ROOT, r.contentDir)
  );
  const uniqueDirs = [...new Set(contentDirs)];
  const files = uniqueDirs.flatMap(collectMdxFiles);
  const articles = files.map(parseArticleFile);

  buildIndexes(articles);
  return articles;
}

export function loadAllSummaries(): ArticleSummary[] {
  if (summaryCache) return summaryCache;
  loadAllArticles();
  return summaryCache!;
}

export function getArticleBySlug(
  route: EntityRouteDefinition,
  slug: string
): Article | undefined {
  return loadAllArticles().find(
    (a) =>
      a.slug === slug &&
      (a.entityType === route.entityType ||
        a.url.startsWith(`${route.urlPrefix}/`))
  );
}

export function getArticleByUrlPrefix(
  urlPrefix: string,
  slug: string
): Article | undefined {
  const prefix = urlPrefix.endsWith("/") ? urlPrefix.slice(0, -1) : urlPrefix;
  return loadAllArticles().find(
    (a) => a.slug === slug && a.url.startsWith(`${prefix}/`)
  );
}

export function getStaticParamsForPrefix(
  urlPrefix: string
): { slug: string }[] {
  const prefix = urlPrefix.endsWith("/") ? urlPrefix.slice(0, -1) : urlPrefix;
  return loadAllArticles()
    .filter((a) => a.url.startsWith(`${prefix}/`))
    .map((a) => ({ slug: a.slug }));
}

export function getArticleById(id: string): Article | undefined {
  const summary = idIndex?.get(id) ?? loadAllSummaries().find((s) => s.id === id);
  if (!summary) return undefined;
  return loadAllArticles().find((a) => a.id === id);
}

export function getSummaryById(id: string): ArticleSummary | undefined {
  if (!idIndex) loadAllSummaries();
  return idIndex?.get(id);
}

export function getSummaryBySlug(slug: string): ArticleSummary | undefined {
  if (!slugIndex) loadAllSummaries();
  return slugIndex?.get(slug);
}

export function resolveArticleIds(ids: string[]): ArticleSummary[] {
  const summaries = loadAllSummaries();
  const index = new Map(summaries.map((s) => [s.id, s]));
  return ids
    .map((id) => index.get(id))
    .filter((s): s is ArticleSummary => Boolean(s));
}

export function getArticlesByCategory(
  category: string
): ArticleSummary[] {
  return loadAllSummaries().filter((a) => a.category === category);
}

export function getArticlesByEntityType(
  entityType: string
): ArticleSummary[] {
  return loadAllSummaries().filter((a) => a.entityType === entityType);
}

export function getStaticParamsForRoute(
  route: EntityRouteDefinition
): { slug: string }[] {
  return loadAllArticles()
    .filter((a) => a.entityType === route.entityType)
    .map((a) => ({ slug: a.slug }));
}

function stripMdxToPlainText(content: string, maxLength = 2000): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.slice(0, maxLength);
}

export function buildSearchDocuments(): SearchDocument[] {
  return loadAllArticles().map((article) => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    entityType: article.entityType,
    url: article.url,
    summary: article.summary,
    aliases: article.aliases ?? [],
    tags: article.tags ?? [],
    searchTerms: [
      article.title,
      ...(article.aliases ?? []),
      ...(article.tags ?? []),
    ],
    bodyExcerpt: stripMdxToPlainText(article.content),
  }));
}

/** Invalidate cache — useful for ISR/on-demand revalidation scripts */
export function invalidateContentCache(): void {
  articleCache = null;
  summaryCache = null;
  idIndex = null;
  slugIndex = null;
}

export function getContentStats() {
  const articles = loadAllSummaries();
  const byCategory = articles.reduce(
    (acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const byEntityType = articles.reduce(
    (acc, a) => {
      acc[a.entityType] = (acc[a.entityType] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return { total: articles.length, byCategory, byEntityType };
}
