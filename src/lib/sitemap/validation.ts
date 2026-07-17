import { SITEMAP_REDIRECT_SOURCES } from "@/config/sitemap";
import { loadAllArticles } from "@/lib/content/loader";
import { absoluteUrl } from "@/lib/utils";
import { getAllSitemapEntries } from "@/lib/sitemap/entries";
import type {
  SitemapContentType,
  SitemapValidationIssue,
  SitemapValidationResult,
} from "@/lib/sitemap/types";

function normalizeUrl(url: string): string {
  if (!url.startsWith("/")) return `/${url}`;
  return url.endsWith("/") && url.length > 1 ? url.slice(0, -1) : url;
}

function isValidPath(url: string): boolean {
  if (!url.startsWith("/")) return false;
  if (url.includes("?")) return false;
  if (url.includes("#")) return false;
  if (/\s/.test(url)) return false;
  return true;
}

export function validateSitemapEntries(): SitemapValidationResult {
  const entries = getAllSitemapEntries();
  const issues: SitemapValidationIssue[] = [];
  const byContentType = {} as Record<SitemapContentType, number>;
  const excluded: Record<string, number> = {
    noindex: 0,
    redirectSource: 0,
    duplicateUrl: 0,
  };

  const articles = loadAllArticles();
  for (const article of articles) {
    if (article.noindex) excluded.noindex += 1;
    if ((SITEMAP_REDIRECT_SOURCES as readonly string[]).includes(normalizeUrl(article.url))) {
      excluded.redirectSource += 1;
    }
  }

  const seenIds = new Map<string, string>();
  const seenUrls = new Map<string, string>();

  for (const entry of entries) {
    byContentType[entry.contentType] = (byContentType[entry.contentType] ?? 0) + 1;

    if (!entry.id) {
      issues.push({ code: "missing-id", message: "Entry is missing a stable ID." });
    } else if (seenIds.has(entry.id)) {
      issues.push({
        code: "duplicate-id",
        message: `Duplicate ID "${entry.id}" (also used by ${seenIds.get(entry.id)}).`,
        entryId: entry.id,
      });
    } else {
      seenIds.set(entry.id, entry.title);
    }

    if (!entry.title?.trim()) {
      issues.push({
        code: "missing-title",
        message: "Entry is missing a title.",
        entryId: entry.id,
        url: entry.url,
      });
    }

    if (!entry.url) {
      issues.push({
        code: "missing-url",
        message: "Entry is missing a URL.",
        entryId: entry.id,
      });
      continue;
    }

    if (!isValidPath(entry.url)) {
      issues.push({
        code: "invalid-url",
        message: `Invalid URL path: ${entry.url}`,
        entryId: entry.id,
        url: entry.url,
      });
    }

    const normalized = normalizeUrl(entry.url);
    if (seenUrls.has(normalized)) {
      excluded.duplicateUrl += 1;
      issues.push({
        code: "duplicate-url",
        message: `Duplicate URL ${normalized} (also used by ${seenUrls.get(normalized)}).`,
        entryId: entry.id,
        url: normalized,
      });
    } else {
      seenUrls.set(normalized, entry.title);
    }

    if (normalized.endsWith("/") && normalized.length > 1) {
      issues.push({
        code: "trailing-slash",
        message: `URL should not have a trailing slash: ${normalized}`,
        entryId: entry.id,
        url: normalized,
      });
    }

    if ((SITEMAP_REDIRECT_SOURCES as readonly string[]).includes(normalized)) {
      issues.push({
        code: "redirect-source",
        message: `Redirect source URL must not appear in sitemap: ${normalized}`,
        entryId: entry.id,
        url: normalized,
      });
    }

    if (entry.contentType === "article" && entry.category) {
      const categoryGroup = entries.find(
        (e) => e.contentType === "category" && e.category === entry.category
      );
      if (!categoryGroup) {
        issues.push({
          code: "missing-category-reference",
          message: `Article "${entry.title}" references missing category "${entry.category}".`,
          entryId: entry.id,
          url: entry.url,
        });
      }
    }

    try {
      absoluteUrl(entry.url);
    } catch {
      issues.push({
        code: "invalid-canonical",
        message: `Could not build canonical URL for ${entry.url}`,
        entryId: entry.id,
        url: entry.url,
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues,
    stats: {
      total: entries.length,
      byContentType,
      excluded,
    },
  };
}
