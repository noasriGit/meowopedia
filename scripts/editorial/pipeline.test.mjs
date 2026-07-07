import test from "node:test";
import assert from "node:assert/strict";
import { isDuplicateKeyword, normalizeKeyword } from "./normalize-keyword.mjs";
import { isDraftDue, randomDraftAt, zonedTimeToUtcMs } from "./draft-window.mjs";

test("normalizeKeyword collapses punctuation and casing", () => {
  assert.equal(normalizeKeyword("Why Do Cats Knead?"), "why do cats knead");
});

test("isDuplicateKeyword catches exact and near duplicates", () => {
  const existing = ["why do cats knead", "can cats eat eggs"];
  assert.equal(isDuplicateKeyword("why do cats knead", existing), true);
  assert.equal(isDuplicateKeyword("why do cats knead on me", existing), true);
  assert.equal(isDuplicateKeyword("can cats eat blueberries", existing), false);
});

test("zonedTimeToUtcMs converts America/New_York wall time", () => {
  const ms = zonedTimeToUtcMs("2026-07-08", 14, 30, "America/New_York");
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).format(new Date(ms));
  assert.equal(formatted, "14:30");
});

test("isDraftDue respects draftAtEpochMs", () => {
  const queue = {
    keyword: { primary: "why do cats chirp" },
    drafted: false,
    draftAtEpochMs: Date.now() - 1000,
  };
  assert.equal(isDraftDue(queue), true);
});

test("randomDraftAt stays inside configured window", () => {
  const result = randomDraftAt({
    date: "2026-07-08",
    startHour: 10,
    endHour: 18,
    timezone: "America/New_York",
  });
  const hour = Number(result.draftAt.split("T")[1].slice(0, 2));
  assert.ok(hour >= 10 && hour < 18);
});
