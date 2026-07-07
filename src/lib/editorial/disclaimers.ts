import {
  CATEGORY_DISCLAIMER_TIER,
  type DisclaimerTier,
} from "@/config/disclaimers";
import { ENTITY_ROUTES } from "@/config/taxonomy";
import type { CategorySlug, EntityType } from "@/config/taxonomy";
import type { Article, ArticleFrontmatter } from "@/types/content";

const MEDICAL_CATEGORIES = new Set<CategorySlug>([
  "health",
  "diseases",
  "symptoms",
  "care",
]);

const HEALTH_GUIDE_ENTITY_TYPES = new Set<EntityType>([
  "pregnancy",
  "kitten",
  "life-stage",
]);

const MEDICAL_ENTITY_TYPES = new Set<EntityType>(
  ENTITY_ROUTES.filter((route) =>
    route.schemaTypes.includes("MedicalWebPage")
  ).map((route) => route.entityType)
);

export function getCategoryDisclaimerTier(
  category: CategorySlug
): DisclaimerTier {
  return CATEGORY_DISCLAIMER_TIER[category];
}

export function getDisclaimerTier(
  article: Pick<ArticleFrontmatter, "category" | "entityType" | "disclaimerTier">
): DisclaimerTier | null {
  if (article.disclaimerTier === "none") {
    return null;
  }

  if (article.disclaimerTier) {
    return article.disclaimerTier;
  }

  if (MEDICAL_ENTITY_TYPES.has(article.entityType)) {
    return "medical";
  }

  if (MEDICAL_CATEGORIES.has(article.category)) {
    return "medical";
  }

  if (
    article.category === "guides" &&
    HEALTH_GUIDE_ENTITY_TYPES.has(article.entityType)
  ) {
    return "medical";
  }

  if (article.category === "foods" || article.category === "plants") {
    return "safety";
  }

  return "general";
}

export function shouldShowDisclaimer(
  article: Pick<ArticleFrontmatter, "category" | "entityType" | "disclaimerTier">
): boolean {
  return getDisclaimerTier(article) !== null;
}

export function getArticleDisclaimerProps(
  article: Pick<
    Article,
    "category" | "entityType" | "disclaimerTier" | "medicalReviewer" | "lastReviewed"
  >
) {
  return {
    tier: getDisclaimerTier(article),
    medicalReviewer: article.medicalReviewer,
    lastReviewed: article.lastReviewed,
  };
}
