#!/usr/bin/env node
/**
 * Source and audit a featured image for one article (daily draft pipeline).
 *
 * Usage:
 *   npm run prepare-article-image -- --id food-eggs
 *   npm run prepare-article-image -- --id food-eggs --max-attempts 3
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function runNode(script, args) {
  const result = spawnSync(process.execPath, [path.join(ROOT, "scripts", script), ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result.status ?? 1;
}

function main() {
  const id = readArg("--id");
  const maxAttempts = Number(readArg("--max-attempts") ?? "3");

  if (!id) {
    console.error("Usage: npm run prepare-article-image -- --id <article-id> [--max-attempts 3]");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    console.log(`\n[prepare-article-image] attempt ${attempt}/${maxAttempts} for ${id}`);

    const sourceArgs = ["--id", id];
    if (attempt > 1) sourceArgs.push("--force");

    const sourceStatus = runNode("source-article-images.mjs", sourceArgs);
    if (sourceStatus !== 0) {
      console.error(`Image sourcing failed for ${id}`);
      process.exit(sourceStatus);
    }

    const checkStatus = runNode("check-article-image.mjs", ["--id", id, "--json"]);
    if (checkStatus === 0) {
      console.log(`\nImage audit passed for ${id}`);
      return;
    }

    console.warn(`Image audit flagged ${id} on attempt ${attempt}`);
  }

  console.error(
    `\nImage audit still failing for ${id} after ${maxAttempts} attempts. ` +
      "Manually pick a Wikimedia/Openverse image with a cat (foods/behavior/health) " +
      "and topic terms in featuredImageAlt, then re-run check-article-image.",
  );
  process.exit(1);
}

main();
