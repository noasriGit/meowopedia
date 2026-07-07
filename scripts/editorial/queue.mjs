import fs from "node:fs";
import { PATHS } from "./paths.mjs";

export function loadPipelineConfig() {
  const raw = fs.readFileSync(PATHS.pipelineConfig, "utf8");
  return JSON.parse(raw);
}

export function loadDailyQueue() {
  if (!fs.existsSync(PATHS.dailyQueue)) return null;
  const raw = fs.readFileSync(PATHS.dailyQueue, "utf8");
  return JSON.parse(raw);
}

export function saveDailyQueue(queue) {
  fs.writeFileSync(PATHS.dailyQueue, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
}

export function shouldSkipKeyword(keyword, skipPatterns = []) {
  const normalized = keyword.toLowerCase();
  return skipPatterns.some((pattern) => normalized.includes(pattern.toLowerCase()));
}

export function pickSeedForToday(seeds, date) {
  if (!seeds.length) return "cat";
  const hash = [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return seeds[hash % seeds.length];
}
