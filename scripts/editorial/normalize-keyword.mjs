const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "for",
  "to",
  "of",
  "in",
  "on",
  "at",
  "is",
  "are",
  "do",
  "does",
  "can",
  "what",
  "why",
  "how",
  "when",
  "where",
  "my",
  "your",
]);

/** Normalize a keyword for deduplication comparisons. */
export function normalizeKeyword(keyword) {
  return keyword
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Significant tokens after removing stop words. */
export function keywordTokens(keyword) {
  return normalizeKeyword(keyword)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/**
 * Jaccard similarity on keyword tokens (0–1).
 */
export function keywordSimilarity(a, b) {
  const tokensA = new Set(keywordTokens(a));
  const tokensB = new Set(keywordTokens(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return intersection / union;
}

/**
 * Returns true if the candidate is likely a duplicate of an existing keyword.
 */
export function isDuplicateKeyword(candidate, existingKeywords, { similarityThreshold = 0.72 } = {}) {
  const normalizedCandidate = normalizeKeyword(candidate);
  if (!normalizedCandidate) return true;

  for (const existing of existingKeywords) {
    const normalizedExisting = normalizeKeyword(existing);
    if (!normalizedExisting) continue;

    if (normalizedCandidate === normalizedExisting) return true;
    if (
      normalizedCandidate.includes(normalizedExisting) ||
      normalizedExisting.includes(normalizedCandidate)
    ) {
      const shorter = Math.min(normalizedCandidate.length, normalizedExisting.length);
      const longer = Math.max(normalizedCandidate.length, normalizedExisting.length);
      if (shorter / longer >= 0.55) return true;
    }

    if (keywordSimilarity(candidate, existing) >= similarityThreshold) return true;
  }

  return false;
}
