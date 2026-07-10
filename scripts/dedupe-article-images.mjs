#!/usr/bin/env node
/** Assign unique Wikimedia images to any article sharing a duplicate featuredImage URL. */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content");
const ARTICLE_IMAGES_PATH = path.join(CONTENT_ROOT, "images", "article-images.json");
const EXCLUDE_DIRS = new Set(["pages", "images"]);
const DELAY_MS = 350;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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

async function searchWikimedia(query, used) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap cat ${query}`,
    gsrnamespace: "6",
    gsrlimit: "20",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    format: "json",
    origin: "*",
  });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!res.ok) return null;
  const data = await res.json();
  for (const page of Object.values(data.query?.pages ?? {})) {
    const url = page.imageinfo?.[0]?.url;
    if (!url || used.has(url) || url.includes("live.staticflickr.com")) continue;
    const meta = page.imageinfo?.[0]?.extmetadata ?? {};
    const artist = meta.Artist?.value?.replace(/<[^>]+>/g, "").trim();
    return {
      url,
      alt: page.title?.replace(/^File:/, "").replace(/\.[^.]+$/, "").replace(/_/g, " ") ?? query,
      license: "cc-by-sa",
      attribution: artist || "Wikimedia contributor",
      source: "Wikimedia Commons",
    };
  }
  return null;
}

async function main() {
  const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));
  const used = new Set(
    Object.values(articleImages)
      .map((a) => a.url)
      .filter(Boolean)
  );

  const urlToIds = new Map();
  for (const filePath of collectMdxFiles(CONTENT_ROOT)) {
    const { data } = matter(fs.readFileSync(filePath, "utf8"));
    if (!data.id || !data.featuredImage?.startsWith("http")) continue;
    const ids = urlToIds.get(data.featuredImage) ?? [];
    ids.push({ id: data.id, filePath, title: data.title ?? data.id });
    urlToIds.set(data.featuredImage, ids);
  }

  let fixed = 0;
  for (const [url, entries] of urlToIds) {
    if (entries.length < 2) continue;
    for (const entry of entries.slice(1)) {
      const query = entry.title.split(" ").slice(0, 4).join(" ");
      let asset = null;
      for (let attempt = 0; attempt < 5 && !asset; attempt += 1) {
        asset = await searchWikimedia(`${query} ${attempt}`, used);
        await sleep(DELAY_MS);
      }
      if (!asset) {
        console.warn(`Could not find unique image for ${entry.id}`);
        continue;
      }
      used.add(asset.url);
      articleImages[entry.id] = { ...asset, category: articleImages[entry.id]?.category };
      const parsed = matter(fs.readFileSync(entry.filePath, "utf8"));
      parsed.data.featuredImage = asset.url;
      parsed.data.featuredImageAlt = asset.alt;
      fs.writeFileSync(
        entry.filePath,
        matter.stringify(parsed.content, parsed.data, { lineWidth: 120 }),
        "utf8"
      );
      fixed += 1;
      console.log(`Fixed ${entry.id}`);
    }
  }

  fs.writeFileSync(ARTICLE_IMAGES_PATH, `${JSON.stringify(articleImages, null, 2)}\n`);
  console.log(`Deduplicated ${fixed} article images.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
