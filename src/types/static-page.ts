import type { StaticPageSlug } from "@/config/static-pages";

export interface StaticPage {
  slug: StaticPageSlug;
  title: string;
  description: string;
  lastUpdated: string;
  content: string;
  path: string;
}
