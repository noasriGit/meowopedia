import type { CategorySlug } from "@/config/taxonomy";

/** Primary navigation categories surfaced in the Featured section. */
export const FEATURED_CATEGORY_SLUGS: CategorySlug[] = [
  "breeds",
  "health",
  "behavior",
  "nutrition",
  "foods",
  "plants",
  "guides",
];

/** Tool and utility pages included in the HTML sitemap Tools section. */
export const SITEMAP_TOOL_PATHS = [
  { path: "/search", title: "Search", description: "Search the full cat encyclopedia." },
  { path: "/compare", title: "Compare", description: "Side-by-side cat breed and topic comparisons." },
  {
    path: "/calculators",
    title: "Calculators",
    description: "Cat care calculators and estimators.",
  },
  {
    path: "/checklists",
    title: "Checklists",
    description: "Practical cat care checklists.",
  },
] as const;

/** Redirect source paths that must never appear in sitemaps. */
export const SITEMAP_REDIRECT_SOURCES = [
  "/behavior/kneading",
  "/facts/are-cats-social",
  "/diseases/cat-allergies",
  "/diseases/strep-in-cats",
] as const;

/** Maximum recently published entries on the main HTML sitemap. */
export const SITEMAP_RECENT_LIMIT = 15;
