#!/usr/bin/env node
/**
 * Audit a single article's featured image against Meowopedia heuristics.
 *
 * Usage:
 *   npm run check-article-image -- --id food-eggs
 *   npm run check-article-image -- --id food-eggs --json
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { flagImageIssues } from "./editorial/image-relevance.mjs";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content");
const ARTICLE_IMAGES_PATH = path.join(CONTENT_ROOT, "images", "article-images.json");
const EXCLUDE_DIRS = new Set(["pages", "images"]);

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function collectMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      files.push(...collectMdxFiles(full));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function findArticle(id) {
  const categoryDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE_DIRS.has(e.name))
    .map((e) => path.join(CONTENT_ROOT, e.name));

  for (const filePath of categoryDirs.flatMap(collectMdxFiles)) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);
    if (data.id !== id) continue;
    return {
      filePath,
      id: data.id,
      title: data.title ?? id,
      slug: data.slug ?? "",
      category: data.category,
      featuredImage: data.featuredImage,
      featuredImageAlt: data.featuredImageAlt,
    };
  }
  return null;
}

function main() {
  const id = readArg("--id");
  const asJson = process.argv.includes("--json");

  if (!id) {
    console.error("Usage: npm run check-article-image -- --id <article-id> [--json]");
    process.exit(1);
  }

  const article = findArticle(id);
  if (!article) {
    console.error(`Article not found: ${id}`);
    process.exit(1);
  }

  const articleImages = fs.existsSync(ARTICLE_IMAGES_PATH)
    ? JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"))
    : {};

  const registry = articleImages[id];
  const src = article.featuredImage ?? registry?.url ?? "";
  const alt = article.featuredImageAlt ?? registry?.alt ?? "";
  const flags = flagImageIssues(article, { ...registry, alt, url: src });

  const result = {
    id,
    title: article.title,
    category: article.category,
    url: src || null,
    alt: alt || null,
    flags,
    ok: flags.length === 0,
  };

  if (asJson) {
    console.log(JSON.stringify(result, null, 2));
  } else if (result.ok) {
    console.log(`OK: ${id} — ${alt}`);
  } else {
    console.error(`FLAGGED: ${id}`);
    console.error(`  Alt: ${alt || "(none)"}`);
    console.error(`  URL: ${src || "(none)"}`);
    for (const flag of flags) console.error(`  - ${flag}`);
  }

  process.exitCode = result.ok ? 0 : 1;
}

main();
