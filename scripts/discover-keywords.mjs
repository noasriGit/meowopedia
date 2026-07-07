#!/usr/bin/env node
/**
 * Discover a new cat keyword from the extended keyword CSV list and queue it
 * for daily article drafting.
 *
 * Usage:
 *   npm run discover-keywords
 *   npm run discover-keywords -- --dry-run
 *   npm run discover-keywords -- --force
 */

import {
  collectIndexedKeywords,
  loadContentIndex,
  queueArticleInIndex,
  saveContentIndex,
} from "./editorial/content-index.mjs";
import { loadEnv } from "./editorial/env.mjs";
import { randomDraftAt, todayInTimezone } from "./editorial/draft-window.mjs";
import { inferArticleMeta } from "./editorial/infer-category.mjs";
import { filterKeywordRows, loadKeywordCsv } from "./editorial/keyword-csv.mjs";
import { findDuplicateMatch } from "./editorial/normalize-keyword.mjs";
import {
  loadDailyQueue,
  loadPipelineConfig,
  saveDailyQueue,
  shouldSkipKeyword,
} from "./editorial/queue.mjs";

loadEnv();

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

function main() {
  const config = loadPipelineConfig();
  const { keywordList, draftWindow, skipPatterns } = config;
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
  const { path: csvPath, rows, totalRows } = loadKeywordCsv(keywordList.path);

  console.error(`Loaded ${totalRows} keywords from ${keywordList.path}`);

  const filtered = filterKeywordRows(rows, {
    maxDifficulty: keywordList.maxDifficulty,
    minVolume: keywordList.minVolume,
    country: keywordList.country,
  });

  console.error(
    `${filtered.length} keywords passed filters (KD < ${keywordList.maxDifficulty}, volume >= ${keywordList.minVolume})`,
  );

  const seen = new Set();
  const candidates = [];

  for (const row of filtered) {
    const keyword = row.keyword.trim();
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    if (shouldSkipKeyword(keyword, skipPatterns)) continue;

    const duplicateOf = findDuplicateMatch(keyword, indexedKeywords);
    if (duplicateOf) {
      console.error(`Skipping duplicate of "${duplicateOf}": ${keyword}`);
      continue;
    }

    candidates.push({
      keyword,
      volume: row.volume ?? 0,
      difficulty: row.difficulty ?? null,
      trafficPotential: row.trafficPotential ?? null,
      intents: row.intents ?? null,
      parentKeyword: row.parentKeyword ?? null,
      category: row.category ?? null,
      source: "keyword-list-csv",
    });
  }

  candidates.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));

  if (!candidates.length) {
    const result = {
      status: "no_candidates",
      date: today,
      message: "No new keywords passed CSV filters and deduplication.",
      keywordList: csvPath,
      filters: {
        maxDifficulty: keywordList.maxDifficulty,
        minVolume: keywordList.minVolume,
        country: keywordList.country,
      },
      totalRows,
      filteredRows: filtered.length,
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
    keywordList: {
      path: keywordList.path,
      note: keywordList.note ?? null,
    },
    filters: {
      maxDifficulty: keywordList.maxDifficulty,
      minVolume: keywordList.minVolume,
      country: keywordList.country,
    },
    keyword: {
      primary: pick.keyword,
      volume: pick.volume,
      difficulty: pick.difficulty,
      trafficPotential: pick.trafficPotential,
      intents: pick.intents,
      parentKeyword: pick.parentKeyword,
      source: pick.source,
    },
    article: {
      id: meta.id,
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
        keywordList: keywordList.path,
      },
      null,
      2,
    ),
  );
}

main();
