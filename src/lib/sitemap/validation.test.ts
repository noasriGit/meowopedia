import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAllSitemapEntries, getXmlSitemapEntries } from "@/lib/sitemap/entries";
import { buildSitemapPageData } from "@/lib/sitemap/registry";
import { validateSitemapEntries } from "@/lib/sitemap/validation";

describe("sitemap entries", () => {
  it("returns indexable entries with required fields", () => {
    const entries = getAllSitemapEntries();
    assert.ok(entries.length > 0);

    for (const entry of entries) {
      assert.ok(entry.id, `Missing id for ${entry.title}`);
      assert.ok(entry.title.trim(), `Missing title for ${entry.id}`);
      assert.ok(entry.url.startsWith("/"), `Invalid url for ${entry.id}: ${entry.url}`);
      assert.ok(!entry.url.includes("?"), `Query string in url for ${entry.id}`);
    }
  });

  it("excludes noindex articles", () => {
    const entries = getAllSitemapEntries();
    const articleUrls = new Set(
      entries.filter((entry) => entry.contentType === "article").map((entry) => entry.url)
    );

    assert.ok(articleUrls.size > 0);
    assert.equal(validateSitemapEntries().stats.excluded.noindex, 0);
  });

  it("does not include redirect source URLs", () => {
    const entries = getAllSitemapEntries();
    const urls = entries.map((entry) => entry.url);

    assert.ok(!urls.includes("/behavior/kneading"));
    assert.ok(!urls.includes("/facts/are-cats-social"));
    assert.ok(!urls.includes("/diseases/cat-allergies"));
    assert.ok(!urls.includes("/diseases/strep-in-cats"));
  });

  it("has no duplicate URLs", () => {
    const entries = getAllSitemapEntries();
    const urls = entries.map((entry) => entry.url);
    assert.equal(new Set(urls).size, urls.length);
  });

  it("keeps XML sitemap scope aligned with prior behavior", () => {
    const xmlEntries = getXmlSitemapEntries();
    const urls = xmlEntries.map((entry) => entry.url);

    assert.ok(urls.includes("/"));
    assert.ok(urls.includes("/search"));
    assert.ok(urls.includes("/breeds"));
    assert.ok(urls.includes("/about"));
    assert.equal(xmlEntries.filter((entry) => entry.contentType === "article").length, 97);
    assert.equal(xmlEntries.filter((entry) => entry.contentType === "category").length, 19);
    assert.equal(xmlEntries.filter((entry) => entry.contentType === "static").length, 7);
    assert.ok(urls.includes("/sitemap"));
  });
});

describe("sitemap page data", () => {
  it("builds category groups only for categories with articles", () => {
    const data = buildSitemapPageData();
    assert.ok(data.categories.length > 0);

    for (const group of data.categories) {
      assert.ok(group.entries.length > 0, `${group.slug} should not be empty`);
    }

    const emptyCategorySlugs = ["training", "history", "wild-cats", "calculators", "checklists", "resources"];
    for (const slug of emptyCategorySlugs) {
      assert.ok(
        !data.categories.some((group) => group.slug === slug),
        `${slug} should be omitted from HTML category sections`
      );
    }
  });

  it("includes featured pages from primary navigation categories", () => {
    const data = buildSitemapPageData();
    const featuredUrls = data.featured.map((entry) => entry.url);

    assert.ok(featuredUrls.includes("/"));
    assert.ok(featuredUrls.includes("/breeds"));
    assert.ok(featuredUrls.includes("/health"));
    assert.ok(featuredUrls.includes("/behavior"));
  });

  it("includes a recent section when publication dates exist", () => {
    const data = buildSitemapPageData();
    assert.ok(data.recent.length > 0);
    assert.ok(data.recent.length <= 15);
  });

  it("lists all configured tool pages including empty hubs", () => {
    const data = buildSitemapPageData();
    const toolUrls = data.tools.map((entry) => entry.url);

    assert.ok(toolUrls.includes("/search"));
    assert.ok(toolUrls.includes("/compare"));
    assert.ok(toolUrls.includes("/calculators"));
    assert.ok(toolUrls.includes("/checklists"));
    assert.equal(data.tools.length, 4);
  });

  it("builds a non-empty alphabetical index", () => {
    const data = buildSitemapPageData();
    const letters = Object.keys(data.alphabetical);
    assert.ok(letters.length > 0);

    const indexedCount = Object.values(data.alphabetical).flat().length;
    assert.equal(indexedCount, data.categories.flatMap((group) => group.entries).length);
  });
});

describe("sitemap validation", () => {
  it("passes validation for the current content set", () => {
    const result = validateSitemapEntries();
    assert.equal(result.valid, true, result.issues.map((issue) => issue.message).join("\n"));
    assert.ok(result.stats.total > 0);
  });
});
