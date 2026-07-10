#!/usr/bin/env node
/**
 * Normalizes stored image URLs: full Wikimedia originals, no broken thumb paths.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content");
const ARTICLE_IMAGES_PATH = path.join(CONTENT_ROOT, "images", "article-images.json");
const BANNERS_PATH = path.join(CONTENT_ROOT, "images", "category-banners.json");
const EXCLUDE_DIRS = new Set(["pages", "images"]);

function fullWikimediaUrl(url) {
  if (!url.includes("upload.wikimedia.org")) return url;
  const thumbMatch = url.match(
    /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/([0-9a-f]\/[0-9a-f]{2}\/.+?)\/\d+px-(.+)$/i
  );
  if (thumbMatch) {
    return `https://upload.wikimedia.org/wikipedia/commons/${thumbMatch[1]}`;
  }
  return url;
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

function main() {
  let changes = 0;

  const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));
  for (const asset of Object.values(articleImages)) {
    if (!asset.url) continue;
    const next = fullWikimediaUrl(asset.url);
    if (next !== asset.url) {
      asset.url = next;
      changes += 1;
    }
  }
  fs.writeFileSync(ARTICLE_IMAGES_PATH, `${JSON.stringify(articleImages, null, 2)}\n`);

  const banners = JSON.parse(fs.readFileSync(BANNERS_PATH, "utf8"));
  for (const banner of Object.values(banners)) {
    if (!banner.url) continue;
    const next = fullWikimediaUrl(banner.url);
    if (next !== banner.url) {
      banner.url = next;
      changes += 1;
    }
  }
  fs.writeFileSync(BANNERS_PATH, `${JSON.stringify(banners, null, 2)}\n`);

  for (const filePath of collectMdxFiles(CONTENT_ROOT)) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    if (!parsed.data.featuredImage) continue;
    const next = fullWikimediaUrl(parsed.data.featuredImage);
    if (next !== parsed.data.featuredImage) {
      parsed.data.featuredImage = next;
      fs.writeFileSync(
        filePath,
        matter.stringify(parsed.content, parsed.data, { lineWidth: 120 }),
        "utf8"
      );
      changes += 1;
    }
  }

  console.log(`Normalized ${changes} image URLs to full Wikimedia originals.`);
}

main();
