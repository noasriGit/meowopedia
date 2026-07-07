#!/usr/bin/env node
/**
 * Sources copyright-free images for all encyclopedia articles.
 * Usage: npm run source-images
 * Optional env (.env.local): UNSPLASH_ACCESS_KEY, PEXELS_API_KEY
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { cleanQuery, isRelevantCandidate } from "./editorial/image-relevance.mjs";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT, "content");
const ARTICLE_IMAGES_PATH = path.join(CONTENT_ROOT, "images", "article-images.json");
const REPORT_PATH = path.join(CONTENT_ROOT, "images", "sourcing-report.json");

const EXCLUDE_DIRS = new Set(["pages", "images"]);
const USED_URLS = new Set();
const DELAY_MS = 350;

const CATEGORY_SOURCES = {
  breeds: ["wikimedia", "unsplash", "openverse"],
  behavior: ["wikimedia", "unsplash", "pexels", "openverse"],
  foods: ["wikimedia", "openverse"],
  plants: ["wikimedia", "openverse"],
  anatomy: ["wikimedia", "openverse"],
  health: ["wikimedia", "unsplash", "openverse"],
  symptoms: ["wikimedia", "unsplash", "openverse"],
  diseases: ["wikimedia", "unsplash", "openverse"],
  facts: ["wikimedia", "unsplash", "openverse"],
  guides: ["unsplash", "wikimedia", "openverse"],
  care: ["unsplash", "wikimedia", "openverse"],
  compare: ["unsplash", "wikimedia", "openverse"],
  nutrition: ["wikimedia", "unsplash", "openverse"],
};

function loadEnv() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function parseArticle(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  if (!data.id || !data.category) return null;
  return {
    filePath,
    id: data.id,
    title: data.title ?? "",
    slug: data.slug ?? "",
    category: data.category,
    entityType: data.entityType ?? "",
    tags: data.tags ?? [],
    aliases: data.aliases ?? [],
    featuredImage: data.featuredImage,
    featuredImageAlt: data.featuredImageAlt,
  };
}


function buildQueries(article) {
  const { category, title, slug, tags, aliases } = article;
  const primary = cleanQuery(title);
  const tag = tags[0] ?? "";
  const alias = aliases[0] ?? "";

  switch (category) {
    case "breeds": {
      const breedName = slug.replace(/-cat$/, "").replace(/-/g, " ");
      return [`${breedName} cat`, `${breedName}`, primary];
    }
    case "behavior":
      return [`cat ${tag || slug.replace(/^behavior-/, "").replace(/-/g, " ")}`, `cat ${primary}`, primary];
    case "foods":
      return [`cat ${slug.replace(/-/g, " ")}`, slug.replace(/-/g, " "), tag, alias].filter(Boolean);
    case "plants":
      return [`${slug.replace(/-/g, " ")} plant`, slug.replace(/-/g, " "), tag].filter(Boolean);
    case "anatomy":
      return [`cat ${slug.replace(/^anatomy-/, "").replace(/-/g, " ")}`, primary, tag].filter(Boolean);
    case "health":
    case "symptoms":
    case "diseases":
      return [`cat ${slug.replace(/-/g, " ")}`, `veterinary cat ${tag}`, primary].filter(Boolean);
    case "facts":
    case "guides":
    case "care":
    case "compare":
    case "nutrition":
      return [primary, tag, `cat ${slug.replace(/-/g, " ")}`].filter(Boolean);
    default:
      return [primary, tag].filter(Boolean);
  }
}

function normalizeLicense(value) {
  if (!value) return null;
  const v = value.toLowerCase();
  if (v.includes("cc0") || v.includes("public domain") || v.includes("pd-")) return "cc0";
  if (v.includes("cc-by-sa") || v.includes("by-sa")) return "cc-by-sa";
  if (v.includes("cc-by") || v.includes("by 4") || v.includes("by 3") || v.includes("by 2")) return "cc-by";
  return null;
}

function isAllowedLicense(license) {
  return ["cc0", "cc-by", "cc-by-sa", "unsplash", "pexels"].includes(license);
}

function pickUnique(candidates, article) {
  for (const candidate of candidates) {
    if (!candidate?.url || USED_URLS.has(candidate.url)) continue;
    if (article && !isRelevantCandidate(candidate, article)) continue;
    USED_URLS.add(candidate.url);
    return candidate;
  }
  return null;
}

async function searchWikimedia(query) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6",
    gsrlimit: "15",
    prop: "imageinfo",
    iiprop: "url|size|extmetadata",
    iiurlwidth: "1600",
    format: "json",
    origin: "*",
  });

  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  const pages = data.query?.pages ?? {};
  const results = [];

  for (const page of Object.values(pages)) {
    const info = page.imageinfo?.[0];
    if (!info?.url) continue;
    const meta = info.extmetadata ?? {};
    const licenseName =
      meta.LicenseShortName?.value ?? meta.UsageTerms?.value ?? "";
    const license = normalizeLicense(licenseName);
    if (!license) continue;

    const artist = meta.Artist?.value?.replace(/<[^>]+>/g, "").trim();
    results.push({
      url: info.url,
      alt: page.title?.replace(/^File:/, "").replace(/\.[^.]+$/, "").replace(/_/g, " ") ?? query,
      license,
      attribution: artist || "Wikimedia contributor",
      source: "Wikimedia Commons",
      width: info.width,
      height: info.height,
      provider: "wikimedia",
    });
  }
  return results;
}

async function searchUnsplash(query) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];

  const params = new URLSearchParams({ query, per_page: "15", orientation: "landscape" });
  const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${key}` },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.results ?? []).map((photo) => ({
    url: photo.urls?.regular,
    alt: photo.alt_description ?? photo.description ?? query,
    license: "unsplash",
    attribution: photo.user?.name ?? "Unsplash contributor",
    source: "Unsplash",
    width: photo.width,
    height: photo.height,
    provider: "unsplash",
  }));
}

async function searchPexels(query) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const params = new URLSearchParams({ query, per_page: "15", orientation: "landscape" });
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: key },
  });
  if (!res.ok) return [];
  const data = await res.json();

  return (data.photos ?? []).map((photo) => ({
    url: photo.src?.large,
    alt: photo.alt ?? query,
    license: "pexels",
    attribution: photo.photographer ?? "Pexels contributor",
    source: "Pexels",
    width: photo.width,
    height: photo.height,
    provider: "pexels",
  }));
}

async function searchOpenverse(query) {
  const params = new URLSearchParams({
    q: query,
    license: "cc0,by,by-sa",
    page_size: "20",
    mature: "false",
  });
  const res = await fetch(`https://api.openverse.org/v1/images/?${params}`);
  if (!res.ok) return [];
  const data = await res.json();

  return (data.results ?? [])
    .map((item) => {
      const licenseMap = { cc0: "cc0", by: "cc-by", "by-sa": "cc-by-sa" };
      const license = licenseMap[item.license?.toLowerCase()] ?? normalizeLicense(item.license);
      if (!license) return null;
      return {
        url: item.url,
        alt: item.title ?? query,
        license,
        attribution: item.creator ?? "Openverse contributor",
        source: item.source ?? "Openverse",
        width: item.width,
        height: item.height,
        provider: "openverse",
      };
    })
    .filter(Boolean);
}

const SEARCHERS = {
  wikimedia: searchWikimedia,
  unsplash: searchUnsplash,
  pexels: searchPexels,
  openverse: searchOpenverse,
};

async function findImageForArticle(article) {
  const sources = CATEGORY_SOURCES[article.category] ?? ["wikimedia", "openverse", "unsplash"];
  const queries = buildQueries(article);

  for (const query of queries) {
    for (const sourceName of sources) {
      const searcher = SEARCHERS[sourceName];
      if (!searcher) continue;
      try {
        const candidates = await searcher(query);
        const picked = pickUnique(
          candidates.filter((c) => isAllowedLicense(c.license)),
          article
        );
        if (picked) return { ...picked, query, sourceName };
        await sleep(DELAY_MS);
      } catch (err) {
        console.warn(`  [${sourceName}] failed for "${query}": ${err.message}`);
        await sleep(DELAY_MS);
      }
    }
  }
  return null;
}

function updateMdxFrontmatter(filePath, featuredImage, featuredImageAlt) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  parsed.data.featuredImage = featuredImage;
  parsed.data.featuredImageAlt = featuredImageAlt;
  const updated = matter.stringify(parsed.content, parsed.data, {
    lineWidth: 120,
  });
  fs.writeFileSync(filePath, updated, "utf8");
}

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

async function main() {
  loadEnv();
  const rescore = process.argv.includes("--rescore");
  const force = process.argv.includes("--force");
  const onlyId = readArg("--id");

  const categoryDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE_DIRS.has(e.name))
    .map((e) => path.join(CONTENT_ROOT, e.name));

  const files = categoryDirs.flatMap(collectMdxFiles);
  const articles = files.map(parseArticle).filter(Boolean);

  const existingImages = fs.existsSync(ARTICLE_IMAGES_PATH)
    ? JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"))
    : {};

  for (const asset of Object.values(existingImages)) {
    if (asset?.url) USED_URLS.add(asset.url);
  }

  const articleImages = rescore || onlyId ? { ...existingImages } : {};
  const report = { generatedAt: new Date().toISOString(), articles: [], failures: [] };

  if (rescore) {
    for (const [id, asset] of Object.entries(existingImages)) {
      const article = articles.find((a) => a.id === id);
      if (article && asset?.url && isRelevantCandidate(asset, article)) {
        USED_URLS.add(asset.url);
      } else if (asset?.url) {
        USED_URLS.delete(asset.url);
        delete articleImages[id];
        console.log(`Rescoring irrelevant image for ${id}`);
      }
    }
  }

  let targetArticles = rescore
    ? articles.filter((article) => !articleImages[article.id])
    : articles;

  if (onlyId) {
    const article = articles.find((a) => a.id === onlyId);
    if (!article) {
      console.error(`Article not found: ${onlyId}`);
      process.exit(1);
    }
    if (force && articleImages[onlyId]?.url) {
      USED_URLS.delete(articleImages[onlyId].url);
      delete articleImages[onlyId];
    }
    targetArticles = [article];
  }

  console.log(
    rescore
      ? `Rescoring ${targetArticles.length} articles (${USED_URLS.size} kept).`
      : `Found ${articles.length} encyclopedia articles.`
  );

  for (let i = 0; i < targetArticles.length; i++) {
    const article = targetArticles[i];
    if (!force && !onlyId && articleImages[article.id]?.url) {
      console.log(`[skip] ${article.id} — already has image`);
      continue;
    }
    if (!force && onlyId && articleImages[article.id]?.url) {
      console.log(`[skip] ${article.id} — already has image (use --force to replace)`);
      continue;
    }

    console.log(`[${i + 1}/${targetArticles.length}] ${article.id} — ${article.title}`);

    const result = await findImageForArticle(article);
    if (!result) {
      console.warn(`  FAILED: no image found`);
      report.failures.push({ id: article.id, title: article.title, category: article.category });
      continue;
    }

    const asset = {
      url: result.url,
      alt: result.alt,
      license: result.license,
      attribution: result.attribution,
      source: result.source,
      category: article.category,
      width: result.width,
      height: result.height,
    };

    articleImages[article.id] = asset;
    updateMdxFrontmatter(article.filePath, result.url, result.alt);

    report.articles.push({
      id: article.id,
      title: article.title,
      category: article.category,
      query: result.query,
      provider: result.provider,
      license: result.license,
      url: result.url,
    });

    console.log(`  OK: ${result.provider} — ${result.url.slice(0, 80)}...`);
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(ARTICLE_IMAGES_PATH, JSON.stringify(articleImages, null, 2) + "\n");
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");

  console.log(`\nDone. Assigned ${Object.keys(articleImages).length}/${articles.length} images.`);
  if (report.failures.length) {
    console.warn(`Failures: ${report.failures.length} — see ${REPORT_PATH}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
