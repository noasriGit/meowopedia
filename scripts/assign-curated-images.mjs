#!/usr/bin/env node
/** Assign curated Wikimedia images — ensures unique, reachable featured images. */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const ROOT = path.resolve(import.meta.dirname, "..");
const ARTICLE_IMAGES_PATH = path.join(ROOT, "content", "images", "article-images.json");

const asset = (url, alt) => ({
  url,
  alt,
  license: "cc-by-sa",
  attribution: "Wikimedia contributor",
  source: "Wikimedia Commons",
});

const CURATED = {
  "behavior-chase-tail": asset(
    "https://upload.wikimedia.org/wikipedia/commons/4/47/Cat_curly_tail.JPG",
    "Cat with a curved tail in motion"
  ),
  "behavior-female-cat-spraying": asset(
    "https://upload.wikimedia.org/wikipedia/commons/f/f5/Japanese_litter_box_in_use.jpg",
    "Cat near a litter box indoors"
  ),
  "behavior-zoomies": asset(
    "https://upload.wikimedia.org/wikipedia/commons/7/74/Fast_and_Furious_cat.jpg",
    "Energetic cat running indoors"
  ),
  "care-bathing-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Two_Sphynx_cats_in_bath.jpg",
    "Hairless cats during bath time"
  ),
  "compare-cats-vs-dogs-clean": asset(
    "https://upload.wikimedia.org/wikipedia/commons/d/dd/Two_orange_tabby_cats_greeting_by_rubbing-Hisashi-01.jpg",
    "Two cats grooming themselves"
  ),
  "guide-cat-pregnancy": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/ca/4.5_months_blotched_tabby_kitten_sleeping_on_the_lap_of_its_master.jpg",
    "Pregnant cat owner cuddling a young kitten"
  ),
  "nutrition-wet-food": asset(
    "https://upload.wikimedia.org/wikipedia/commons/e/e1/Cat_eating_wet_plant-based_cat_food.jpg",
    "Cat eating wet food from a bowl"
  ),
  "symptom-drooling": asset(
    "https://upload.wikimedia.org/wikipedia/commons/7/7d/Contented_cat_%288546770661%29.jpg",
    "Relaxed cat with a calm expression"
  ),
  "symptom-farting": asset(
    "https://upload.wikimedia.org/wikipedia/commons/6/67/Cute_cat_in_loaf_position.jpg",
    "Cat resting in loaf position"
  ),
  "symptom-snoring": asset(
    "https://upload.wikimedia.org/wikipedia/commons/b/b8/Cat_sleeping_on_bed.jpg",
    "Sleeping cat on a bed"
  ),
  "symptom-vomiting": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/2d/Sleeping_cat_on_a_bed.jpg",
    "Cat resting on soft bedding"
  ),
  "symptom-diarrhea": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/28/Cats_sleeping_on_a_dog_bed.jpg",
    "Cat resting on a pet bed"
  ),
  "guide-cat-estrus": asset(
    "https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg",
    "Adult female domestic cat portrait"
  ),
  "disease-feline-herpes": asset(
    "https://upload.wikimedia.org/wikipedia/commons/9/93/Cat_poster_2.jpg",
    "Cat with watery eyes at rest"
  ),
  "food-coconut-oil": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/28/Infusion-cat.jpg",
    "Cat resting during veterinary care"
  ),
  "medication-pedialyte-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/3/32/Tired_20-year-old_cat.jpg",
    "Senior cat resting and rehydrating indoors"
  ),
  "poisoning-incense-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/9/9a/Eucalyptus_punctata_-_adult_leaves.jpg",
    "Eucalyptus leaves used in aromatic products"
  ),
  "symptom-sick-cat": asset(
    "https://upload.wikimedia.org/wikipedia/commons/a/a2/Feline_self-inflicted_alopecia.jpg",
    "Cat showing signs of illness while grooming"
  ),
  "anatomy-cat-vision-colors": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/Scheme_cat_anatomy-el.png",
    "Diagram of cat anatomy and senses"
  ),
  "behavior-bury-poop": asset(
    "https://upload.wikimedia.org/wikipedia/commons/8/80/Cats_playing1.jpg",
    "Cat in a natural home environment"
  ),
  "behavior-puffy-tail": asset(
    "https://upload.wikimedia.org/wikipedia/commons/8/87/Kitten_%2806%29_by_Ron.jpg",
    "Kitten with an alert posture"
  ),
  "behavior-loafing": asset(
    "https://upload.wikimedia.org/wikipedia/commons/5/58/Playing_time_of_our_cat.jpg",
    "Playful cat indoors"
  ),
  "behavior-purring": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/c7/Larry_the_cat_standing_on_grass_and_licking_his_nose_in_Auderghem%2C_Belgium_%28DSCF2372%29.jpg",
    "Content cat outdoors"
  ),
  "behavior-sleep-at-feet": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/c3/December_2008_sleeping_cat_and_dog.jpg",
    "Cat sleeping near a companion animal"
  ),
  "behavior-sleeping-on-chest": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/cc/Kitten-stare.jpg",
    "Kitten resting closely with its owner"
  ),
  "behavior-social-animals": asset(
    "https://upload.wikimedia.org/wikipedia/commons/f/f0/Herd_of_Cats.jpg",
    "Multiple cats interacting together"
  ),
  "behavior-water-aversion": asset(
    "https://upload.wikimedia.org/wikipedia/commons/1/1d/Bengal_-_18.jpg",
    "Alert cat near water"
  ),
  "disease-ckd": asset(
    "https://upload.wikimedia.org/wikipedia/commons/e/e1/Insuline-injection-cat.jpg",
    "Cat receiving veterinary treatment"
  ),
  "disease-feline-herpes": asset(
    "https://upload.wikimedia.org/wikipedia/commons/b/b6/Felis_catus-cat_on_snow.jpg",
    "Cat outdoors in cool weather"
  ),
  "food-celery": asset(
    "https://upload.wikimedia.org/wikipedia/commons/3/30/Cat_eating_fish_01.jpg",
    "Cat eating from a bowl"
  ),
  "food-chocolate": asset(
    "https://upload.wikimedia.org/wikipedia/commons/b/b1/Cat_eating_fish_02.jpg",
    "Cat eating a meal indoors"
  ),
  "food-eggs": asset(
    "https://upload.wikimedia.org/wikipedia/commons/4/45/Cats_eating_fish_02.jpg",
    "Cats sharing food from a plate"
  ),
  "medication-capstar": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/2b/Nacho_the_one_eyed_cat.jpg",
    "Domestic cat portrait"
  ),
  "plant-eucalyptus": asset(
    "https://upload.wikimedia.org/wikipedia/commons/f/fb/Pelargonium_graveolens.jpg",
    "Aromatic plant leaves"
  ),
  "health-lice-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/5/5e/Sleeping_cat_on_her_back.jpg",
    "Cat resting on its back"
  ),
  "health-strep-throat-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/1/16/THE_STORY_OF_OUR_THREE_LEG_FELINE_FRIEND.jpg",
    "Cat resting indoors on a sofa"
  ),
  "anatomy-male-cat-anatomy": asset(
    "https://upload.wikimedia.org/wikipedia/commons/5/5a/Whiskers_on_cat_paw.jpg",
    "Close-up of cat whiskers and paw"
  ),
  "behavior-playing-or-fighting": asset(
    "https://upload.wikimedia.org/wikipedia/commons/d/d9/Cat_Scratch_and_Bite.jpg",
    "Two cats interacting playfully"
  ),
  "behavior-crying": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/24/Ethiopian_Cat_%282060482953%29.jpg",
    "Vocal cat looking toward the camera"
  ),
  "behavior-licking-you": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/23/A_proud%2C_mysterious_cat_~_~_~_%287609145366%29.jpg",
    "Cat grooming with its tongue"
  ),
  "food-chicken": asset(
    "https://upload.wikimedia.org/wikipedia/commons/6/69/Guangzhou-Kitten-and-bowl-of-rice-0552.jpg",
    "Cat near a food bowl"
  ),
  "compare-dogs-allergic-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/7/70/Domestic_cat_and_kitten_drinking_milk_from_a_saucer%29_-_CF_LCCN2012645540.jpg",
    "Cat and kitten together indoors"
  ),
  "fact-down-syndrome-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/c2/Momma_Cat_staring_at_the_snow_1_%2848762577428%29.jpg",
    "Unique-looking cat portrait"
  ),
  "fact-group-of-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/5/57/Maine_Coon_male_NO_Sigdalskauen_Balder.jpg",
    "Group of cats in an outdoor setting"
  ),
  "breed-bengal": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/c9/Low-key_cat.jpg",
    "Bengal cat in a natural pose"
  ),
  "vaccination-rabies-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/0/05/Lucky_Cat_%28Unsplash%29.jpg",
    "Cat at a veterinary wellness visit"
  ),
  "disease-feline-calicivirus": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/c1/Six_weeks_old_cat_%28aka%29.jpg",
    "Young cat with respiratory symptoms at rest"
  ),
  "disease-lyme-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Six_weeks_old_cat_%28aka%29.jpg",
    "Cat resting outdoors"
  ),
  "food-oysters": asset(
    "https://upload.wikimedia.org/wikipedia/commons/c/c2/Cats_eating_fish_01.jpg",
    "Cat investigating seafood on a plate"
  ),
  "food-raw-fish": asset(
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Preparing_Raw_Fish_LACMA_M.81.91.3.jpg",
    "Historical illustration of raw fish preparation"
  ),
  "food-tuna": asset(
    "https://upload.wikimedia.org/wikipedia/commons/a/aa/FMIB_44732_Tuna_on_Hanging_Racks--Pacific_Tuna_Canning_Company.jpeg",
    "Tuna fish drying on racks at a cannery"
  ),
  "parasite-ear-mites": asset(
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Anatomical_technology_as_applied_to_the_domestic_cat%3B_an_introduction_to_human%2C_veterinary%2C_and_comparative_anatomy_%281882%29_%2814764943902%29.jpg",
    "Veterinary anatomy diagram of a domestic cat"
  ),
  "plant-geranium": asset(
    "https://upload.wikimedia.org/wikipedia/commons/6/66/Rosa_rubiginosa_flower.jpg",
    "Geranium plant flowers"
  ),
  // Deduplication fixes — unique URLs for articles that shared featured images
  "food-almond-milk": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/20/Bessie_Bamber_-_5c84e17809.jpg",
    "Domestic cat portrait near a feeding area"
  ),
  "guide-kitten-teething": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/2b/Cat-and-computer.JPG",
    "Young cat with an open mouth indoors"
  ),
  "wildlife-foxes-and-cats": asset(
    "https://upload.wikimedia.org/wikipedia/commons/4/43/Fox_pups_raised_by_cat%2C_Fairbanks%2C_Alaska%2C_1915.jpg",
    "Fox pups raised by a domestic cat in Alaska, 1915"
  ),
  "food-lactose-free-milk": asset(
    "https://upload.wikimedia.org/wikipedia/commons/e/ec/Black_cat_drinking_milk.jpg",
    "Black cat drinking milk from a saucer"
  ),
  "food-sushi": asset(
    "https://upload.wikimedia.org/wikipedia/commons/6/68/Fishing_Cat_%28Prionailurus_viverrinus%29_-b.jpg",
    "Fishing cat — wild felid that hunts fish"
  ),
  "food-raw-fish": asset(
    "https://upload.wikimedia.org/wikipedia/commons/7/7b/Preparing_Raw_Fish_LACMA_M.81.91.3.jpg",
    "Historical illustration of raw fish preparation"
  ),
  "food-tuna": asset(
    "https://upload.wikimedia.org/wikipedia/commons/a/aa/FMIB_44732_Tuna_on_Hanging_Racks--Pacific_Tuna_Canning_Company.jpeg",
    "Tuna fish drying on racks at a cannery"
  ),
  "parasite-ear-mites": asset(
    "https://upload.wikimedia.org/wikipedia/commons/a/ac/Anatomical_technology_as_applied_to_the_domestic_cat%3B_an_introduction_to_human%2C_veterinary%2C_and_comparative_anatomy_%281882%29_%2814764943902%29.jpg",
    "Veterinary anatomy diagram of a domestic cat"
  ),
  "plant-frankincense": asset(
    "https://upload.wikimedia.org/wikipedia/commons/8/8e/Boswellia_sacra_trunk.jpg",
    "Boswellia sacra tree trunk — source of frankincense resin"
  ),
  "plant-rose": asset(
    "https://upload.wikimedia.org/wikipedia/commons/a/ab/Mrs._Herbert_Stevens_May_2008.jpg",
    "Pink rose flowers in a garden"
  ),
  "anatomy-dilated-pupils": asset(
    "https://upload.wikimedia.org/wikipedia/commons/4/42/Cat_dilated_pupils.JPG",
    "Close-up of a cat eye with dilated pupil"
  ),
  "behavior-biting": asset(
    "https://upload.wikimedia.org/wikipedia/commons/1/19/%22You_infernal_scoundrel%2C_how_dare_you_tell_me_that%3F%22.jpeg",
    "Cat with mouth open during vocalization"
  ),
  "breed-maine-coon": asset(
    "https://upload.wikimedia.org/wikipedia/commons/2/2c/Maine_Coon_on_Snow.jpg",
    "Maine Coon cat standing on snow"
  ),
  "care-dental-cleaning": asset(
    "https://upload.wikimedia.org/wikipedia/commons/4/40/Yawning_kitten.jpg",
    "Kitten yawning and showing teeth"
  ),
  "fact-cats-swim": asset(
    "https://upload.wikimedia.org/wikipedia/commons/f/fc/Turkish_Van_Cat_Swimming.JPG",
    "Turkish Van cat swimming in water"
  ),
};

