const QUESTION_WORDS = new Set([
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
  "was",
  "were",
  "be",
  "been",
  "being",
  "do",
  "does",
  "did",
  "can",
  "could",
  "should",
  "would",
  "will",
  "have",
  "has",
  "had",
  "what",
  "why",
  "how",
  "when",
  "where",
  "who",
  "which",
  "that",
  "this",
  "it",
  "mean",
  "means",
]);

const PRONOUN_WORDS = new Set([
  "my",
  "your",
  "yours",
  "their",
  "theirs",
  "our",
  "ours",
  "his",
  "her",
  "hers",
  "its",
  "me",
  "you",
  "i",
  "we",
  "they",
  "them",
  "he",
  "she",
  "owner",
  "owners",
  "someone",
  "anyone",
  "something",
  "anything",
]);

const FILLER_WORDS = new Set([
  ...QUESTION_WORDS,
  ...PRONOUN_WORDS,
  "all",
  "so",
  "much",
  "many",
  "often",
  "really",
  "just",
  "also",
  "still",
  "even",
  "sudden",
  "suddenly",
]);

const CAT_FORMS = new Set([
  "cat",
  "cats",
  "kitten",
  "kittens",
  "feline",
  "felines",
  "kitty",
  "kitties",
  "kittie",
]);

const GENERIC_VERB_TOKENS = new Set([
  "eat",
  "eats",
  "get",
  "gets",
  "have",
  "has",
  "make",
  "makes",
  "see",
  "go",
  "take",
  "give",
  "keep",
  "stay",
  "use",
  "put",
  "call",
]);

/** Non-cat subjects that change search intent when present. */
const CROSS_SUBJECT_TOKENS = new Set([
  "dog",
  "dogs",
  "human",
  "humans",
  "bird",
  "birds",
  "child",
  "children",
  "people",
  "person",
  "mouse",
  "mice",
  "rat",
  "rats",
]);

/** Map multi-word symptom phrases to a canonical token before comparison. */
const PHRASE_CANONICALS = [
  [/\bthrow(?:ing)?\s+up\b/g, "vomit"],
  [/\bthrew\s+up\b/g, "vomit"],
  [/\bpass(?:ing)?\s+out\b/g, "faint"],
];

/** Normalize a keyword for deduplication comparisons. */
export function normalizeKeyword(keyword) {
  let text = keyword
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const [pattern, replacement] of PHRASE_CANONICALS) {
    text = text.replace(pattern, replacement);
  }

  return text.replace(/\s+/g, " ").trim();
}

/** Light English stemming for keyword dedup (not a full stemmer). */
export function stemToken(token) {
  if (token.length <= 3) return token;

  let stem = token;

  if (stem.endsWith("ing") && stem.length > 5) {
    stem = stem.slice(0, -3);
    if (stem.length > 2 && stem.at(-1) === stem.at(-2)) {
      stem = stem.slice(0, -1);
    }
  } else if (stem.endsWith("ed") && stem.length > 4) {
    stem = stem.slice(0, -2);
    if (stem.endsWith("i")) stem = `${stem.slice(0, -1)}y`;
  } else if (stem.endsWith("ies") && stem.length > 4) {
    stem = `${stem.slice(0, -3)}y`;
  } else if (stem.endsWith("s") && !stem.endsWith("ss") && stem.length > 3) {
    stem = stem.slice(0, -1);
  }

  return stem;
}

/** Map cat-related word forms to a single canonical token. */
export function canonicalizeToken(token) {
  const stemmed = stemToken(token);
  if (CAT_FORMS.has(token) || CAT_FORMS.has(stemmed)) return "cat";
  return stemmed;
}

/** Significant tokens after removing filler words. */
export function keywordTokens(keyword) {
  return normalizeKeyword(keyword)
    .split(" ")
    .filter((token) => token.length > 1 && !FILLER_WORDS.has(token))
    .map(canonicalizeToken);
}

/**
 * Core topic tokens — the subject matter after cat/pronoun/question normalization.
 */
export function coreKeywordTokens(keyword) {
  const tokens = keywordTokens(keyword).filter((token) => token !== "cat");
  return tokens.length ? tokens : keywordTokens(keyword);
}

/** Stable signature for core topic comparison. */
export function coreSignature(keyword) {
  return [...new Set(coreKeywordTokens(keyword))].sort().join("|");
}

/**
 * Jaccard similarity on keyword tokens (0–1).
 */
