#!/usr/bin/env node
/**
 * Replaces Wikimedia URLs with Flickr/Openverse URLs to avoid rate limits and 404s.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const ARTICLE_IMAGES_PATH = path.join(ROOT, "content", "images", "article-images.json");
const DELAY_MS = 600;

const CAT_KEYWORDS = /\b(cat|cats|kitten|feline|kitty)\b/i;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildQuery(id, asset, article) {
  const alt = asset.alt ?? "";
  const title = article?.title ?? "";
  const category = article?.category ?? asset.category ?? "";

  if (category === "foods" || category === "plants") {
    return alt.split(" ").slice(0, 4).join(" ");
  }
  if (CAT_KEYWORDS.test(alt)) return alt.split(" ").slice(0, 6).join(" ");
  return `cat ${alt}`.split(" ").slice(0, 6).join(" ");
}

function isFlickrUrl(url) {
  return url.includes("live.staticflickr.com");
}

async function searchOpenverse(query, usedUrls) {
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
    if (!item.url || usedUrls.has(item.url)) continue;
    if (!isFlickrUrl(item.url)) continue;
    const licenseMap = { cc0: "cc0", by: "cc-by", "by-sa": "cc-by-sa" };
    const license = licenseMap[item.license?.toLowerCase()] ?? "cc-by";
    return {
      url: item.url,
      alt: item.title ?? query,
      license,
      attribution: item.creator ?? "Flickr contributor",
      source: item.source ?? "Openverse",
      width: item.width,
      height: item.height,
    };
  }
  return null;
}

function loadArticles() {
  const map = new Map();
  const dirs = fs.readdirSync(path.join(ROOT, "content")).filter(
    (d) => !["pages", "images"].includes(d)
  );
  for (const dir of dirs) {
    const dirPath = path.join(ROOT, "content", dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".mdx")) continue;
      const filePath = path.join(dirPath, file);
      const { data } = matter(fs.readFileSync(filePath, "utf8"));
      if (data.id) map.set(data.id, { ...data, filePath });
    }
  }
  return map;
}

function updateMdx(filePath, url, alt) {
  const parsed = matter(fs.readFileSync(filePath, "utf8"));
  parsed.data.featuredImage = url;
  parsed.data.featuredImageAlt = alt;
  fs.writeFileSync(
    filePath,
    matter.stringify(parsed.content, parsed.data, { lineWidth: 120 }),
    "utf8"
  );
}

async function main() {
  const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));
  const articles = loadArticles();
  const usedUrls = new Set(
    Object.values(articleImages)
      .map((a) => a.url)
      .filter((url) => !url.includes("upload.wikimedia.org"))
  );

  const wikimediaIds = Object.entries(articleImages)
    .filter(([, asset]) => asset.url?.includes("upload.wikimedia.org"))
    .map(([id]) => id);

  console.log(`Migrating ${wikimediaIds.length} Wikimedia URLs to Flickr...`);

  const failures = [];

  for (const id of wikimediaIds) {
    const asset = articleImages[id];
    const article = articles.get(id);
    const queries = [
      buildQuery(id, asset, article),
      article?.title?.replace(/\?/g, "") ?? "",
      `cat ${id.replace(/-/g, " ")}`,
    ].filter(Boolean);

    let replacement = null;
    for (const query of queries) {
      replacement = await searchOpenverse(query, usedUrls);
      if (replacement) break;
      await sleep(DELAY_MS);
    }

    if (!replacement) {
      console.warn(`FAILED: ${id}`);
      failures.push(id);
      continue;
    }

    usedUrls.add(replacement.url);
    articleImages[id] = {
      ...replacement,
      category: asset.category ?? article?.category,
    };

    if (article?.filePath) {
      updateMdx(article.filePath, replacement.url, replacement.alt);
    }

    console.log(`OK ${id}: ${replacement.url.slice(0, 70)}...`);
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(ARTICLE_IMAGES_PATH, JSON.stringify(articleImages, null, 2) + "\n");

  const wikimediaRemaining = Object.values(articleImages).filter((a) =>
    a.url?.includes("upload.wikimedia.org")
  ).length;

  console.log(`\nDone. Wikimedia remaining: ${wikimediaRemaining}. Failures: ${failures.length}`);
  if (failures.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
