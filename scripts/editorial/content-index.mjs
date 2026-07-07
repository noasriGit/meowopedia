import fs from "node:fs";
import { PATHS } from "./paths.mjs";

export function loadContentIndex() {
  const raw = fs.readFileSync(PATHS.contentIndex, "utf8");
  return JSON.parse(raw);
}

export function saveContentIndex(index) {
  fs.writeFileSync(PATHS.contentIndex, `${JSON.stringify(index, null, 2)}\n`, "utf8");
}

/** Collect every keyword string already tracked in the content index. */
export function collectIndexedKeywords(index = loadContentIndex()) {
  const keywords = new Set();

  for (const article of index.articles ?? []) {
    if (article.primaryKeyword) keywords.add(article.primaryKeyword);
    for (const kw of article.secondaryKeywords ?? []) keywords.add(kw);
    for (const kw of article.mergedKeywords ?? []) keywords.add(kw);
  }

  return [...keywords];
}

export function getNextPriority(index) {
  const priorities = (index.articles ?? [])
    .map((article) => article.priority ?? 0)
    .filter((value) => typeof value === "number");
  const max = priorities.length ? Math.max(...priorities) : 0;
  return max + 1;
}

/**
 * Append a queued article entry to the content index.
 */
export function queueArticleInIndex(index, { id, primaryKeyword, volume, difficulty, entityType, searchIntent }) {
  const entry = {
    id,
    status: "queued",
    priority: getNextPriority(index),
    combinedVolume: volume ?? 0,
    primaryKeyword,
    searchIntent: searchIntent ?? "Informational — auto-discovered keyword",
    entityType: entityType ?? "guide",
    url: null,
    note: "Queued by daily keyword discovery pipeline",
  };

  index.articles.push(entry);
  index.totalKeywords = (index.totalKeywords ?? 0) + 1;
  index.totalArticleGroups = (index.totalArticleGroups ?? 0) + 1;
  return entry;
}

export function markArticleDraftedInIndex(index, articleId, { url, slug }) {
  const article = index.articles.find((item) => item.id === articleId);
  if (!article) return null;

  article.status = "published";
  article.url = url;
  if (slug) article.slug = slug;
  article.note = "Published by daily article pipeline";
  return article;
}
