#!/usr/bin/env node
/**
 * Replaces unstable Flickr/Openverse URLs with Wikimedia Commons thumbnails.
 * Usage: node scripts/replace-flickr-images.mjs
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
const DELAY_MS = 400;

const HERD_OF_CATS_FIX = {
  from: "https://upload.wikimedia.org/wikipedia/commons/f/f/Herd_of_Cats.jpg",
  to: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Herd_of_Cats.jpg/1200px-Herd_of_Cats.jpg",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function wikimediaThumb(url, width = 1200) {
  return url;
}

function isFlickr(url) {
  return typeof url === "string" && url.includes("live.staticflickr.com");
}

async function searchWikimedia(query, used) {
  const params = new URLSearchParams({
    q: query,
    license: "cc0,by,by-sa",
    page_size: "20",
    mature: "false",
  });
  const res = await fetch(`https://api.openverse.org/v1/images/?${params}`);
  if (!res.ok) return null;
  const data = await res.json();

  for (const item of data.results ?? []) {
    const url = item.url ?? "";
    if (!url.includes("upload.wikimedia.org")) continue;
    if (used.has(url)) continue;
    const licenseMap = { cc0: "cc0", by: "cc-by", "by-sa": "cc-by-sa" };
    return {
      url: wikimediaThumb(url),
      alt: item.title ?? query,
      license: licenseMap[item.license?.toLowerCase()] ?? "cc-by",
      attribution: item.creator ?? "Wikimedia contributor",
      source: "Wikimedia Commons",
      width: item.width,
      height: item.height,
    };
  }
  return null;
}

function walkJson(value, replacer) {
  if (typeof value === "string") return replacer(value);
  if (Array.isArray(value)) return value.map((v) => walkJson(v, replacer));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = walkJson(v, replacer);
    }
    return out;
  }
  return value;
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

async function main() {
  const used = new Set();
  const replacements = new Map();

  async function resolveReplacement(url, context = "cat") {
    if (replacements.has(url)) return replacements.get(url);
    if (url === HERD_OF_CATS_FIX.from) {
      replacements.set(url, HERD_OF_CATS_FIX.to);
      return HERD_OF_CATS_FIX.to;
    }
    if (!isFlickr(url) && url.includes("upload.wikimedia.org")) {
      const thumb = wikimediaThumb(url);
      replacements.set(url, thumb);
      return thumb;
    }
    if (!isFlickr(url)) return url;

    const asset = await searchWikimedia(`${context} cat`, used);
    await sleep(DELAY_MS);
    if (!asset) {
      return null;
    }
    used.add(asset.url);
    replacements.set(url, asset.url);
    return asset;
  }

  // article-images.json
  const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));
  let articleUpdates = 0;
  for (const [id, asset] of Object.entries(articleImages)) {
    if (!asset.url) continue;
    if (isFlickr(asset.url) || asset.url === HERD_OF_CATS_FIX.from) {
      const result = await resolveReplacement(asset.url, asset.alt ?? id);
      if (typeof result === "string") {
        asset.url = result;
      } else {
        Object.assign(asset, result);
      }
      articleUpdates += 1;
    } else if (asset.url.includes("upload.wikimedia.org") && !asset.url.includes("/thumb/")) {
      asset.url = wikimediaThumb(asset.url);
      articleUpdates += 1;
    }
  }
  fs.writeFileSync(ARTICLE_IMAGES_PATH, `${JSON.stringify(articleImages, null, 2)}\n`);

  // category banners
  const banners = JSON.parse(fs.readFileSync(BANNERS_PATH, "utf8"));
  let bannerUpdates = 0;
  for (const [category, banner] of Object.entries(banners)) {
    if (!banner.url) continue;
    if (isFlickr(banner.url)) {
      const result = await resolveReplacement(banner.url, `${category} cat banner`);
      banner.url = typeof result === "string" ? result : result.url;
      if (typeof result !== "string") {
        banner.alt = result.alt ?? banner.alt;
        banner.license = result.license ?? banner.license;
        banner.attribution = result.attribution ?? banner.attribution;
        banner.source = result.source ?? banner.source;
      }
      bannerUpdates += 1;
    } else if (banner.url.includes("upload.wikimedia.org") && !banner.url.includes("/thumb/")) {
      banner.url = wikimediaThumb(banner.url);
      bannerUpdates += 1;
    }
  }
  fs.writeFileSync(BANNERS_PATH, `${JSON.stringify(banners, null, 2)}\n`);

  // MDX featuredImage fields
  const mdxFiles = collectMdxFiles(CONTENT_ROOT);
  let mdxUpdates = 0;
  for (const filePath of mdxFiles) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const image = parsed.data.featuredImage;
    if (!image || typeof image !== "string") continue;

    let next = image;
    if (isFlickr(image) || image === HERD_OF_CATS_FIX.from) {
      const result = await resolveReplacement(image, parsed.data.title ?? path.basename(filePath));
      next = typeof result === "string" ? result : result.url;
    } else if (image.includes("upload.wikimedia.org") && !image.includes("/thumb/")) {
      next = wikimediaThumb(image);
    }

    if (next !== image) {
      parsed.data.featuredImage = next;
      fs.writeFileSync(
        filePath,
        matter.stringify(parsed.content, parsed.data, { lineWidth: 120 }),
        "utf8"
      );
      mdxUpdates += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        articleImageEntries: articleUpdates,
        categoryBanners: bannerUpdates,
        mdxFiles: mdxUpdates,
        uniqueReplacements: replacements.size,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
