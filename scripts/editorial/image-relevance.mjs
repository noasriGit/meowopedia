/** Shared heuristics for automated image sourcing and audits. */

export const CAT_KEYWORDS =
  /\b(cat|cats|kitten|kittens|feline|kitty|maine coon|bengal|persian|sphynx)\b/i;

/** Alt/title terms that usually indicate a bad hero pick for Meowopedia. */
export const BLOCKLIST_ALT =
  /\b(mite|mites|tick|ticks|person|people|man\b|men\b|woman|women|boy|girl|portrait|selfie|human|crowd|wedding|model\b|actor|smiling|judge|mom\b|pre-colorization|ups brought)\b/i;

const CATEGORIES_REQUIRING_CAT = new Set([
  "behavior",
  "health",
  "symptoms",
  "diseases",
  "breeds",
  "facts",
  "guides",
  "care",
  "anatomy",
  "compare",
  "nutrition",
]);

export function cleanQuery(text) {
  return text
    .replace(/\?/g, "")
    .replace(/can cats|are cats|why do cats|what does|how to|in cats/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isRelevantCandidate(candidate, article) {
  const haystack = `${candidate.alt ?? ""} ${candidate.url ?? ""}`.toLowerCase();
  if (BLOCKLIST_ALT.test(haystack)) return false;

  const slugPhrase = article.slug.replace(/-cat$/, "").replace(/-/g, " ").toLowerCase();

  if (article.category === "plants") {
    const terms = slugPhrase.split(" ").filter((t) => t.length > 2);
    return terms.some((term) => haystack.includes(term));
  }

  if (article.category === "foods") {
    const terms = slugPhrase.split(" ").filter((t) => t.length > 2);
    if (!terms.some((term) => haystack.includes(term))) return false;
    return CAT_KEYWORDS.test(haystack);
  }

  if (CATEGORIES_REQUIRING_CAT.has(article.category)) {
    return CAT_KEYWORDS.test(haystack);
  }

  return true;
}

export function flagImageIssues(article, asset) {
  const alt = asset?.alt ?? "";
  const haystack = `${alt} ${asset?.url ?? ""}`;
  const flags = [];

  if (!alt.trim()) flags.push("missing-alt");
  if (BLOCKLIST_ALT.test(haystack)) flags.push("blocklist-term-in-alt");

  if (CATEGORIES_REQUIRING_CAT.has(article.category) && !CAT_KEYWORDS.test(haystack)) {
    flags.push("no-cat-in-alt");
  }

  if (article.category === "plants") {
    const slugPhrase = article.slug.replace(/-cat$/, "").replace(/-/g, " ").toLowerCase();
    const terms = slugPhrase.split(" ").filter((t) => t.length > 2);
    if (!terms.some((term) => haystack.toLowerCase().includes(term))) {
      flags.push("topic-term-missing");
    }
  }

  if (article.category === "foods") {
    const slugPhrase = article.slug.replace(/-cat$/, "").replace(/-/g, " ").toLowerCase();
    const terms = slugPhrase.split(" ").filter((t) => t.length > 2);
    if (!terms.some((term) => haystack.toLowerCase().includes(term))) {
      flags.push("topic-term-missing");
    }
    if (!CAT_KEYWORDS.test(haystack)) {
      flags.push("food-without-cat");
    }
  }

  return flags;
}
