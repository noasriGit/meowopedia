import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import {
  isStaticPageSlug,
  staticPagePath,
  STATIC_PAGE_SLUGS,
  type StaticPageSlug,
} from "@/config/static-pages";
import type { StaticPage } from "@/types/static-page";

const PAGES_ROOT = path.join(process.cwd(), "content", "pages");

const staticPageFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(20),
  lastUpdated: z.string(),
});

let pageCache: StaticPage[] | null = null;

function parsePageFile(filePath: string): StaticPage {
  const filename = path.basename(filePath, path.extname(filePath));
  if (!isStaticPageSlug(filename)) {
    throw new Error(
      `Invalid static page slug "${filename}" in ${filePath}. Expected one of: ${STATIC_PAGE_SLUGS.join(", ")}`
    );
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = staticPageFrontmatterSchema.parse(data);

  return {
    slug: filename,
    title: frontmatter.title,
    description: frontmatter.description,
    lastUpdated: frontmatter.lastUpdated,
    content,
    path: staticPagePath(filename),
  };
}

function loadAllPagesUncached(): StaticPage[] {
  if (!fs.existsSync(PAGES_ROOT)) return [];

  const files = fs
    .readdirSync(PAGES_ROOT)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => path.join(PAGES_ROOT, name));

  return files.map(parsePageFile);
}

export function loadAllStaticPages(): StaticPage[] {
  if (pageCache) return pageCache;
  pageCache = loadAllPagesUncached();
  return pageCache;
}

export function getAllStaticPageSlugs(): StaticPageSlug[] {
  return loadAllStaticPages().map((page) => page.slug);
}

export function loadStaticPage(slug: StaticPageSlug): StaticPage | undefined {
  return loadAllStaticPages().find((page) => page.slug === slug);
}

export function invalidateStaticPageCache(): void {
  pageCache = null;
}
