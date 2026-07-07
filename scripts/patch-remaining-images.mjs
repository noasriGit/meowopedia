#!/usr/bin/env node
/**
 * Patches the final batch of articles missing images after rescore.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const ARTICLE_IMAGES_PATH = path.join(ROOT, "content", "images", "article-images.json");

const PATCHES = {
  "behavior-stretch-greeting": {
    url: "https://live.staticflickr.com/4050/4524232608_8c5f36ed46.jpg",
    alt: "Cat stretching with front paws extended forward",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "compare-dogs-allergic-cats": {
    url: "https://live.staticflickr.com/148/417852540_716fdb9416_m.jpg",
    alt: "Senior cat and dog resting together with paws touching",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "compare",
  },
  "disease-feline-calicivirus": {
    url: "https://live.staticflickr.com/3911/15082262507_e80329e533_b.jpg",
    alt: "Cat being examined at a veterinary clinic",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "diseases",
  },
  "disease-lyme-cats": {
    url: "https://live.staticflickr.com/6209/6098494886_55d147b943_b.jpg",
    alt: "Cat outdoors in tall grass",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "diseases",
  },
  "fact-down-syndrome-cats": {
    url: "https://live.staticflickr.com/2060/2304237340_a79343e2e4_b.jpg",
    alt: "Person holding a small kitten with unique facial features",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "facts",
  },
  "guide-cat-estrus": {
    url: "https://live.staticflickr.com/1047/1439305246_539c02320f_b.jpg",
    alt: "Pregnant female cat resting on a blanket",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "guides",
  },
  "medication-capstar": {
    url: "https://live.staticflickr.com/7826/46508164475_5a55d6ac89_b.jpg",
    alt: "Cat reacting during flea treatment application",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "health",
  },
  "plant-frankincense": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/80/Boswellia_serrata_%284399783209%29.jpg",
    alt: "Boswellia serrata frankincense tree resin source",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "plants",
  },
  "medication-ibuprofen-cats": {
    url: "https://live.staticflickr.com/65535/48914080376_366a345623_b.jpg",
    alt: "Cat resting peacefully on a soft blanket",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "health",
  },
  "poisoning-incense-cats": {
    url: "https://live.staticflickr.com/8261/8630065306_478185d1c3_b.jpg",
    alt: "Cat grooming itself indoors on a couch",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "health",
  },
  "health-lice-cats": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Munchkin_cat_grooming.jpg",
    alt: "Munchkin cat grooming its fur with tongue",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "health",
  },
  "medication-pedialyte-cats": {
    url: "https://live.staticflickr.com/3882/15268409872_02b9edb15b_b.jpg",
    alt: "Cat receiving care at a veterinary clinic",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "health",
  },
  "health-strep-throat-cats": {
    url: "https://live.staticflickr.com/5565/15245751546_5c940573d4_b.jpg",
    alt: "Cat being examined by a veterinarian",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "health",
  },
};

const ID_TO_FILE = {
  "behavior-stretch-greeting": "content/behavior/behavior-stretch-greeting.mdx",
  "compare-dogs-allergic-cats": "content/compare/compare-dogs-allergic-cats.mdx",
  "disease-feline-calicivirus": "content/diseases/feline-calicivirus.mdx",
  "disease-lyme-cats": "content/diseases/lyme-disease-in-cats.mdx",
  "fact-down-syndrome-cats": "content/facts/fact-down-syndrome-cats.mdx",
  "guide-cat-estrus": "content/guides/guide-cat-estrus.mdx",
  "medication-capstar": "content/health/capstar-for-cats.mdx",
  "plant-frankincense": "content/health/frankincense-and-cats.mdx",
  "medication-ibuprofen-cats": "content/health/ibuprofen-toxicity-in-cats.mdx",
  "poisoning-incense-cats": "content/health/incense-and-cats.mdx",
  "health-lice-cats": "content/health/lice-in-cats.mdx",
  "medication-pedialyte-cats": "content/health/pedialyte-for-cats.mdx",
  "health-strep-throat-cats": "content/health/strep-in-cats.mdx",
};

function updateMdx(filePath, featuredImage, featuredImageAlt) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  parsed.data.featuredImage = featuredImage;
  parsed.data.featuredImageAlt = featuredImageAlt;
  fs.writeFileSync(
    filePath,
    matter.stringify(parsed.content, parsed.data, { lineWidth: 120 }),
    "utf8"
  );
}

const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));
const used = new Set(Object.values(articleImages).map((a) => a.url));

for (const [id, asset] of Object.entries(PATCHES)) {
  if (used.has(asset.url)) {
    console.error(`Duplicate URL for ${id}: ${asset.url}`);
    process.exitCode = 1;
    continue;
  }
  const relPath = ID_TO_FILE[id];
  articleImages[id] = asset;
  used.add(asset.url);
  updateMdx(path.join(ROOT, relPath), asset.url, asset.alt);
  console.log(`Patched ${id}`);
}

fs.writeFileSync(ARTICLE_IMAGES_PATH, JSON.stringify(articleImages, null, 2) + "\n");
console.log(`Total images: ${Object.keys(articleImages).length}`);
