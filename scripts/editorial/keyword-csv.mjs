import fs from "node:fs";
import path from "node:path";
import { getRoot } from "./env.mjs";

const HEADER_ALIASES = {
  keyword: "keyword",
  country: "country",
  difficulty: "difficulty",
  volume: "volume",
  cpc: "cpc",
  cps: "cps",
  "parent keyword": "parentKeyword",
  "last update": "lastUpdate",
  "serp features": "serpFeatures",
  "global volume": "globalVolume",
  "traffic potential": "trafficPotential",
  "global traffic potential": "globalTrafficPotential",
  "first seen": "firstSeen",
  intents: "intents",
  languages: "languages",
  category: "category",
};

function parseRow(line) {
  return line.split("\t").map((cell) => cell.replace(/^"|"$/g, "").trim());
}

function normalizeHeader(value) {
  return value.replace(/^"|"$/g, "").trim().toLowerCase();
}

function toInt(value) {
  if (value == null || value === "") return null;
  const parsed = Number.parseInt(String(value).replace(/,/g, ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function toFloat(value) {
  if (value == null || value === "") return null;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Parse an Ahrefs keyword list CSV export (tab-separated, quoted fields).
 */
export function parseKeywordCsv(content) {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];

  const rawHeader = parseRow(lines[0]);
  const fieldKeys = rawHeader.map((header) => HEADER_ALIASES[normalizeHeader(header)] ?? null);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (!values.length) continue;

    const record = {};
    for (let col = 0; col < fieldKeys.length; col++) {
      const key = fieldKeys[col];
      if (!key) continue;
      record[key] = values[col] ?? "";
    }

    const keyword = record.keyword?.trim();
    if (!keyword) continue;

    rows.push({
      keyword,
      country: record.country ?? null,
      difficulty: toInt(record.difficulty),
      volume: toInt(record.volume),
      cpc: toFloat(record.cpc),
      cps: toFloat(record.cps),
      parentKeyword: record.parentKeyword ?? null,
      trafficPotential: toInt(record.trafficPotential),
      globalVolume: toInt(record.globalVolume),
      intents: record.intents ?? null,
      category: record.category ?? null,
      serpFeatures: record.serpFeatures ?? null,
    });
  }

  return rows;
}

export function loadKeywordCsv(csvPath) {
  const absolutePath = path.isAbsolute(csvPath) ? csvPath : path.join(getRoot(), csvPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Keyword CSV not found: ${absolutePath}`);
  }

  const buffer = fs.readFileSync(absolutePath);
  let content;

  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xfe) {
    content = buffer.toString("utf16le");
  } else if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    content = buffer.toString("utf8").slice(1);
  } else {
    content = buffer.toString("utf8");
  }

  const rows = parseKeywordCsv(content);
  return { path: absolutePath, rows, totalRows: rows.length };
}

export function filterKeywordRows(rows, { maxDifficulty = 20, minVolume = 0, country = "us" } = {}) {
  return rows.filter((row) => {
    if (country && row.country && row.country.toLowerCase() !== country.toLowerCase()) {
      return false;
    }
    if (row.difficulty != null && row.difficulty >= maxDifficulty) return false;
    if (minVolume > 0 && (row.volume ?? 0) < minVolume) return false;
    return true;
  });
}
