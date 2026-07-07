import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getAllCategorySlugs } from "@/lib/content/categories";
import { loadAllSummaries } from "@/lib/content/loader";
import { loadAllStaticPages } from "@/lib/content/static-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const articles = loadAllSummaries();
  const categories = getAllCategorySlugs();
  const staticPages = loadAllStaticPages();

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/search`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...categories.map((category) => ({
      url: `${base}/${category}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...staticPages.map((page) => ({
      url: `${base}${page.path}`,
      lastModified: new Date(page.lastUpdated),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    ...articles.map((article) => ({
      url: `${base}${article.url}`,
      lastModified: article.updatedAt
        ? new Date(article.updatedAt)
        : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
