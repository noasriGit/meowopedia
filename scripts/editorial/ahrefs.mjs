const AHREFS_BASE = "https://api.ahrefs.com/v3/keywords-explorer";

/**
 * Build the Ahrefs `where` filter for KD < maxDifficulty and weak DR in top 5.
 */
export function buildKeywordFilters({ maxDifficulty = 20, maxSerpDrTop5Min = 15, minVolume = 0 } = {}) {
  const clauses = [
    { field: "difficulty", is: ["lt", maxDifficulty] },
    { field: "serp_domain_rating_top5_min", is: ["lt", maxSerpDrTop5Min] },
  ];

  if (minVolume > 0) {
    clauses.push({ field: "volume", is: ["gte", minVolume] });
  }

  return JSON.stringify({ and: clauses });
}

export class AhrefsClient {
  #apiToken;
  #timeoutSeconds;

  constructor(apiToken, { timeoutSeconds = 60 } = {}) {
    this.#apiToken = apiToken;
    this.#timeoutSeconds = timeoutSeconds;
  }

  async matchingTerms({
    keywords,
    country = "us",
    matchMode = "terms",
    terms = "questions",
    select = "keyword,volume,difficulty,traffic_potential,intents",
    where,
    orderBy = "volume:desc",
    limit = 200,
  }) {
    const params = new URLSearchParams({
      country,
      keywords,
      match_mode: matchMode,
      terms,
      select,
      order_by: orderBy,
      limit: String(limit),
      timeout: String(this.#timeoutSeconds),
    });

    if (where) params.set("where", where);

    const url = `${AHREFS_BASE}/matching-terms?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.#apiToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ahrefs API error ${response.status}: ${body}`);
    }

    const payload = await response.json();
    if (payload.error) {
      throw new Error(`Ahrefs API error: ${payload.error}`);
    }

    return payload.keywords ?? [];
  }

  async relatedTerms({
    keywords,
    country = "us",
    select = "keyword,volume,difficulty,traffic_potential,intents",
    where,
    orderBy = "volume:desc",
    limit = 100,
  }) {
    const params = new URLSearchParams({
      country,
      keywords,
      select,
      order_by: orderBy,
      limit: String(limit),
      timeout: String(this.#timeoutSeconds),
    });

    if (where) params.set("where", where);

    const url = `${AHREFS_BASE}/related-terms?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.#apiToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Ahrefs API error ${response.status}: ${body}`);
    }

    const payload = await response.json();
    if (payload.error) {
      throw new Error(`Ahrefs API error: ${payload.error}`);
    }

    return payload.keywords ?? [];
  }
}
