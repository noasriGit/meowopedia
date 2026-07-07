import type { EntityType, CategorySlug } from "@/config/taxonomy";

export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type RelationshipType =
  | "parent"
  | "child"
  | "sibling"
  | "related"
  | "compared"
  | "treats"
  | "causes"
  | "symptom-of"
  | "breed-predisposition"
  | "alternative"
  | "see-also"
  | "prerequisite"
  | "next-reading";

export interface Relationship {
  type: RelationshipType;
  target: string;
  weight?: number;
  label?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Citation {
  title: string;
  url: string;
  publisher?: string;
  accessedAt?: string;
}

export interface Author {
  name: string;
  slug?: string;
  credentials?: string;
  avatar?: string;
}

export interface ArticleFrontmatter {
  id: string;
  title: string;
  slug: string;
  category: CategorySlug;
  entityType: EntityType;
  aliases?: string[];
  summary: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  difficulty?: Difficulty;
  lastReviewed?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: Author;
  medicalReviewer?: Author;
  readingTime?: number;
  faq?: FAQItem[];
  citations?: Citation[];
  relationships?: Relationship[];
  relatedArticles?: string[];
  relatedBreeds?: string[];
  relatedDiseases?: string[];
  relatedFoods?: string[];
  relatedPlants?: string[];
  relatedSymptoms?: string[];
  relatedMedications?: string[];
  relatedBehaviors?: string[];
  tags?: string[];
  noindex?: boolean;
  canonical?: string;
  disclaimerTier?: "medical" | "safety" | "general" | "none";
  /** Entity-specific structured data */
  data?: Record<string, unknown>;
}

export interface Article extends ArticleFrontmatter {
  content: string;
  readingTimeMinutes: number;
  url: string;
}

export interface ArticleSummary
  extends Pick<
    Article,
    | "id"
    | "title"
    | "slug"
    | "category"
    | "entityType"
    | "summary"
    | "aliases"
    | "featuredImage"
    | "featuredImageAlt"
    | "difficulty"
    | "lastReviewed"
    | "updatedAt"
    | "readingTimeMinutes"
    | "url"
    | "tags"
    | "data"
  > {}

export interface InternalLinkSection {
  id: string;
  title: string;
  description?: string;
  articles: ArticleSummary[];
}

export interface KnowledgeGraphNode {
  id: string;
  title: string;
  entityType: EntityType;
  category: CategorySlug;
  url: string;
  summary: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  type: RelationshipType;
  label?: string;
  weight: number;
}

export interface SearchDocument {
  id: string;
  title: string;
  slug: string;
  category: CategorySlug;
  entityType: EntityType;
  url: string;
  summary: string;
  aliases: string[];
  tags: string[];
  searchTerms: string[];
  bodyExcerpt: string;
}

export interface CategoryFilterOption {
  key: string;
  label: string;
  values: { value: string; label: string; count: number }[];
}

export interface CategoryPageData {
  slug: CategorySlug;
  title: string;
  description: string;
  articles: ArticleSummary[];
  featured: ArticleSummary[];
  newest: ArticleSummary[];
  filters: CategoryFilterOption[];
  relatedCategories: CategorySlug[];
}
