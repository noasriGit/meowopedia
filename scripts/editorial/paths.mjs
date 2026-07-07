import path from "node:path";
import { getRoot } from "./env.mjs";

const ROOT = getRoot();

export const PATHS = {
  root: ROOT,
  contentIndex: path.join(ROOT, "editorial", "content-index.json"),
  dailyQueue: path.join(ROOT, "editorial", "daily-queue.json"),
  pipelineConfig: path.join(ROOT, "editorial", "pipeline-config.json"),
  editorialBrief: path.join(ROOT, "editorial", "EDITORIAL_BRIEF.md"),
  goldStandardArticle: path.join(ROOT, "content", "behavior", "making-biscuits.mdx"),
  contentRoot: path.join(ROOT, "content"),
};
