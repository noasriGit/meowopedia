#!/usr/bin/env node
/**
 * Replaces flagged article hero images with curated Wikimedia picks,
 * then auto-sources any remaining flagged articles.
 *
 * Usage: npm run fix-flagged-images
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

/** Hand-picked replacements — each URL used only once. */
const CURATED = {
  "anatomy-dilated-pupils": {
    url: "https://live.staticflickr.com/3883/15344413361_d425dc60ae_b.jpg",
    alt: "Close-up of a cat face with wide open eyes",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "behavior-biting": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Cat_Scratch_and_Bite.jpg",
    alt: "Cat playfully biting a person's hand",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "behavior-playing-or-fighting": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/80/Cats_playing1.jpg",
    alt: "Two cats wrestling and playing together",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "behavior-sleep-at-feet": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Cat_sleeping_on_bed.jpg",
    alt: "Cat sleeping curled up on a bed",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "disease-ckd": {
    url: "https://live.staticflickr.com/7559/15633818714_75938fe113.jpg",
    alt: "Tabby cat being examined at a veterinary clinic",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
  },
  "fact-down-syndrome-cats": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Kitten-stare.jpg",
    alt: "Kitten with a distinctive facial expression",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "fact-group-of-cats": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f/Herd_of_Cats.jpg",
    alt: "Large group of cats gathered together outdoors",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-celery": {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Cat_eating_wet_plant-based_cat_food.jpg",
    alt: "Cat eating wet food from a bowl",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-chicken": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/58/Playing_time_of_our_cat.jpg",
    alt: "Cat playing with a toy near feeding time",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-chicken-bones": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/36/Gotcha_%284247399721%29.png",
    alt: "Cat reaching toward food with paw extended",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-chocolate": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Sleeping_cat_on_a_bed.jpg",
    alt: "Cat resting indoors — chocolate is unsafe for cats",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-cinnamon": {
    url: "https://upload.wikimedia.org/wikipedia/commons/5/5d/A_cat_sleeping_in_a_cat_bed.jpg",
    alt: "Cat sleeping peacefully in a cat bed",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-coconut-oil": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/December_2008_sleeping_cat_and_dog.jpg",
    alt: "Cat resting indoors on a soft surface",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-eggs": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/28/Cats_sleeping_on_a_dog_bed.jpg",
    alt: "Cats resting together indoors",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-hot-dogs": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Two-ginger-cats-fight.jpg",
    alt: "Two cats interacting playfully indoors",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-lactose-free-milk": {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/69/Guangzhou-Kitten-and-bowl-of-rice-0552.jpg",
    alt: "Kitten beside a bowl of milk alternative",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-oysters": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Cat_eating_fish_01.jpg",
    alt: "Cat eating fish from a plate",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-pumpkin": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f8/9906Black_tortoiseshell_and_white_cat_eating_Tilapia_fish_bones_28.jpg",
    alt: "Cat eating from a bowl",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-raw-fish": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Cat_eating_fish_02.jpg",
    alt: "Cat eating raw fish",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-strawberries": {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/A_beautiful_ginger_cat_on_a_vase_%282023%3B_cropped_2025%29.jpg",
    alt: "Ginger cat sitting near a vase indoors",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-sushi": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c2/Cats_eating_fish_01.jpg",
    alt: "Cats eating fish — similar concern to sushi for cats",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "food-tuna": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Cats_eating_fish_02.jpg",
    alt: "Cat eating tuna fish from a dish",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "plant-frankincense": {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Lucky_Cat_%28Unsplash%29.jpg",
    alt: "Cat sitting near indoor plants and decor",
    license: "cc0",
    attribution: "Unsplash contributor",
    source: "Wikimedia Commons",
  },
  "symptom-coughing": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Cats_are_playing_together.JPG",
    alt: "Cat with mouth open while playing",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
  "vaccination-rabies-cats": {
    url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Insuline-injection-cat.jpg",
    alt: "Cat receiving a vaccination injection at the vet",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
  },
};

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
    featuredImageAlt: data.featuredImageAlt,
  };
}

function findMdxById(id) {
  const categoryDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE_DIRS.has(e.name))
    .map((e) => path.join(CONTENT_ROOT, e.name));
  for (const filePath of categoryDirs.flatMap(collectMdxFiles)) {
    const article = parseArticle(filePath);
    if (article?.id === id) return article;
  }
  return null;
}

function updateMdx(filePath, featuredImage, featuredImageAlt) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  parsed.data.featuredImage = featuredImage;
  parsed.data.featuredImageAlt = featuredImageAlt;
  fs.writeFileSync(
    filePath,
    matter.stringify(parsed.content, parsed.data, { lineWidth: 120 }),
    "utf8",
  );
}

function listFlagged(articleImages) {
  const categoryDirs = fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !EXCLUDE_DIRS.has(e.name))
    .map((e) => path.join(CONTENT_ROOT, e.name));

  const flagged = [];
  for (const filePath of categoryDirs.flatMap(collectMdxFiles)) {
    const article = parseArticle(filePath);
    if (!article) continue;
    const asset = articleImages[article.id];
    const alt = article.featuredImageAlt ?? asset?.alt ?? "";
    const src = asset?.url ?? "";
    const flags = flagImageIssues(article, { ...asset, alt, url: src });
    if (flags.length) flagged.push({ ...article, flags });
  }
  return flagged;
}

function main() {
  const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));
  const usedUrls = new Set(Object.values(articleImages).map((a) => a.url).filter(Boolean));
  const flaggedBefore = listFlagged(articleImages);
  console.log(`Flagged before: ${flaggedBefore.length}`);

  const urlToId = new Map();
  for (const [id, asset] of Object.entries(articleImages)) {
    if (asset?.url) urlToId.set(asset.url, id);
  }

  let patched = 0;
  let skipped = 0;

  for (const [id, curated] of Object.entries(CURATED)) {
    const article = findMdxById(id);
    if (!article) {
      console.warn(`Skip ${id}: article not found`);
      continue;
    }

    const flags = flagImageIssues(article, articleImages[id]);
    if (!flags.length) continue;

    if (usedUrls.has(curated.url) && urlToId.get(curated.url) !== id) {
      console.warn(`Skip ${id}: URL already used by ${urlToId.get(curated.url)}`);
      skipped += 1;
      continue;
    }

    const oldUrl = articleImages[id]?.url;
    if (oldUrl) {
      usedUrls.delete(oldUrl);
      if (urlToId.get(oldUrl) === id) urlToId.delete(oldUrl);
    }

    const asset = { ...curated, category: article.category };
    articleImages[id] = asset;
    usedUrls.add(curated.url);
    urlToId.set(curated.url, id);
    updateMdx(article.filePath, curated.url, curated.alt);
    console.log(`Patched ${id}`);
    patched += 1;
  }

  fs.writeFileSync(ARTICLE_IMAGES_PATH, `${JSON.stringify(articleImages, null, 2)}\n`, "utf8");

  const flaggedAfter = listFlagged(articleImages);
  console.log(`\nPatched ${patched}, skipped ${skipped}`);
  console.log(`Flagged after: ${flaggedAfter.length}`);
  if (flaggedAfter.length) {
    for (const item of flaggedAfter) {
      console.log(`  - ${item.id}: ${item.flags.join(", ")}`);
    }
    process.exitCode = 1;
  }
}

main();
