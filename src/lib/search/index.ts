import Fuse from "fuse.js";
import { buildSearchDocuments } from "@/lib/content/loader";
import { expandSearchQuery } from "@/lib/search/synonyms";
import type { SearchDocument } from "@/types/content";

export interface SearchResult {
  id: string;
  title: string;
  url: string;
  summary: string;
  category: string;
  entityType: string;
  score: number;
  matchedAlias?: string;
}

let fuseIndex: Fuse<SearchDocument> | null = null;

function getFuseIndex(): Fuse<SearchDocument> {
  if (fuseIndex) return fuseIndex;

  const documents = buildSearchDocuments();

  fuseIndex = new Fuse(documents, {
    keys: [
      { name: "title", weight: 0.35 },
      { name: "aliases", weight: 0.25 },
      { name: "searchTerms", weight: 0.2 },
      { name: "summary", weight: 0.1 },
      { name: "bodyExcerpt", weight: 0.08 },
      { name: "tags", weight: 0.05 },
      { name: "slug", weight: 0.05 },
      { name: "category", weight: 0.03 },
      { name: "entityType", weight: 0.02 },
    ],
    threshold: 0.5,
    distance: 200,
    minMatchCharLength: 1,
    includeScore: true,
    ignoreLocation: true,
    findAllMatches: true,
  });

  return fuseIndex;
}

export function searchArticles(
  query: string,
  limit = 12
): SearchResult[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const expandedQueries = expandSearchQuery(trimmed);
  const fuse = getFuseIndex();
  const resultMap = new Map<string, SearchResult>();

  for (const q of expandedQueries) {
    const results = fuse.search(q, { limit: limit * 2 });

    for (const result of results) {
      const doc = result.item;
      const score = result.score ?? 1;
      const existing = resultMap.get(doc.id);

      if (!existing || score < existing.score) {
        resultMap.set(doc.id, {
          id: doc.id,
          title: doc.title,
          url: doc.url,
          summary: doc.summary,
          category: doc.category,
          entityType: doc.entityType,
          score,
          matchedAlias: doc.aliases.find((a) =>
            a.toLowerCase().includes(q.toLowerCase())
          ),
        });
      }
    }
  }

  return [...resultMap.values()]
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

export function getAutocompleteSuggestions(
  query: string,
  limit = 8
): SearchResult[] {
  return searchArticles(query, limit);
}

export function invalidateSearchIndex(): void {
  fuseIndex = null;
}

export function rebuildSearchIndex(): Fuse<SearchDocument> {
  invalidateSearchIndex();
  return getFuseIndex();
}
