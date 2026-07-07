/**
 * Infer category, entity type, and article id prefix from a keyword phrase.
 */
const RULES = [
  {
    test: /\b(can cats eat|can cats have|can kittens eat|is .+ safe for cats)\b/i,
    category: "foods",
    entityType: "food",
    idPrefix: "food",
  },
  {
    test: /\b(toxic to cats|poisonous to cats|safe for cats|bad for cats)\b/i,
    category: "plants",
    entityType: "plant",
    idPrefix: "plant",
  },
  {
    test: /\b(symptom|vomit|vomiting|diarrhea|cough|sneeze|drool|snore|limp)\b/i,
    category: "symptoms",
    entityType: "symptom",
    idPrefix: "symptom",
  },
  {
    test: /\b(disease|infection|virus|failure|disorder|cancer)\b/i,
    category: "diseases",
    entityType: "disease",
    idPrefix: "disease",
  },
  {
    test: /\b(breed|persian|bengal|sphynx|maine coon|ragdoll|siamese)\b/i,
    category: "breeds",
    entityType: "breed",
    idPrefix: "breed",
  },
  {
    test: /\b(why do cats|why does my cat|why don't cats|what does it mean when cats)\b/i,
    category: "behavior",
    entityType: "behavior",
    idPrefix: "behavior",
  },
  {
    test: /\b(how to|how long|how often|how many|how old|guide)\b/i,
    category: "guides",
    entityType: "guide",
    idPrefix: "guide",
  },
  {
    test: /\b(anatomy|organ|whisker|pupil|teeth|claw|tail)\b/i,
    category: "anatomy",
    entityType: "anatomy",
    idPrefix: "anatomy",
  },
  {
    test: /\b(vs|versus|compared to|better than)\b/i,
    category: "compare",
    entityType: "comparison",
    idPrefix: "compare",
  },
];

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function inferArticleMeta(keyword) {
  for (const rule of RULES) {
    if (rule.test.test(keyword)) {
      const slug = slugify(keyword.replace(/^can cats /i, "").replace(/^why do cats /i, ""));
      return {
        category: rule.category,
        entityType: rule.entityType,
        id: `${rule.idPrefix}-${slug || "article"}`,
        slug: slug || "article",
        searchIntent: `Informational — ${keyword}`,
      };
    }
  }

  const slug = slugify(keyword);
  return {
    category: "facts",
    entityType: "fact",
    id: `fact-${slug || "article"}`,
    slug: slug || "article",
    searchIntent: `Informational — ${keyword}`,
  };
}

export function titleFromKeyword(keyword) {
  const trimmed = keyword.trim();
  if (/[?.!]$/.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
  if (/^(why|how|what|when|where|do|can|is|are)\b/i.test(trimmed)) {
    return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}?`;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
