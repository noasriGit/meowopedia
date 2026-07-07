#!/usr/bin/env node
/** Final Wikimedia → Flickr replacements for remaining 12 articles. */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const ARTICLE_IMAGES_PATH = path.join(ROOT, "content", "images", "article-images.json");

const PATCHES = {
  "behavior-sleeping-on-chest": {
    url: "https://live.staticflickr.com/5130/5316846505_7e8fa04f2c_b.jpg",
    alt: "Cat resting on a person's chest",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "disease-feline-herpes": {
    url: "https://live.staticflickr.com/3924/15082272697_2bbc919f30_b.jpg",
    alt: "Tabby cat being examined at a veterinary clinic",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "diseases",
  },
  "food-almond-milk": {
    url: "https://live.staticflickr.com/5603/30881614190_bb01a1055b_b.jpg",
    alt: "Carton of almond milk on a table",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "foods",
  },
  "food-lactose-free-milk": {
    url: "https://live.staticflickr.com/2795/4144825453_5378c2781f_b.jpg",
    alt: "Carton of lactose-free milk",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "foods",
  },
  "plant-chrysanthemum": {
    url: "https://live.staticflickr.com/3259/2705558736_3b822ae0d5_b.jpg",
    alt: "Chrysanthemum flowers in bloom",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "plants",
  },
  "behavior-licking-you": {
    url: "https://live.staticflickr.com/3699/10008347535_3f84521638_b.jpg",
    alt: "Cat licking its paw while grooming",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "behavior-bury-poop": {
    url: "https://live.staticflickr.com/7790/17368162732_20da72de0c.jpg",
    alt: "Cat in a litter box",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "behavior-water-aversion": {
    url: "https://live.staticflickr.com/99/304968069_b4430e155e_b.jpg",
    alt: "Wet cat looking unhappy after a bath",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "symptom-hot-ears": {
    url: "https://live.staticflickr.com/2277/2765005747_eee0fab7ca_b.jpg",
    alt: "Close-up of a cat with prominent ears",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "symptoms",
  },
  "symptom-diarrhea": {
    url: "https://live.staticflickr.com/3260/2880036438_1fbbdea125_b.jpg",
    alt: "Young kitten resting on a blanket",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "symptoms",
  },
  "plant-frankincense": {
    url: "https://live.staticflickr.com/2826/10408841746_e4cc3d98d5_b.jpg",
    alt: "Frankincense resin chunks",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "plants",
  },
  "health-lice-cats": {
    url: "https://live.staticflickr.com/2837/33441705594_9005ebc0ba_b.jpg",
    alt: "Cat grooming its fur with its tongue",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "health",
  },
};

const ID_TO_FILE = {
  "behavior-sleeping-on-chest": "content/behavior/behavior-sleeping-on-chest.mdx",
  "disease-feline-herpes": "content/diseases/feline-herpesvirus.mdx",
  "food-almond-milk": "content/foods/almond-milk.mdx",
  "food-lactose-free-milk": "content/foods/lactose-free-milk.mdx",
  "plant-chrysanthemum": "content/plants/chrysanthemum.mdx",
  "behavior-licking-you": "content/behavior/behavior-licking-you.mdx",
  "behavior-bury-poop": "content/behavior/behavior-bury-poop.mdx",
  "behavior-water-aversion": "content/behavior/behavior-water-aversion.mdx",
  "symptom-hot-ears": "content/symptoms/cat-ear-temperature.mdx",
  "symptom-diarrhea": "content/symptoms/diarrhea-in-cats.mdx",
  "plant-frankincense": "content/health/frankincense-and-cats.mdx",
  "health-lice-cats": "content/health/lice-in-cats.mdx",
};

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

const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));
const used = new Set(Object.values(articleImages).map((a) => a.url));

for (const [id, asset] of Object.entries(PATCHES)) {
  if (used.has(asset.url)) {
    console.error(`Duplicate: ${id}`);
    process.exitCode = 1;
    continue;
  }
  articleImages[id] = asset;
  used.add(asset.url);
  updateMdx(path.join(ROOT, ID_TO_FILE[id]), asset.url, asset.alt);
  console.log(`Patched ${id}`);
}

fs.writeFileSync(ARTICLE_IMAGES_PATH, JSON.stringify(articleImages, null, 2) + "\n");
const wiki = Object.values(articleImages).filter((a) => a.url.includes("wikimedia")).length;
console.log(`Wikimedia URLs remaining: ${wiki}`);
