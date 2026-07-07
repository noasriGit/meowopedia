#!/usr/bin/env node
/**
 * Patches manually curated images for articles that automated sourcing missed.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const ARTICLE_IMAGES_PATH = path.join(ROOT, "content", "images", "article-images.json");

const PATCHES = {
  "behavior-crying": {
    url: "https://upload.wikimedia.org/wikipedia/commons/8/87/Kitten_%2806%29_by_Ron.jpg",
    alt: "Kitten meowing with mouth open",
    license: "cc0",
    attribution: "Ron",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-eating-grass": {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/08/Cat_Eating_Catgrass.jpg",
    alt: "Cat eating cat grass outdoors",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-female-cat-spraying": {
    url: "https://live.staticflickr.com/8237/8400624711_0219ecaaa7_b.jpg",
    alt: "Cat marking territory against a surface",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "behavior-licking-you": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Larry_the_cat_standing_on_grass_and_licking_his_nose_in_Auderghem%2C_Belgium_%28DSCF2372%29.jpg",
    alt: "Cat standing on grass licking its nose",
    license: "cc-by",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-loafing": {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/67/Cute_cat_in_loaf_position.jpg",
    alt: "Cat sitting in loaf position on a cushion",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-meow-at-night": {
    url: "https://live.staticflickr.com/5242/5354109866_af44f959d4_b.jpg",
    alt: "Cat meowing in dim indoor lighting",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "behavior-zoomies": {
    url: "https://live.staticflickr.com/7336/10285590004_21c300ec2e_b.jpg",
    alt: "Cat running playfully across a room",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "behavior-making-biscuits": {
    url: "https://live.staticflickr.com/4021/4417553669_7436783317_b.jpg",
    alt: "Cat kneading with front paws on a soft blanket",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "behavior",
  },
  "behavior-water-aversion": {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Two_Sphynx_cats_in_bath.jpg",
    alt: "Two Sphynx cats being bathed in a tub",
    license: "cc-by-sa",
    attribution: "Shannon Badiee",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-social-animals": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Two_orange_tabby_cats_greeting_by_rubbing-Hisashi-01.jpg",
    alt: "Two orange tabby cats greeting each other by rubbing heads",
    license: "cc-by-sa",
    attribution: "Hisashi",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-purring": {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Contented_cat_%288546770661%29.jpg",
    alt: "Contented tabby cat resting peacefully with eyes closed",
    license: "cc-by",
    attribution: "psyberartist",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-sleeping-on-chest": {
    url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/4.5_months_blotched_tabby_kitten_sleeping_on_the_lap_of_its_master.jpg",
    alt: "Tabby kitten sleeping curled up on its owner's lap",
    license: "cc-by-sa",
    attribution: "l. Mcdaid",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "behavior-bury-poop": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Japanese_litter_box_in_use.jpg",
    alt: "Norwegian Forest cat using a covered litter box",
    license: "cc-by-sa",
    attribution: "Ocdp",
    source: "Wikimedia Commons",
    category: "behavior",
  },
  "breed-bengal": {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Bengal_-_18.jpg",
    alt: "Bengal cat with spotted rosette coat pattern",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "breeds",
  },
  "breed-maine-coon": {
    url: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Jeunes_main_coons.jpg",
    alt: "Young Maine Coon cats with long tufted ears",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "breeds",
  },
  "breed-persian": {
    url: "https://live.staticflickr.com/5004/5339239070_1b086ceb87.jpg",
    alt: "Grey Persian cat with long fluffy coat",
    license: "cc-by",
    attribution: "Flickr contributor",
    source: "Openverse",
    category: "breeds",
  },
  "breed-sphynx": {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/af/2_Sphynx_cats_sleeping_together.jpg",
    alt: "Two hairless Sphynx cats sleeping together",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    category: "breeds",
  },
  "plant-basil": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/90/Basil-Basilico-Ocimum_basilicum-albahaca.jpg",
    alt: "Ocimum basilicum basil leaves and stems",
    license: "cc-by-sa",
    attribution: "Castielli",
    source: "Wikimedia Commons",
    width: 3488,
    height: 2616,
    category: "plants",
  },
  "plant-bromeliad": {
    url: "https://upload.wikimedia.org/wikipedia/commons/0/09/Guzmania_lingulata.jpg",
    alt: "Guzmania lingulata bromeliad with red inflorescence",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 3077,
    height: 3076,
    category: "plants",
  },
  "plant-calla-lily": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Zantedeschia_aethiopica_%28Witte_aronskelk%29_01.JPG",
    alt: "White Zantedeschia aethiopica calla lily flowers",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 4671,
    height: 3114,
    category: "plants",
  },
  "plant-chrysanthemum": {
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Chrysanthemum_morifolium_08NOV.jpg",
    alt: "Chrysanthemum morifolium flowers in bloom",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 2500,
    height: 2425,
    category: "plants",
  },
  "plant-dahlia": {
    url: "https://upload.wikimedia.org/wikipedia/commons/d/d8/Dahlia_%27Bishop_of_Auckland.JPG",
    alt: "Deep red Dahlia 'Bishop of Auckland' flower",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 2453,
    height: 3271,
    category: "plants",
  },
  "plant-eucalyptus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Eucalyptus_punctata_-_adult_leaves.jpg",
    alt: "Adult eucalyptus tree leaves",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 1920,
    height: 1439,
    category: "plants",
  },
  "plant-geranium": {
    url: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Pelargonium_graveolens.jpg",
    alt: "Pelargonium graveolens geranium leaves and flowers",
    license: "cc-by",
    attribution: "Juni",
    source: "Wikimedia Commons",
    width: 959,
    height: 1280,
    category: "plants",
  },
  "plant-lily": {
    url: "https://upload.wikimedia.org/wikipedia/commons/3/30/Lilium_candidum_1.jpg",
    alt: "White Lilium candidum lily flowers",
    license: "cc-by-sa",
    attribution: "Stan Shebs",
    source: "Wikimedia Commons",
    width: 1800,
    height: 1343,
    category: "plants",
  },
  "plant-monstera": {
    url: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Monstera_deliciosa2.jpg",
    alt: "Monstera deliciosa split-leaf foliage",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 1512,
    height: 1719,
    category: "plants",
  },
  "plant-pothos": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Epipremnum_aureum_31082012.jpg",
    alt: "Epipremnum aureum pothos trailing vines and leaves",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 4288,
    height: 2848,
    category: "plants",
  },
  "plant-rose": {
    url: "https://upload.wikimedia.org/wikipedia/commons/6/66/Rosa_rubiginosa_flower.jpg",
    alt: "Pink Rosa rubiginosa rose flower",
    license: "cc-by-sa",
    attribution: "Carroll D.",
    source: "Wikimedia Commons",
    width: 4461,
    height: 2974,
    category: "plants",
  },
  "plant-thyme": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4c/Thyme_plant.jpg",
    alt: "Thymus vulgaris thyme herb plant",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 2592,
    height: 1944,
    category: "plants",
  },
  "plant-snake-plant": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/46/Sansevieria_trifasciata_%2836268%29.jpg",
    alt: "Sansevieria trifasciata snake plant leaves",
    license: "cc-by-sa",
    attribution: "Wikimedia contributor",
    source: "Wikimedia Commons",
    width: 2296,
    height: 4080,
    category: "plants",
  },
};

const SLUG_TO_FILE = {
  "behavior-crying": "content/behavior/behavior-crying.mdx",
  "behavior-eating-grass": "content/behavior/behavior-eating-grass.mdx",
  "behavior-female-cat-spraying": "content/behavior/behavior-female-cat-spraying.mdx",
  "behavior-licking-you": "content/behavior/behavior-licking-you.mdx",
  "behavior-loafing": "content/behavior/behavior-loafing.mdx",
  "behavior-meow-at-night": "content/behavior/behavior-meow-at-night.mdx",
  "behavior-zoomies": "content/behavior/behavior-zoomies.mdx",
  "behavior-making-biscuits": "content/behavior/making-biscuits.mdx",
  "behavior-water-aversion": "content/behavior/behavior-water-aversion.mdx",
  "behavior-social-animals": "content/behavior/behavior-social-animals.mdx",
  "behavior-purring": "content/behavior/behavior-purring.mdx",
  "behavior-sleeping-on-chest": "content/behavior/behavior-sleeping-on-chest.mdx",
  "behavior-bury-poop": "content/behavior/behavior-bury-poop.mdx",
  "breed-bengal": "content/breeds/bengal-cat.mdx",
  "breed-maine-coon": "content/breeds/maine-coon.mdx",
  "breed-persian": "content/breeds/persian-cat.mdx",
  "breed-sphynx": "content/breeds/sphynx-cat.mdx",
  "plant-basil": "content/plants/basil.mdx",
  "plant-bromeliad": "content/plants/bromeliad.mdx",
  "plant-calla-lily": "content/plants/calla-lily.mdx",
  "plant-chrysanthemum": "content/plants/chrysanthemum.mdx",
  "plant-dahlia": "content/plants/dahlia.mdx",
  "plant-eucalyptus": "content/plants/eucalyptus.mdx",
  "plant-geranium": "content/plants/geranium.mdx",
  "plant-lily": "content/plants/lily.mdx",
  "plant-monstera": "content/plants/monstera.mdx",
  "plant-pothos": "content/plants/pothos.mdx",
  "plant-rose": "content/plants/rose.mdx",
  "plant-thyme": "content/plants/thyme.mdx",
  "plant-snake-plant": "content/plants/snake-plant.mdx",
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

for (const [id, asset] of Object.entries(PATCHES)) {
  const relPath = SLUG_TO_FILE[id];
  const filePath = path.join(ROOT, relPath);
  articleImages[id] = asset;
  updateMdx(filePath, asset.url, asset.alt);
  console.log(`Patched ${id}`);
}

fs.writeFileSync(ARTICLE_IMAGES_PATH, JSON.stringify(articleImages, null, 2) + "\n");
console.log("Done.");
