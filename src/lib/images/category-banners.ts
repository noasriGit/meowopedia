import fs from "node:fs";
import path from "node:path";
import type { CategorySlug } from "@/config/taxonomy";
import type { ImageLicense } from "@/lib/images/registry";

export interface CategoryBanner {
  url: string;
  alt: string;
  license: ImageLicense;
  attribution?: string;
  source?: string;
}

const BANNERS_PATH = path.join(
  process.cwd(),
  "content",
  "images",
  "category-banners.json"
);

let bannersCache: Partial<Record<CategorySlug, CategoryBanner>> | null = null;

function loadBanners(): Partial<Record<CategorySlug, CategoryBanner>> {
  if (bannersCache) return bannersCache;
  if (!fs.existsSync(BANNERS_PATH)) {
    bannersCache = {};
    return bannersCache;
  }
  bannersCache = JSON.parse(
    fs.readFileSync(BANNERS_PATH, "utf8")
  ) as Partial<Record<CategorySlug, CategoryBanner>>;
  return bannersCache;
}

export function getCategoryBanner(
  category: CategorySlug
): CategoryBanner | undefined {
  const banners = loadBanners();
  return banners[category];
}

export function invalidateCategoryBannersCache(): void {
  bannersCache = null;
}
