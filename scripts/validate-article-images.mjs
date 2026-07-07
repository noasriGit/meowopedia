#!/usr/bin/env node
/**
 * Validates that every encyclopedia article has a unique, reachable featured image.
 * Usage: npm run validate-images
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content");
const ARTICLE_IMAGES_PATH = path.join(CONTENT_ROOT, "images", "article-images.json");

const EXCLUDE_DIRS = new Set(["pages", "images"]);
const ALLOWED_LICENSES = new Set([
  "cc0",
  "cc-by",
  "cc-by-sa",
  "unsplash",
  "pexels",
  "editorial",
  "original",
  "purchased",
]);

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

function isRemoteUrl(value) {
  return /^https?:\/\//.test(value);
}

function isLocalImage(value) {
  return value?.startsWith("/images/");
}

async function checkUrl(url) {
  try {
    const headers = { "User-Agent": "Meowopedia/1.0 (image-validator)" };
    const res = await fetch(url, { method: "HEAD", redirect: "follow", headers });
    if (res.ok) return { ok: true };
    if (res.status === 405 || res.status === 403 || res.status === 429) {
      const getRes = await fetch(url, { method: "GET", redirect: "follow", headers });
      if (getRes.ok) return { ok: true };
      if (getRes.status === 429) return { ok: true, warning: "rate-limited (assumed ok)" };
      return { ok: false, status: getRes.status };
    }
    return { ok: false, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function main() {
  const categoryDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE_DIRS.has(e.name))
    .map((e) => path.join(CONTENT_ROOT, e.name));

  const files = categoryDirs.flatMap(collectMdxFiles);
  const articleImages = fs.existsSync(ARTICLE_IMAGES_PATH)
    ? JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"))
    : {};

  const errors = [];
  const warnings = [];
  const urlToIds = new Map();

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);
    if (!data.id || !data.category) continue;

    const id = data.id;
    const featuredImage = data.featuredImage;
    const registryEntry = articleImages[id];

    if (!featuredImage && !registryEntry?.url) {
      errors.push(`${id}: missing featuredImage in frontmatter and article-images.json`);
      continue;
    }

    const imageUrl = featuredImage ?? registryEntry?.url;

    if (!isRemoteUrl(imageUrl) && !isLocalImage(imageUrl)) {
      errors.push(`${id}: featuredImage is not a valid URL or local path: ${imageUrl}`);
    }

    if (isRemoteUrl(imageUrl)) {
      const existing = urlToIds.get(imageUrl) ?? [];
      existing.push(id);
      urlToIds.set(imageUrl, existing);
    } else if (isLocalImage(imageUrl)) {
      const publicPath = path.join(ROOT, "public", imageUrl.replace(/^\//, ""));
      if (!fs.existsSync(publicPath)) {
        errors.push(`${id}: local image file missing: ${imageUrl}`);
      }
    }

    const license = registryEntry?.license;
    if (license && !ALLOWED_LICENSES.has(license)) {
      warnings.push(`${id}: unusual license "${license}"`);
    }

    if (!data.featuredImageAlt && !registryEntry?.alt) {
      warnings.push(`${id}: missing featuredImageAlt`);
    }
  }

  for (const [url, ids] of urlToIds) {
    if (ids.length > 1) {
      errors.push(`Duplicate URL used by ${ids.join(", ")}: ${url}`);
    }
  }

  console.log("Checking remote image availability...");
  let checkIndex = 0;
  for (const [url, ids] of urlToIds) {
    checkIndex++;
    if (checkIndex > 1) await new Promise((r) => setTimeout(r, 500));
    const result = await checkUrl(url);
    if (result.warning) {
      warnings.push(`${result.warning}: ${ids.join(", ")}`);
    } else if (!result.ok) {
      errors.push(`Unreachable URL for ${ids.join(", ")}: ${url} (status ${result.status ?? "unknown"})`);
    }
  }

  if (warnings.length) {
    console.warn(`\nWarnings (${warnings.length}):`);
    for (const w of warnings) console.warn(`  - ${w}`);
  }

  if (errors.length) {
    console.error(`\nValidation failed (${errors.length} errors):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(`\nValidation passed for ${files.length} MDX files (${urlToIds.size} unique remote images).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
