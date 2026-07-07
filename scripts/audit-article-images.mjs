#!/usr/bin/env node
/**
 * Build a browsable HTML gallery of every article hero image for human review.
 *
 * Usage:
 *   npm run audit-images
 *   npm run audit-images -- --open
 *
 * Output: public/image-audit.html (open via dev server or file://)
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
const OUTPUT_PATH = path.join(ROOT, "public", "image-audit.html");

const EXCLUDE_DIRS = new Set(["pages", "images"]);

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
    id: data.id,
    title: data.title ?? data.id,
    category: data.category,
    slug: data.slug ?? "",
    featuredImage: data.featuredImage,
    featuredImageAlt: data.featuredImageAlt,
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function main() {
  const categoryDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE_DIRS.has(e.name))
    .map((e) => path.join(CONTENT_ROOT, e.name));

  const articles = categoryDirs.flatMap(collectMdxFiles).map(parseArticle).filter(Boolean);
  const articleImages = fs.existsSync(ARTICLE_IMAGES_PATH)
    ? JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"))
    : {};

  const rows = articles.map((article) => {
    const asset = articleImages[article.id];
    const src = article.featuredImage ?? asset?.url ?? "";
    const alt = article.featuredImageAlt ?? asset?.alt ?? "";
    const flags = flagImageIssues(article, { ...asset, alt, url: src });
    return { ...article, src, alt, asset, flags };
  });

  rows.sort((a, b) => {
    if (a.flags.length !== b.flags.length) return b.flags.length - a.flags.length;
    return a.title.localeCompare(b.title);
  });

  const flaggedCount = rows.filter((row) => row.flags.length).length;
  const generatedAt = new Date().toISOString();

  const cards = rows
    .map((row) => {
      const flagHtml = row.flags.length
        ? `<ul class="flags">${row.flags.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>`
        : `<p class="ok">No heuristic flags</p>`;

      const img = row.src
        ? `<img src="${escapeHtml(row.src)}" alt="${escapeHtml(row.alt || row.title)}" loading="lazy" />`
        : `<div class="missing">No image URL</div>`;

      return `<article class="card${row.flags.length ? " flagged" : ""}">
  <a class="img-wrap" href="${escapeHtml(row.src)}" target="_blank" rel="noopener">${img}</a>
  <div class="meta">
    <h2>${escapeHtml(row.title)}</h2>
    <p class="id">${escapeHtml(row.id)} · ${escapeHtml(row.category)}</p>
    <p class="alt"><strong>Alt:</strong> ${escapeHtml(row.alt || "(none)")}</p>
    <p class="url"><a href="${escapeHtml(row.src)}" target="_blank" rel="noopener">Open full image</a></p>
    ${flagHtml}
  </div>
</article>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Meowopedia image audit</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { margin: 0; padding: 1.5rem; background: #111; color: #eee; }
    header { margin-bottom: 1.5rem; }
    .stats { opacity: 0.85; }
    .toolbar { display: flex; gap: 0.75rem; flex-wrap: wrap; margin: 1rem 0; }
    button, select { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #444; background: #222; color: inherit; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .card { border: 1px solid #333; border-radius: 12px; overflow: hidden; background: #1a1a1a; }
    .card.flagged { border-color: #c55; box-shadow: 0 0 0 1px #c55 inset; }
    .img-wrap { display: block; aspect-ratio: 16 / 10; background: #000; }
    .img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .missing { display: grid; place-items: center; height: 100%; color: #aaa; }
    .meta { padding: 0.9rem 1rem 1.1rem; }
    h2 { font-size: 1rem; margin: 0 0 0.35rem; line-height: 1.35; }
    .id, .alt, .url { font-size: 0.85rem; margin: 0.35rem 0; line-height: 1.4; word-break: break-word; }
    .flags { margin: 0.5rem 0 0; padding-left: 1.1rem; color: #f88; font-size: 0.85rem; }
    .ok { margin: 0.5rem 0 0; color: #7d7; font-size: 0.85rem; }
    .hidden { display: none !important; }
  </style>
</head>
<body>
  <header>
    <h1>Meowopedia image audit</h1>
    <p class="stats">Generated ${escapeHtml(generatedAt)} · ${rows.length} articles · ${flaggedCount} flagged by heuristics</p>
    <p>Review every hero image visually. Heuristic flags catch bad alt text (e.g. "mite on catnip") but cannot replace your eyes — a random person can still slip through if the alt text lies.</p>
    <div class="toolbar">
      <button type="button" id="show-all">Show all</button>
      <button type="button" id="show-flagged">Flagged only (${flaggedCount})</button>
      <label>
        Category
        <select id="category-filter">
          <option value="">All</option>
          ${[...new Set(rows.map((r) => r.category))].sort().map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
        </select>
      </label>
    </div>
  </header>
  <div class="grid" id="grid">
    ${cards}
  </div>
  <script>
    const grid = document.getElementById('grid');
    const cards = [...grid.querySelectorAll('.card')];
    const categoryFilter = document.getElementById('category-filter');
    let flaggedOnly = false;

    function applyFilters() {
      const category = categoryFilter.value;
      for (const card of cards) {
        const text = card.textContent;
        const isFlagged = card.classList.contains('flagged');
        const categoryMatch = !category || text.includes('· ' + category);
        const flaggedMatch = !flaggedOnly || isFlagged;
        card.classList.toggle('hidden', !(categoryMatch && flaggedMatch));
      }
    }

    document.getElementById('show-all').addEventListener('click', () => {
      flaggedOnly = false;
      applyFilters();
    });
    document.getElementById('show-flagged').addEventListener('click', () => {
      flaggedOnly = true;
      applyFilters();
    });
    categoryFilter.addEventListener('change', applyFilters);
  </script>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_PATH, html, "utf8");
  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`${rows.length} articles, ${flaggedCount} flagged by heuristics.`);
  console.log("Open http://localhost:3000/image-audit.html while dev server is running, or open the file directly.");

  if (process.argv.includes("--open")) {
    import("node:child_process").then(({ exec }) => {
      const cmd =
        process.platform === "win32" ? `start "" "${OUTPUT_PATH}"` : `open "${OUTPUT_PATH}"`;
      exec(cmd);
    });
  }
}

main();
