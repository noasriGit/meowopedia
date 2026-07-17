import type { CategorySlug } from "@/config/taxonomy";

export type SitemapContentType =
  | "homepage"
  | "category"
  | "article"
  | "static"
  | "tool";

export interface SitemapEntry {
  id: string;
  title: string;
  url: string;
  description?: string;
  contentType: SitemapContentType;
  category?: CategorySlug;
  publishedAt?: string;
  updatedAt?: string;
  featured?: boolean;
  sortPriority?: number;
}

export interface SitemapCategoryGroup {
  slug: CategorySlug;
  title: string;
  description: string;
  hubUrl: string;
  entries: SitemapEntry[];
}

export interface SitemapPageData {
  featured: SitemapEntry[];
  recent: SitemapEntry[];
  categories: SitemapCategoryGroup[];
  tools: SitemapEntry[];
  staticPages: SitemapEntry[];
  alphabetical: Record<string, SitemapEntry[]>;
  totalIndexable: number;
}

export interface SitemapValidationIssue {
  code: string;
  message: string;
  entryId?: string;
  url?: string;
}

export interface SitemapValidationResult {
  valid: boolean;
  issues: SitemapValidationIssue[];
  stats: {
    total: number;
    byContentType: Record<SitemapContentType, number>;
    excluded: Record<string, number>;
  };
}
