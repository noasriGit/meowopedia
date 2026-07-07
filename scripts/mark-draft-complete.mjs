#!/usr/bin/env node
/**
 * Mark today's daily queue entry as drafted after article creation.
 *
 * Usage:
 *   npm run mark-draft-complete -- --pr-url https://github.com/...
 *   npm run mark-draft-complete -- --content-path content/behavior/example.mdx
 */

import { loadContentIndex, markArticleDraftedInIndex, saveContentIndex } from "./editorial/content-index.mjs";
import { loadDailyQueue, saveDailyQueue } from "./editorial/queue.mjs";

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function main() {
  const queue = loadDailyQueue();
  if (!queue?.keyword) {
    console.error("No daily queue found.");
    process.exit(1);
  }

  const prUrl = readArg("--pr-url");
  const contentPath = readArg("--content-path");

  queue.drafted = true;
  queue.draftedAt = new Date().toISOString();
  queue.status = "drafted";
  if (prUrl) queue.prUrl = prUrl;
  if (contentPath) queue.article.contentPath = contentPath;

  saveDailyQueue(queue);

  if (queue.article?.id) {
    const index = loadContentIndex();
    const category = queue.article.category;
    const slug = queue.article.slug;
    const url = category && slug ? `/${category}/${slug}` : null;
    markArticleDraftedInIndex(index, queue.article.id, { url, slug });
    saveContentIndex(index);
  }

  console.log(
    JSON.stringify(
      {
        status: "marked_drafted",
        articleId: queue.article?.id,
        draftedAt: queue.draftedAt,
        prUrl: queue.prUrl ?? null,
      },
      null,
      2,
    ),
  );
}

main();