export function keywordSimilarity(a, b, { useCore = false } = {}) {
  const tokenize = useCore ? coreKeywordTokens : keywordTokens;
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return intersection / union;
}

function isSubset(smaller, larger) {
  for (const token of smaller) {
    if (!larger.has(token)) return false;
  }
  return true;
}

function nonGenericCoreTokens(tokens) {
  return [...tokens].filter((token) => token !== "cat" && !GENERIC_VERB_TOKENS.has(token));
}

function hasConflictingSubjects(coreA, coreB) {
  const subjectsA = [...coreA].filter((token) => CROSS_SUBJECT_TOKENS.has(token)).sort();
  const subjectsB = [...coreB].filter((token) => CROSS_SUBJECT_TOKENS.has(token)).sort();
  if (!subjectsA.length && !subjectsB.length) return false;
  return subjectsA.join("|") !== subjectsB.join("|");
}

function sharedCoreTopic(candidate, existing) {
  const coreA = new Set(coreKeywordTokens(candidate));
  const coreB = new Set(coreKeywordTokens(existing));
  if (!coreA.size || !coreB.size) return false;
  if (hasConflictingSubjects(coreA, coreB)) return false;

  if (coreA.size === coreB.size && [...coreA].every((token) => coreB.has(token))) {
    return true;
  }

  const smaller = coreA.size <= coreB.size ? coreA : coreB;
  const larger = coreA.size <= coreB.size ? coreB : coreA;
  const smallerMeaningful = nonGenericCoreTokens(smaller);

  // Require substantive single-token overlap (avoids "eat" matching unrelated food/predator queries).
  if (smaller.size === 1) {
    const [token] = smaller;
    if (token.length >= 5 && isSubset(smaller, larger)) return true;
    return false;
  }

  // Require at least two meaningful tokens so "get + worm" does not match "human + worm".
  if (smallerMeaningful.length >= 2 && isSubset(smaller, larger)) return true;

  return false;
}

/**
 * Returns true if the candidate is likely a duplicate of an existing keyword.
 */
export function isDuplicateKeyword(
  candidate,
  existingKeywords,
  { similarityThreshold = 0.65, coreSimilarityThreshold = 0.8 } = {},
) {
  const normalizedCandidate = normalizeKeyword(candidate);
  if (!normalizedCandidate) return true;

  const candidateCore = coreSignature(candidate);

  for (const existing of existingKeywords) {
    const normalizedExisting = normalizeKeyword(existing);
    if (!normalizedExisting) continue;

    if (normalizedCandidate === normalizedExisting) return true;

    if (candidateCore && candidateCore === coreSignature(existing)) {
      const coreA = new Set(coreKeywordTokens(candidate));
      const coreB = new Set(coreKeywordTokens(existing));
      if (!hasConflictingSubjects(coreA, coreB)) return true;
    }

    if (sharedCoreTopic(candidate, existing)) return true;

    if (
      normalizedCandidate.includes(normalizedExisting) ||
      normalizedExisting.includes(normalizedCandidate)
    ) {
      const shorter = Math.min(normalizedCandidate.length, normalizedExisting.length);
      const longer = Math.max(normalizedCandidate.length, normalizedExisting.length);
      if (shorter / longer >= 0.5) return true;
    }

    if (keywordSimilarity(candidate, existing, { useCore: true }) >= coreSimilarityThreshold) {
      return true;
    }

    // Fallback for phrasing variants that share most non-cat tokens (e.g. knead + on + me).
    if (keywordSimilarity(candidate, existing) >= similarityThreshold) {
      const coreA = new Set(coreKeywordTokens(candidate));
      const coreB = new Set(coreKeywordTokens(existing));
      const sharedCore = [...coreA].filter((token) => coreB.has(token));
      const uniqueCore = new Set([...coreA, ...coreB].filter((token) => !sharedCore.includes(token)));
      const uniqueNonVerb = [...uniqueCore].filter((token) => !GENERIC_VERB_TOKENS.has(token));
      if (!uniqueNonVerb.length || sharedCoreTopic(candidate, existing)) return true;
    }
  }

  return false;
}

/**
 * Find the first existing keyword that the candidate duplicates (for logging).
 */
export function findDuplicateMatch(candidate, existingKeywords, options = {}) {
  for (const existing of existingKeywords) {
    if (isDuplicateKeyword(candidate, [existing], options)) return existing;
  }
  return null;
}
