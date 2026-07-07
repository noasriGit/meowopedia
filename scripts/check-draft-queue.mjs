#!/usr/bin/env node
/**
 * Check whether today's queued keyword is ready for article drafting.
 *
 * Usage:
 *   npm run check-draft-queue
 *   npm run check-draft-queue -- --json
 *
 * Exit codes:
 *   0 — ready to draft (prints context JSON)
 *   1 — not ready yet or nothing queued
 *   2 — queue exists but keyword already drafted
 */

import fs from "node:fs";
import { PATHS } from "./editorial/paths.mjs";
import { isDraftDue, todayInTimezone } from "./editorial/draft-window.mjs";
import { titleFromKeyword } from "./editorial/infer-category.mjs";
import { loadDailyQueue, loadPipelineConfig } from "./editorial/queue.mjs";

const jsonOnly = process.argv.includes("--json");

function fail(message, payload = {}) {
  const output = { ready: false, reason: message, ...payload };
  if (jsonOnly) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.error(message);
  }
  process.exit(1);
}

function main() {
  const config = loadPipelineConfig();
  const today = todayInTimezone(config.draftWindow.timezone);
  const queue = loadDailyQueue();

  if (!queue?.keyword) {
    fail("No keyword queued. Run npm run discover-keywords first.");
  }

  if (queue.drafted) {
    const output = {
      ready: false,
      reason: "already_drafted",
      queue,
    };
    console.log(JSON.stringify(output, null, 2));
    process.exit(2);
  }

  if (queue.date !== today) {
    fail(`Queue is for ${queue.date}, today is ${today}. Run discover-keywords for today.`, {
      queueDate: queue.date,
      today,
    });
  }

  if (!isDraftDue(queue)) {
    fail(`Draft not due yet. Scheduled for ${queue.draftAtIso}.`, {
      draftAtIso: queue.draftAtIso,
      now: new Date().toISOString(),
    });
  }

  const brief = fs.existsSync(PATHS.editorialBrief)
    ? fs.readFileSync(PATHS.editorialBrief, "utf8")
    : null;
  const goldStandard = fs.existsSync(PATHS.goldStandardArticle)
    ? fs.readFileSync(PATHS.goldStandardArticle, "utf8")
    : null;

  const context = {
    ready: true,
    queue,
    draftInstructions: {
      primaryKeyword: queue.keyword.primary,
      title: titleFromKeyword(queue.keyword.primary),
      articleId: queue.article.id,
      slug: queue.article.slug,
      category: queue.article.category,
      entityType: queue.article.entityType,
      contentPath: queue.article.contentPath,
      searchIntent: queue.article.searchIntent,
      editorialBriefPath: "editorial/EDITORIAL_BRIEF.md",
      goldStandardPath: "content/behavior/making-biscuits.mdx",
      volume: queue.keyword.volume,
      difficulty: queue.keyword.difficulty,
    },
    files: {
      editorialBrief: brief,
      goldStandardExcerpt: goldStandard?.slice(0, 4000) ?? null,
    },
  };

  console.log(JSON.stringify(context, null, 2));
}

main();