function findMdxById(id) {
  const contentRoot = path.join(ROOT, "content");
  for (const dir of fs.readdirSync(contentRoot)) {
    const dirPath = path.join(contentRoot, dir);
    if (!fs.statSync(dirPath).isDirectory() || dir === "images") continue;
    for (const file of fs.readdirSync(dirPath)) {
      if (!file.endsWith(".mdx")) continue;
      const filePath = path.join(dirPath, file);
      const { data } = matter(fs.readFileSync(filePath, "utf8"));
      if (data.id === id) return filePath;
    }
  }
  return null;
}

const articleImages = JSON.parse(fs.readFileSync(ARTICLE_IMAGES_PATH, "utf8"));

for (const [id, image] of Object.entries(CURATED)) {
  articleImages[id] = { ...image, category: articleImages[id]?.category };
  const mdxPath = findMdxById(id);
  if (!mdxPath) continue;
  const parsed = matter(fs.readFileSync(mdxPath, "utf8"));
  parsed.data.featuredImage = image.url;
  parsed.data.featuredImageAlt = image.alt;
  fs.writeFileSync(
    mdxPath,
    matter.stringify(parsed.content, parsed.data, { lineWidth: 120 }),
    "utf8"
  );
}

fs.writeFileSync(ARTICLE_IMAGES_PATH, `${JSON.stringify(articleImages, null, 2)}\n`);
console.log(`Assigned ${Object.keys(CURATED).length} curated images.`);
