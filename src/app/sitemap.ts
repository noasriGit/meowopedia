import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getXmlSitemapEntries } from "@/lib/sitemap/entries";

function xmlPriority(entry: ReturnType<typeof getXmlSitemapEntries>[number]): number {
  switch (entry.contentType) {
    case "homepage":
      return 1;
    case "category":
      return 0.9;
    case "tool":
      return 0.8;
    case "article":
      return 0.7;
    case "static":
      return 0.4;
    default:
      return 0.5;
  }
}

function xmlChangeFrequency(
  entry: ReturnType<typeof getXmlSitemapEntries>[number]
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  switch (entry.contentType) {
    case "homepage":
    case "category":
      return "weekly";
    case "article":
    case "tool":
      return "monthly";
    case "static":
      return "yearly";
    default:
      return "monthly";
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;

  return getXmlSitemapEntries().map((entry) => ({
    url: `${base}${entry.url}`,
    lastModified: entry.updatedAt
      ? new Date(entry.updatedAt)
      : entry.publishedAt
        ? new Date(entry.publishedAt)
        : new Date(),
    changeFrequency: xmlChangeFrequency(entry),
    priority: xmlPriority(entry),
  }));
}
