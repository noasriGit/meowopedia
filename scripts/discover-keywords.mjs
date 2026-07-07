#!/usr/bin/env node
/**
 * Discover a new cat keyword via Ahrefs and queue it for daily article drafting.
 *
 * Usage:
 *   npm run discover-keywords
 *   npm run discover-keywords -- --dry-run
 *   npm run discover-keywords -- --force
 *
 * Requires AHREFS_API_TOKEN in .env.local (or environment).
 */

import { AhrefsClient, buildKeywordFilters } from "./editorial/ahrefs.mjs";
import {
  collectIndexedKeywords,
  loadContentIndex,
  queueArticleInIndex,
  saveContentIndex,
} from "./editorial/content-index.mjs";
import { loadEnv, requireEnv } from "./editorial/env.mjs";
import { randomDraftAt, todayInTimezone } from "./editorial/draft-window.mjs";
import { inferArticleMeta } from "./editorial/infer-category.mjs";
import { isDuplicateKeyword } from "./editorial/normalize-keyword.mjs";
import {
  loadDailyQueue,
  loadPipelineConfig,
  pickSeedForToday,
  saveDailyQueue,
  shouldSkipKeyword,
} from "./editorial/queue.mjs";

loadEnv();

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

async function main() {
  const config = loadPipelineConfig();
  const { ahrefs, draftWindow, skipPatterns } = config;
  const today = todayInTimezone(draftWindow.timezone);

  const existingQueue = loadDailyQueue();
  if (
    !force &&
    existingQueue?.date === today &&
    existingQueue?.keyword &&
    !existingQueue.drafted
  ) {
    console.log(JSON.stringify({ status: "already_queued", queue: existingQueue }, null, 2));
    return;
  }

  const indexedKeywords = collectIndexedKeywords();
  const where = buildKeywordFilters({
    maxDifficulty: ahrefs.maxDifficulty,
    maxSerpDrTop5Min: ahrefs.maxSerpDrTop5Min,
    minVolume: ahrefs.minVolume,
  });

  const client = new AhrefsClient(requireEnv("AHREFS_API_TOKEN"));
  const primarySeed = pickSeedForToday(ahrefs.seeds, today);
  const seedsToQuery = [primarySeed, ...ahrefs.seeds.filter((seed) => seed !== primarySeed)].slice(
    0,
    ahrefs.maxSeedsPerRun ?? 3,
  );

  const seen = new Set();
  const candidates = [];

  for (const seed of seedsToQuery) {
    console.error(`Querying Ahrefs matching-terms for seed: "${seed}"`);
    const rows = await client.matchingTerms({
      keywords: seed,
      country: ahrefs.country,
      matchMode: ahrefs.matchMode ?? "terms",
      terms: ahrefs.terms ?? "questions",
      where,
      limit: ahrefs.limitPerSeed ?? 200,
    });

    for (const row of rows) {
      const keyword = row.keyword?.trim();
      if (!keyword || seen.has(keyword.toLowerCase())) continue;
      seen.add(keyword.toLowerCase());

      if (shouldSkipKeyword(keyword, skipPatterns)) continue;
      if (isDuplicateKeyword(keyword, indexedKeywords)) continue;
      if ((row.difficulty ?? 100) >= ahrefs.maxDifficulty) continue;

      candidates.push({
        keyword,
        volume: row.volume ?? 0,
        difficulty: row.difficulty ?? null,
        trafficPotential: row.traffic_potential ?? null,
        intents: row.intents ?? null,
        seed,
      });
    }
  }

  candidates.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));

  if (!candidates.length) {
    console.error("No new keywords matched filters. Trying related-terms fallback...");
    const fallbackRows = await client.relatedTerms({
      keywords: primarySeed,
      country: ahrefs.country,
      where,
      limit: ahrefs.limitPerSeed ?? 100,
    });

    for (const row of fallbackRows) {
      const keyword = row.keyword?.trim();
      if (!keyword || seen.has(keyword.toLowerCase())) continue;
      if (shouldSkipKeyword(keyword, skipPatterns)) continue;
      if (isDuplicateKeyword(keyword, indexedKeywords)) continue;

      candidates.push({
        keyword,
        volume: row.volume ?? 0,
        difficulty: row.difficulty ?? null,
        trafficPotential: row.traffic_potential ?? null,
        intents: row.intents ?? null,
        seed: primarySeed,
        source: "related-terms",
      });
    }

    candidates.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));
  }

  if (!candidates.length) {
    const result = {
      status: "no_candidates",
      date: today,
      message: "No new keywords passed Ahrefs filters and deduplication.",
      filters: {
        maxDifficulty: ahrefs.maxDifficulty,
        maxSerpDrTop5Min: ahrefs.maxSerpDrTop5Min,
        minVolume: ahrefs.minVolume,
      },
    };
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = 2;
    return;
  }

  const pick = candidates[0];
  const meta = inferArticleMeta(pick.keyword);
  const schedule = randomDraftAt({
    date: today,
    startHour: draftWindow.startHour,
    endHour: draftWindow.endHour,
    timezone: draftWindow.timezone,
  });

  const queue = {
    date: today,
    status: "queued",
    discoveredAt: new Date().toISOString(),
    filters: {
      maxDifficulty: ahrefs.maxDifficulty,
      maxSerpDrTop5Min: ahrefs.maxSerpDrTop5Min,
      minVolume: ahrefs.minVolume,
    },
    keyword: {
      primary: pick.keyword,
      volume: pick.volume,
      difficulty: pick.difficulty,
      trafficPotential: pick.trafficPotential,
      intents: pick.intents,
      seed: pick.seed,
      source: pick.source ?? "matching-terms",
    },
    article: {
      id: meta.id,
      title: meta.title ?? undefined,
      slug: meta.slug,
      category: meta.category,
      entityType: meta.entityType,
      searchIntent: meta.searchIntent,
      contentPath: `content/${meta.category}/${meta.slug}.mdx`,
    },
    draftAt: schedule.draftAt,
    draftAtIso: schedule.draftAtIso,
    draftAtEpochMs: schedule.draftAtEpochMs,
    draftWindow: {
      timezone: schedule.timezone,
      startHour: schedule.window.startHour,
      endHour: schedule.window.endHour,
    },
    drafted: false,
    draftedAt: null,
    prUrl: null,
    candidatesReviewed: candidates.slice(0, 10).map((item) => ({
      keyword: item.keyword,
      volume: item.volume,
      difficulty: item.difficulty,
    })),
  };

  if (dryRun) {
    console.log(JSON.stringify({ status: "dry_run", queue }, null, 2));
    return;
  }

  const index = loadContentIndex();
  const alreadyQueued = index.articles.some(
    (article) =>
      article.status === "queued" &&
      article.primaryKeyword?.toLowerCase() === pick.keyword.toLowerCase(),
  );

  if (!alreadyQueued) {
    queueArticleInIndex(index, {
      id: meta.id,
      primaryKeyword: pick.keyword,
      volume: pick.volume,
      difficulty: pick.difficulty,
      entityType: meta.entityType,
      searchIntent: meta.searchIntent,
    });
    saveContentIndex(index);
  }

  saveDailyQueue(queue);

  console.log(
    JSON.stringify(
      {
        status: "queued",
        keyword: pick.keyword,
        volume: pick.volume,
        difficulty: pick.difficulty,
        draftAtIso: queue.draftAtIso,
        articleId: meta.id,
        contentPath: queue.article.contentPath,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
