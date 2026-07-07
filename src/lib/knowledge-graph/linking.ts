import {
  loadAllArticles,
  loadAllSummaries,
  resolveArticleIds,
  getSummaryById,
} from "@/lib/content/loader";
import type {
  Article,
  ArticleSummary,
  InternalLinkSection,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  Relationship,
} from "@/types/content";

const RELATED_FIELD_MAP: Record<string, keyof Article> = {
  relatedArticles: "relatedArticles",
  relatedBreeds: "relatedBreeds",
  relatedDiseases: "relatedDiseases",
  relatedFoods: "relatedFoods",
  relatedPlants: "relatedPlants",
  relatedSymptoms: "relatedSymptoms",
  relatedMedications: "relatedMedications",
  relatedBehaviors: "relatedBehaviors",
};

function extractExplicitRelationships(article: Article): Relationship[] {
  const explicit: Relationship[] = [...(article.relationships ?? [])];

  for (const [field, key] of Object.entries(RELATED_FIELD_MAP)) {
    const ids = article[key as keyof Article] as string[] | undefined;
    if (!ids?.length) continue;

    const type = field.includes("Breeds")
      ? "related"
      : field.includes("Diseases")
        ? "symptom-of"
        : field.includes("Foods")
          ? "alternative"
          : "related";

    for (const target of ids) {
      explicit.push({ type, target, weight: 0.7 });
    }
  }

  return explicit;
}

function buildGraphNodes(): KnowledgeGraphNode[] {
  return loadAllSummaries().map((s) => ({
    id: s.id,
    title: s.title,
    entityType: s.entityType,
    category: s.category,
    url: s.url,
    summary: s.summary,
  }));
}

function buildGraphEdges(): KnowledgeGraphEdge[] {
  const articles = loadAllArticles();
  const edges: KnowledgeGraphEdge[] = [];
  const seen = new Set<string>();

  for (const article of articles) {
    const relationships = extractExplicitRelationships(article);

    for (const rel of relationships) {
      const edgeKey = `${article.id}:${rel.type}:${rel.target}`;
      if (seen.has(edgeKey)) continue;
      seen.add(edgeKey);

      edges.push({
        source: article.id,
        target: rel.target,
        type: rel.type,
        label: rel.label,
        weight: rel.weight ?? 0.5,
      });
    }
  }

  return edges;
}

export function getKnowledgeGraphForArticle(articleId: string): {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
} {
  const allNodes = buildGraphNodes();
  const allEdges = buildGraphEdges();
  const nodeIds = new Set<string>([articleId]);

  const directEdges = allEdges.filter(
    (e) => e.source === articleId || e.target === articleId
  );

  for (const edge of directEdges) {
    nodeIds.add(edge.source);
    nodeIds.add(edge.target);
  }

  const nodes = allNodes.filter((n) => nodeIds.has(n.id));
  const edges = directEdges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return { nodes, edges };
}

