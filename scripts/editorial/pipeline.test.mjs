import test from "node:test";
import assert from "node:assert/strict";
import {
  coreSignature,
  isDuplicateKeyword,
  normalizeKeyword,
} from "./normalize-keyword.mjs";
import { filterKeywordRows, parseKeywordCsv } from "./keyword-csv.mjs";
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

test("isDuplicateKeyword catches my cat vs cats phrasing", () => {
  const existing = ["why do cats bite you"];
  assert.equal(isDuplicateKeyword("why does my cat bite me", existing), true);
  assert.equal(isDuplicateKeyword("why do cats bite their owners", existing), true);
  assert.equal(isDuplicateKeyword("do cats bite", existing), true);
});

test("isDuplicateKeyword catches lick variant phrasing", () => {
  const existing = ["why do cats lick you"];
  assert.equal(
    isDuplicateKeyword("what does it mean when a cat licks you", existing),
    true,
  );
});

test("isDuplicateKeyword catches pregnancy phrasing variants", () => {
  const existing = ["how long are cats pregnant"];
  assert.equal(isDuplicateKeyword("how long is a cat pregnant", existing), true);
});

test("isDuplicateKeyword does not false-positive different foods", () => {
  const existing = ["can cats eat eggs"];
  assert.equal(isDuplicateKeyword("can cats eat blueberries", existing), false);
  assert.equal(isDuplicateKeyword("can cats eat strawberries", existing), false);
});

test("isDuplicateKeyword does not confuse predators with food queries", () => {
  const existing = ["can cats eat eggs"];
  assert.equal(isDuplicateKeyword("what eats cats", existing), false);
});

test("isDuplicateKeyword catches vomiting phrasing variants", () => {
  const existing = ["why do cats throw up"];
  assert.equal(isDuplicateKeyword("why is my cat vomiting", existing), true);
  assert.equal(isDuplicateKeyword("why is my cat throwing up food", existing), true);
});

test("isDuplicateKeyword does not merge cross-subject allergy queries", () => {
  const existing = ["what are cats allergic to"];
  assert.equal(isDuplicateKeyword("can dogs be allergic to cats", existing), false);
});

test("isDuplicateKeyword does not merge human worm queries with cat worms", () => {
  const existing = ["how do cats get worms"];
  assert.equal(isDuplicateKeyword("can humans get worms from cats", existing), false);
});

test("coreSignature normalizes cat entity forms", () => {
  assert.equal(coreSignature("why does my cat bite me"), "bite");
  assert.equal(coreSignature("why do cats bite you"), "bite");
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

test("parseKeywordCsv reads Ahrefs tab-separated export", () => {
  const sample = `"#"\t"Keyword"\t"Country"\t"Difficulty"\t"Volume"\t"Traffic potential"\t"Intents"
"1"\t"can cats taste spicy"\t"us"\t"0"\t"3500"\t"1400"\t"Informational,Non-branded"
"2"\t"why do cats sneeze"\t"us"\t"1"\t"2400"\t"12000"\t"Informational"`;

  const rows = parseKeywordCsv(sample);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].keyword, "can cats taste spicy");
  assert.equal(rows[0].difficulty, 0);
  assert.equal(rows[0].volume, 3500);
});

test("filterKeywordRows applies difficulty and volume filters", () => {
  const rows = [
    { keyword: "low volume", country: "us", difficulty: 1, volume: 100 },
    { keyword: "good pick", country: "us", difficulty: 5, volume: 2000 },
    { keyword: "too hard", country: "us", difficulty: 25, volume: 5000 },
  ];

  const filtered = filterKeywordRows(rows, { maxDifficulty: 20, minVolume: 500, country: "us" });
  assert.deepEqual(filtered.map((row) => row.keyword), ["good pick"]);
});
