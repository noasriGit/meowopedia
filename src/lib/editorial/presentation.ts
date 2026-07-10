import type { CategorySlug, EntityType } from "@/config/taxonomy";
import type { Article } from "@/types/content";

export type HeroVariant =
  | "immersive"
  | "split"
  | "editorial"
  | "magazine"
  | "minimal";

export type BodyLayoutVariant =
  | "classic"
  | "magazine"
  | "editorial"
  | "visual";

export interface ArticlePresentation {
  heroVariant: HeroVariant;
  bodyLayout: BodyLayoutVariant;
}

const HERO_VARIANTS: HeroVariant[] = [
  "immersive",
  "split",
  "editorial",
  "magazine",
  "minimal",
];

const BODY_LAYOUTS: BodyLayoutVariant[] = [
  "classic",
  "magazine",
  "editorial",
  "visual",
];

/** Deterministic hash — same article always gets same presentation */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const ENTITY_HERO_BIAS: Partial<Record<EntityType, HeroVariant[]>> = {
  breed: ["immersive", "split", "magazine"],
  disease: ["split", "editorial", "minimal"],
  symptom: ["split", "editorial", "minimal"],
  behavior: ["editorial", "magazine", "minimal"],
  food: ["split", "magazine", "immersive"],
  plant: ["split", "magazine", "immersive"],
  comparison: ["magazine", "split", "editorial"],
  guide: ["editorial", "minimal", "magazine"],
  fact: ["minimal", "editorial", "magazine"],
  anatomy: ["split", "editorial", "magazine"],
};

const CATEGORY_BODY_BIAS: Partial<Record<CategorySlug, BodyLayoutVariant[]>> = {
  breeds: ["visual", "magazine", "classic"],
  compare: ["magazine", "classic", "editorial"],
  guides: ["editorial", "classic", "magazine"],
  behavior: ["magazine", "editorial", "classic"],
  health: ["classic", "editorial", "magazine"],
  diseases: ["classic", "editorial"],
  facts: ["editorial", "classic", "magazine"],
};

function pickFromPool<T>(pool: T[], seed: number): T {
  return pool[seed % pool.length];
}

export function getArticlePresentation(article: Article): ArticlePresentation {
  const seed = hashString(article.id);

  const heroPool =
    ENTITY_HERO_BIAS[article.entityType] ?? HERO_VARIANTS;

  const bodyPool =
    CATEGORY_BODY_BIAS[article.category] ?? BODY_LAYOUTS;

  return {
    heroVariant: pickFromPool(heroPool, seed),
    bodyLayout: pickFromPool(bodyPool, seed >> 3),
  };
}