function dedupeSummaries(items: ArticleSummary[]): ArticleSummary[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function resolveTargets(
  article: Article,
  type?: Relationship["type"]
): ArticleSummary[] {
  const relationships = extractExplicitRelationships(article);
  const filtered = type
    ? relationships.filter((r) => r.type === type)
    : relationships;

  const ids = filtered.map((r) => r.target);
  return resolveArticleIds(ids);
}

export function buildInternalLinkSections(
  article: Article
): InternalLinkSection[] {
  const sections: InternalLinkSection[] = [];
  const allSummaries = loadAllSummaries();

  const related = dedupeSummaries([
    ...resolveTargets(article, "related"),
    ...resolveTargets(article, "see-also"),
  ]);
  if (related.length) {
    sections.push({
      id: "related-topics",
      title: "Related Topics",
      articles: related.slice(0, 12),
    });
  }

  const compared = resolveTargets(article, "compared");
  if (compared.length) {
    sections.push({
      id: "frequently-compared",
      title: "Frequently Compared",
      articles: compared.slice(0, 6),
    });
  }

  const children = resolveTargets(article, "child");
  if (children.length) {
    sections.push({
      id: "child-topics",
      title: "Explore Further",
      description: "Deeper topics within this subject",
      articles: children.slice(0, 8),
    });
  }

  const siblings = resolveTargets(article, "sibling");
  if (siblings.length) {
    sections.push({
      id: "sibling-articles",
      title: "Similar Articles",
      articles: siblings.slice(0, 8),
    });
  }

  const nextReading = resolveTargets(article, "next-reading");
  if (nextReading.length) {
    sections.push({
      id: "next-reading",
      title: "Next Reading",
      description: "Continue your learning path",
      articles: nextReading.slice(0, 4),
    });
  }

  const prerequisites = resolveTargets(article, "prerequisite");
  if (prerequisites.length) {
    sections.push({
      id: "beginner-guides",
      title: "Start Here",
      description: "Recommended reading before this article",
      articles: prerequisites.slice(0, 4),
    });
  }

  const parent = resolveTargets(article, "parent");
  if (parent.length) {
    sections.push({
      id: "parent-topic",
      title: "Parent Topic",
      articles: parent.slice(0, 2),
    });
  }

  const sameCategory = allSummaries
    .filter(
      (s) =>
        s.category === article.category &&
        s.id !== article.id &&
        !related.some((r) => r.id === s.id)
    )
    .slice(0, 6);

  if (sameCategory.length) {
    sections.push({
      id: "category-explorer",
      title: "More in This Category",
      articles: sameCategory,
    });
  }

  const beginner = allSummaries
    .filter(
      (s) =>
        s.difficulty === "beginner" &&
        s.category === article.category &&
        s.id !== article.id
    )
    .slice(0, 4);

  if (beginner.length && article.difficulty !== "beginner") {
    sections.push({
      id: "beginner-guides-category",
      title: "Beginner Guides",
      articles: beginner,
    });
  }

  const advanced = allSummaries
    .filter(
      (s) =>
        (s.difficulty === "advanced" || s.difficulty === "expert") &&
        s.category === article.category &&
        s.id !== article.id
    )
    .slice(0, 4);

  if (advanced.length) {
    sections.push({
      id: "advanced-guides",
      title: "Advanced Guides",
      articles: advanced,
    });
  }

  return sections;
}

export function getParentTopic(article: Article): ArticleSummary | undefined {
  const parents = resolveTargets(article, "parent");
  return parents[0];
}

export function getPopularInCategory(
  category: string,
  excludeId: string,
  limit = 6
): ArticleSummary[] {
  return loadAllSummaries()
    .filter((s) => s.category === category && s.id !== excludeId)
    .slice(0, limit);
}

export function getRecentlyUpdated(
  excludeId: string,
  limit = 6
): ArticleSummary[] {
  return loadAllSummaries()
    .filter((s) => s.id !== excludeId && s.updatedAt)
    .sort(
      (a, b) =>
        new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime()
    )
    .slice(0, limit);
}

export function getYouMightAlsoLike(
  article: Article,
  limit = 8
): ArticleSummary[] {
  const graph = getKnowledgeGraphForArticle(article.id);
  const connectedIds = graph.edges
    .filter((e) => e.source === article.id)
    .sort((a, b) => b.weight - a.weight)
    .map((e) => e.target);

  const connected = resolveArticleIds(connectedIds);

  if (connected.length >= limit) return connected.slice(0, limit);

  const sameType = loadAllSummaries()
    .filter(
      (s) =>
        s.entityType === article.entityType &&
        s.id !== article.id &&
        !connected.some((c) => c.id === s.id)
    )
    .slice(0, limit - connected.length);

  return dedupeSummaries([...connected, ...sameType]).slice(0, limit);
}

export function getRelatedByEntityType(
  article: Article,
  entityType: string,
  limit = 6
): ArticleSummary[] {
  const targets = extractExplicitRelationships(article).map((r) => r.target);
  return resolveArticleIds(targets)
    .filter((s) => s.entityType === entityType)
    .slice(0, limit);
}

export { getSummaryById };
