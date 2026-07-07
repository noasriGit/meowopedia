/**
 * Meowopedia taxonomy — single source of truth for categories,
 * entity types, URL prefixes, and pillar page metadata.
 */

export const ENTITY_TYPES = [
  "breed",
  "disease",
  "symptom",
  "behavior",
  "nutrition",
  "food",
  "plant",
  "training",
  "anatomy",
  "life-stage",
  "care-guide",
  "medical-procedure",
  "medication",
  "toy",
  "accessory",
  "history",
  "famous-cat",
  "wild-cat",
  "color",
  "pattern",
  "gene",
  "emergency",
  "first-aid",
  "health-symptom",
  "cat-sound",
  "body-language",
  "pregnancy",
  "kitten",
  "senior-cat",
  "indoor-cat",
  "outdoor-cat",
  "adoption",
  "rescue",
  "shelter",
  "vet-procedure",
  "parasite",
  "vaccination",
  "poisonous-food",
  "poisonous-plant",
  "safe-food",
  "fact",
  "mythology",
  "breeds-by-country",
  "sport",
  "competition",
  "cat-job",
  "intelligence",
  "evolution",
  "guide",
  "comparison",
  "checklist",
  "calculator",
  "resource",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export const CATEGORY_SLUGS = [
  "breeds",
  "health",
  "behavior",
  "nutrition",
  "foods",
  "plants",
  "symptoms",
  "diseases",
  "care",
  "training",
  "anatomy",
  "history",
  "facts",
  "guides",
  "wild-cats",
  "compare",
  "calculators",
  "checklists",
  "resources",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface CategoryDefinition {
  slug: CategorySlug;
  title: string;
  description: string;
  pillarIntro: string;
  entityTypes: EntityType[];
  relatedCategories: CategorySlug[];
  /** Filter keys available on pillar page */
  filterKeys?: string[];
}

export interface EntityRouteDefinition {
  entityType: EntityType;
  category: CategorySlug;
  urlPrefix: string;
  /** Content directory relative to /content */
  contentDir: string;
  layout: EntityLayoutKey;
  sidebar: EntitySidebarKey;
  schemaTypes: SchemaTypeKey[];
}

export type EntityLayoutKey =
  | "breed"
  | "disease"
  | "food"
  | "plant"
  | "behavior"
  | "default";

export type EntitySidebarKey =
  | "breed"
  | "disease"
  | "food"
  | "plant"
  | "behavior"
  | "default";

export type SchemaTypeKey =
  | "Article"
  | "FAQPage"
  | "HowTo"
  | "MedicalWebPage"
  | "DefinedTerm";

export const CATEGORIES: Record<CategorySlug, CategoryDefinition> = {
  breeds: {
    slug: "breeds",
    title: "Cat Breeds",
    description:
      "Complete encyclopedia of domestic cat breeds — temperament, health, grooming, and history.",
    pillarIntro:
      "Explore every recognized cat breed with detailed profiles covering temperament, size, health predispositions, grooming needs, and breed history.",
    entityTypes: ["breed", "breeds-by-country", "color", "pattern", "gene"],
    relatedCategories: ["health", "care", "nutrition", "behavior"],
    filterKeys: ["size", "hairLength", "energy", "kidFriendly", "shedding"],
  },
  health: {
    slug: "health",
    title: "Cat Health",
    description:
      "Medical encyclopedia for feline diseases, symptoms, medications, and veterinary procedures.",
    pillarIntro:
      "Authoritative health reference covering diseases, symptoms, diagnostics, treatments, medications, and emergency care.",
    entityTypes: [
      "disease",
      "symptom",
      "health-symptom",
      "medication",
      "medical-procedure",
      "vet-procedure",
      "parasite",
      "vaccination",
      "emergency",
      "first-aid",
    ],
    relatedCategories: ["symptoms", "diseases", "nutrition", "care"],
    filterKeys: ["severity", "bodySystem", "lifeStage"],
  },
  behavior: {
    slug: "behavior",
    title: "Cat Behavior",
    description:
      "Understand why cats do what they do — body language, sounds, training, and behavioral science.",
    pillarIntro:
      "Decode feline behavior from purring to aggression. Learn what is normal, what is concerning, and how to respond.",
    entityTypes: ["behavior", "cat-sound", "body-language", "training", "intelligence"],
    relatedCategories: ["care", "health", "training"],
    filterKeys: ["severity", "context"],
  },
  nutrition: {
    slug: "nutrition",
    title: "Cat Nutrition",
    description:
      "Feline nutrition science — dietary requirements, life-stage feeding, and ingredient analysis.",
    pillarIntro:
      "Evidence-based nutrition guides for every life stage, dietary need, and health condition.",
    entityTypes: ["nutrition", "safe-food"],
    relatedCategories: ["foods", "health", "care"],
    filterKeys: ["lifeStage", "dietType"],
  },
  foods: {
    slug: "foods",
    title: "Foods & Treats",
    description:
      "Can cats eat it? Complete guide to safe foods, toxic foods, and feline dietary science.",
    pillarIntro:
      "Every food item evaluated for feline safety — toxicity, nutrition, serving sizes, and vet guidance.",
    entityTypes: ["food", "poisonous-food", "safe-food"],
    relatedCategories: ["plants", "nutrition", "health"],
    filterKeys: ["safety", "category"],
  },
  plants: {
    slug: "plants",
    title: "Plants & Cats",
    description:
      "Toxic and safe plants for cats — identification, symptoms, and emergency response.",
    pillarIntro:
      "Identify plants that are safe or toxic for cats, with toxicity levels, symptoms, and emergency steps.",
    entityTypes: ["plant", "poisonous-plant"],
    relatedCategories: ["foods", "health", "guides"],
    filterKeys: ["toxicityLevel", "indoorOutdoor"],
  },
  symptoms: {
    slug: "symptoms",
    title: "Cat Symptoms",
    description:
      "Symptom encyclopedia — what each sign means, when to worry, and related conditions.",
    pillarIntro:
      "Look up any feline symptom to understand causes, urgency, related diseases, and next steps.",
    entityTypes: ["symptom", "health-symptom"],
    relatedCategories: ["diseases", "health", "guides"],
    filterKeys: ["urgency", "bodySystem"],
  },
  diseases: {
    slug: "diseases",
    title: "Cat Diseases",
    description:
      "Comprehensive disease reference — causes, diagnosis, treatment, and breed predispositions.",
    pillarIntro:
      "In-depth disease profiles with symptoms, risk factors, diagnostics, treatments, and prevention.",
    entityTypes: ["disease"],
    relatedCategories: ["symptoms", "health", "care"],
    filterKeys: ["severity", "bodySystem", "chronicAcute"],
  },
  care: {
    slug: "care",
    title: "Cat Care",
    description:
      "Daily care guides — grooming, dental, litter, enrichment, and life-stage care.",
    pillarIntro:
      "Practical care encyclopedia for indoor, outdoor, senior, and kitten cats at every life stage.",
    entityTypes: [
      "care-guide",
      "life-stage",
      "kitten",
      "senior-cat",
      "indoor-cat",
      "outdoor-cat",
      "adoption",
      "rescue",
      "shelter",
      "accessory",
      "toy",
    ],
    relatedCategories: ["health", "behavior", "nutrition"],
    filterKeys: ["lifeStage", "topic"],
  },
  training: {
    slug: "training",
    title: "Cat Training",
    description:
      "Positive reinforcement training methods for cats — litter, scratching, and behavior modification.",
    pillarIntro:
      "Training guides rooted in feline behavior science — effective, humane, and cat-friendly methods.",
    entityTypes: ["training"],
    relatedCategories: ["behavior", "care"],
    filterKeys: ["difficulty", "topic"],
  },
  anatomy: {
    slug: "anatomy",
    title: "Cat Anatomy",
    description:
      "Feline anatomy and physiology — body systems, senses, and biological mechanisms.",
    pillarIntro:
      "Explore how cats are built — from whiskers to kidneys, with veterinary-grade anatomical detail.",
    entityTypes: ["anatomy"],
    relatedCategories: ["health", "behavior"],
    filterKeys: ["bodySystem"],
  },
  history: {
    slug: "history",
    title: "Cat History",
    description:
      "The history of cats — domestication, mythology, famous cats, and cultural significance.",
    pillarIntro:
      "From ancient Egypt to internet fame — the complete historical and cultural record of cats.",
    entityTypes: ["history", "famous-cat", "mythology", "evolution"],
    relatedCategories: ["breeds", "facts", "wild-cats"],
    filterKeys: ["era", "region"],
  },
  facts: {
    slug: "facts",
    title: "Cat Facts",
    description:
      "Verified feline facts — biology, records, statistics, and surprising truths about cats.",
    pillarIntro:
      "Fact-checked encyclopedia entries covering biology, records, intelligence, and cat trivia.",
    entityTypes: ["fact", "intelligence", "sport", "competition", "cat-job"],
    relatedCategories: ["history", "anatomy", "behavior"],
    filterKeys: ["topic"],
  },
  guides: {
    slug: "guides",
    title: "Cat Guides",
    description:
      "In-depth guides for cat owners — beginner to advanced, step-by-step and comprehensive.",
    pillarIntro:
      "Structured reading paths from first-time owners to advanced feline care topics.",
    entityTypes: ["guide", "checklist", "pregnancy"],
    relatedCategories: ["care", "health", "training"],
    filterKeys: ["difficulty", "topic"],
  },
  "wild-cats": {
    slug: "wild-cats",
    title: "Wild Cats",
    description:
      "Wild felid species — lions to sand cats, conservation, behavior, and biology.",
    pillarIntro:
      "Every wild cat species profiled — habitat, behavior, conservation status, and taxonomy.",
    entityTypes: ["wild-cat"],
    relatedCategories: ["history", "anatomy", "facts"],
    filterKeys: ["region", "conservationStatus"],
  },
  compare: {
    slug: "compare",
    title: "Compare",
    description:
      "Side-by-side comparisons of breeds, foods, diseases, and care approaches.",
    pillarIntro:
      "Data-driven comparisons to help you choose breeds, foods, treatments, and care strategies.",
    entityTypes: ["comparison"],
    relatedCategories: ["breeds", "foods", "health"],
    filterKeys: ["compareType"],
  },
  calculators: {
    slug: "calculators",
    title: "Calculators",
    description:
      "Interactive feline calculators — weight, age, calorie, and dosage tools.",
    pillarIntro:
      "Practical tools for cat weight tracking, calorie needs, age conversion, and more.",
    entityTypes: ["calculator"],
    relatedCategories: ["nutrition", "health", "care"],
    filterKeys: ["calculatorType"],
  },
  checklists: {
    slug: "checklists",
    title: "Checklists",
    description:
      "Printable and interactive checklists for adoption, vet visits, travel, and emergencies.",
    pillarIntro:
      "Actionable checklists for every major cat ownership milestone and emergency scenario.",
    entityTypes: ["checklist"],
    relatedCategories: ["guides", "care", "health"],
    filterKeys: ["topic"],
  },
  resources: {
    slug: "resources",
    title: "Resources",
    description:
      "Curated external resources — veterinary organizations, shelters, and research.",
    pillarIntro:
      "Trusted external resources vetted by our editorial team for cat owners and professionals.",
    entityTypes: ["resource"],
    relatedCategories: ["guides", "care", "health"],
    filterKeys: ["resourceType"],
  },
};

/** Maps entity types to routing, content dirs, and layout templates */
export const ENTITY_ROUTES: EntityRouteDefinition[] = [
  {
    entityType: "breed",
    category: "breeds",
    urlPrefix: "/breeds",
    contentDir: "breeds",
    layout: "breed",
    sidebar: "breed",
    schemaTypes: ["Article", "DefinedTerm", "FAQPage"],
  },
  {
    entityType: "disease",
    category: "diseases",
    urlPrefix: "/diseases",
    contentDir: "diseases",
    layout: "disease",
    sidebar: "disease",
    schemaTypes: ["MedicalWebPage", "FAQPage"],
  },
  {
    entityType: "food",
    category: "foods",
    urlPrefix: "/foods",
    contentDir: "foods",
    layout: "food",
    sidebar: "food",
    schemaTypes: ["Article", "FAQPage"],
  },
  {
    entityType: "plant",
    category: "plants",
    urlPrefix: "/plants",
    contentDir: "plants",
    layout: "plant",
    sidebar: "plant",
    schemaTypes: ["Article", "MedicalWebPage", "FAQPage"],
  },
  {
    entityType: "behavior",
    category: "behavior",
    urlPrefix: "/behavior",
    contentDir: "behavior",
    layout: "behavior",
    sidebar: "behavior",
    schemaTypes: ["Article", "HowTo", "FAQPage"],
  },
  {
    entityType: "symptom",
    category: "symptoms",
    urlPrefix: "/symptoms",
    contentDir: "symptoms",
    layout: "disease",
    sidebar: "disease",
    schemaTypes: ["MedicalWebPage", "DefinedTerm"],
  },
  {
    entityType: "nutrition",
    category: "nutrition",
    urlPrefix: "/nutrition",
    contentDir: "nutrition",
    layout: "default",
    sidebar: "food",
    schemaTypes: ["Article", "HowTo"],
  },
  {
    entityType: "care-guide",
    category: "care",
    urlPrefix: "/care",
    contentDir: "care",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article", "HowTo", "FAQPage"],
  },
  {
    entityType: "guide",
    category: "guides",
    urlPrefix: "/guides",
    contentDir: "guides",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article", "HowTo"],
  },
  {
    entityType: "wild-cat",
    category: "wild-cats",
    urlPrefix: "/wild-cats",
    contentDir: "wild-cats",
    layout: "breed",
    sidebar: "breed",
    schemaTypes: ["Article", "DefinedTerm"],
  },
  {
    entityType: "comparison",
    category: "compare",
    urlPrefix: "/compare",
    contentDir: "compare",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article"],
  },
  {
    entityType: "fact",
    category: "facts",
    urlPrefix: "/facts",
    contentDir: "facts",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article", "DefinedTerm"],
  },
  {
    entityType: "anatomy",
    category: "anatomy",
    urlPrefix: "/anatomy",
    contentDir: "anatomy",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article", "DefinedTerm"],
  },
  {
    entityType: "parasite",
    category: "health",
    urlPrefix: "/health",
    contentDir: "health",
    layout: "disease",
    sidebar: "disease",
    schemaTypes: ["MedicalWebPage", "FAQPage"],
  },
  {
    entityType: "vaccination",
    category: "health",
    urlPrefix: "/health",
    contentDir: "health",
    layout: "disease",
    sidebar: "disease",
    schemaTypes: ["MedicalWebPage", "FAQPage"],
  },
  {
    entityType: "medication",
    category: "health",
    urlPrefix: "/health",
    contentDir: "health",
    layout: "disease",
    sidebar: "disease",
    schemaTypes: ["MedicalWebPage", "FAQPage"],
  },
  {
    entityType: "pregnancy",
    category: "guides",
    urlPrefix: "/guides",
    contentDir: "guides",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article", "HowTo", "FAQPage"],
  },
  {
    entityType: "kitten",
    category: "guides",
    urlPrefix: "/guides",
    contentDir: "guides",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article", "HowTo"],
  },
  {
    entityType: "life-stage",
    category: "guides",
    urlPrefix: "/guides",
    contentDir: "guides",
    layout: "default",
    sidebar: "default",
    schemaTypes: ["Article", "HowTo", "FAQPage"],
  },
  {
    entityType: "cat-sound",
    category: "behavior",
    urlPrefix: "/behavior",
    contentDir: "behavior",
    layout: "behavior",
    sidebar: "behavior",
    schemaTypes: ["Article", "FAQPage"],
  },
  {
    entityType: "body-language",
    category: "behavior",
    urlPrefix: "/behavior",
    contentDir: "behavior",
    layout: "behavior",
    sidebar: "behavior",
    schemaTypes: ["Article", "FAQPage"],
  },
  {
    entityType: "health-symptom",
    category: "symptoms",
    urlPrefix: "/symptoms",
    contentDir: "symptoms",
    layout: "disease",
    sidebar: "disease",
    schemaTypes: ["MedicalWebPage", "DefinedTerm", "FAQPage"],
  },
  {
    entityType: "poisonous-food",
    category: "health",
    urlPrefix: "/health",
    contentDir: "health",
    layout: "food",
    sidebar: "food",
    schemaTypes: ["MedicalWebPage", "FAQPage"],
  },
];

export const ENTITY_ROUTE_MAP = new Map(
  ENTITY_ROUTES.map((route) => [route.entityType, route])
);

export const URL_PREFIX_TO_ROUTE = new Map(
  ENTITY_ROUTES.map((route) => [route.urlPrefix, route])
);

export function getRouteForEntityType(
  entityType: EntityType
): EntityRouteDefinition | undefined {
  return ENTITY_ROUTE_MAP.get(entityType);
}

export function getCategoryDefinition(
  slug: CategorySlug
): CategoryDefinition {
  return CATEGORIES[slug];
}

export function isCategorySlug(value: string): value is CategorySlug {
  return (CATEGORY_SLUGS as readonly string[]).includes(value);
}
