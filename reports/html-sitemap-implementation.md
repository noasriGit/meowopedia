# HTML Sitemap Implementation Report

## 1. Preflight findings

| Area | Finding |
|------|---------|
| Framework | Next.js 16.2.10 (App Router), React 19, TypeScript |
| Routing | App Router with dynamic `[category]` pillars and 13 entity `[slug]` routes |
| XML sitemap | `src/app/sitemap.ts` → `/sitemap.xml` (124 URLs before this change) |
| HTML sitemap | **Did not exist** before this implementation |
| Content sources | Filesystem MDX via `loader.ts`, `taxonomy.ts`, `static-pages.ts` |
| CMS | None — all content is build-time MDX |
| robots.txt | Dynamic via `src/app/robots.ts`, references `/sitemap.xml` |
| Trailing slashes | Default Next.js (no trailing slash) |
| Indexability | Global index; per-article `noindex` supported (0 articles use it) |
| Redirects | 4 permanent redirects in `next.config.ts` |

### How indexable pages are defined

Indexable pages are derived from:

1. **Homepage** — `src/app/page.tsx`
2. **Category pillars** — all 19 slugs in `src/config/taxonomy.ts`
3. **Articles** — MDX files under `content/` loaded by `src/lib/content/loader.ts`, excluding `noindex` articles
4. **Static pages** — MDX in `content/pages/` via `src/lib/content/static-pages.ts`
5. **Tool pages** — search, compare, calculators, checklists (configured in `src/config/sitemap.ts`)

### XML sitemap conflicts

No route conflict: `/sitemap.xml` (XML metadata route) and `/sitemap` (HTML page) coexist correctly in Next.js App Router.

---

## 2. Existing content sources used

| Source | Path | Used for |
|--------|------|----------|
| Article loader | `src/lib/content/loader.ts` | Article URLs, titles, summaries, dates, noindex |
| Taxonomy | `src/config/taxonomy.ts` | Category titles, descriptions, slugs |
| Category helpers | `src/lib/content/categories.ts` | Category slug enumeration |
| Static pages | `src/lib/content/static-pages.ts` | About, legal, accessibility pages |
| Static page nav | `src/config/static-pages.ts` | Static page paths |
| Sitemap config | `src/config/sitemap.ts` | Featured categories, tools, redirect exclusions |
| Redirect config | `next.config.ts` | Redirect source exclusion list |

---

## 3. Sitemap architecture implemented

```
src/lib/sitemap/
├── types.ts          # Typed SitemapEntry, SitemapPageData, validation types
├── entries.ts        # getAllSitemapEntries(), getXmlSitemapEntries()
├── registry.ts       # buildSitemapPageData() — grouping for HTML display
└── validation.ts     # validateSitemapEntries()

src/app/sitemap/page.tsx          # HTML sitemap at /sitemap
src/components/sitemap/           # Reusable section components
src/app/sitemap.ts                # XML sitemap (refactored to use shared registry)
```

Both XML and HTML sitemaps read from the same `getAllSitemapEntries()` source of truth.

---

## 4. Included content types

| Content type | Count in registry | On HTML sitemap |
|--------------|-------------------|-----------------|
| Homepage | 1 | Featured section |
| Category pillars | 19 | 13 with articles in Categories; 2 empty hubs in Tools |
| Encyclopedia articles | 97 | Categories + A–Z + Recently published |
| Static pages | 6 | About & legal section |
| Tool pages | 4 | Tools section |

**Total indexable pages in registry:** 124  
**XML sitemap URLs:** 125 (includes `/sitemap` HTML page)

---

## 5. Exclusion rules

| Rule | Implementation |
|------|----------------|
| `noindex` articles | Filtered in `buildArticleEntry()` |
| Redirect sources | Excluded via `SITEMAP_REDIRECT_SOURCES` |
| API routes | Not in content loaders |
| Duplicate URLs | Deduplicated in `getAllSitemapEntries()` |
| Query-string URLs | Validation rejects URLs with `?` |
| Empty categories | Omitted from HTML category sections (6 empty pillars) |
| Search-result pages | Only `/search` base path included, not `?q=` variants |

### Excluded from HTML category sections (empty pillars)

- `training` (0 articles)
- `history` (0 articles)
- `wild-cats` (0 articles)
- `resources` (0 articles)

`calculators` and `checklists` (also empty) are linked via the **Tools** section because they are intentional discovery hubs.

---

## 6. Category and pagination decisions

- **13 category sections** rendered on the main HTML sitemap (categories with ≥1 article)
- **No pagination** — largest category (behavior) has 20 articles; well under the 50–100 threshold
- **No category subpages** — not justified at current scale (~97 articles total)

---

## 7. Recently published logic

- Uses `publishedAt` from article frontmatter when available
- Falls back to `updatedAt` / `lastReviewed` only for the 3 articles missing `publishedAt`
- Sorted descending by date
- Limited to **15 entries** (`SITEMAP_RECENT_LIMIT`)
- 94 of 97 articles have `publishedAt` in frontmatter

---

## 8. Featured-content logic

Featured pages are derived from structural importance, not analytics:

- Homepage (`featured: true`)
- 7 primary navigation categories from `FEATURED_CATEGORY_SLUGS`: breeds, health, behavior, nutrition, foods, plants, guides

Label used: **"Featured pages"** (not "Popular").

---

## 9. A–Z logic

- All 97 encyclopedia articles indexed alphabetically by title
- Leading articles ("A", "An", "The") stripped for letter grouping
- **11 letter groups** populated (A, B, C, …)
- Jump links provided for each populated letter
- Empty letters omitted

---

## 10. Search implementation

**Not implemented.** The site has ~120 unique indexable pages — below the threshold where client-side sitemap search would improve discovery. All links are server-rendered in HTML.

---

## 11. SEO and structured-data implementation

| Element | Implementation |
|---------|----------------|
| Title | "Sitemap \| Meowopedia" via `buildMetadata()` |
| Meta description | Unique, 110–160 char normalized description |
| Canonical | Self-referencing `/sitemap` |
| Open Graph / Twitter | Via shared `buildMetadata()` |
| H1 | "Sitemap" |
| Section hierarchy | H2 sections, H3 for categories and A–Z letters |
| Breadcrumbs | Visual + `BreadcrumbList` JSON-LD |
| Structured data | `WebSite`, `BreadcrumbList`, `CollectionPage` with `ItemList` |
| Rendering | SSG with 24h ISR (`revalidate = 86400`) |
| Footer link | Added under Tools in `SiteFooter` |

---

## 12. Accessibility and responsive results

- Semantic `<section>`, `<nav>`, and `<ul>` landmarks
- A–Z jump links with visible focus rings (`focus-visible:ring-2`)
- Minimum 36px touch targets on letter jump links
- Responsive grid for category sections (`lg:grid-cols-2`)
- Breadcrumb navigation with `aria-current="page"`
- Dark mode compatible via existing Tailwind design tokens
- No client-side JavaScript on the sitemap page

---

## 13. Performance considerations

- Fully server-rendered static page (no client components)
- Content loaded at build time from cached loaders
- Compact entry objects (title, url, description, dates only)
- No search index shipped to browser
- ISR revalidation every 24 hours aligned with site-wide content strategy

---

## 14. Validation results

### Automated tests (`src/lib/sitemap/validation.test.ts`)

| Test | Result |
|------|--------|
| Required fields on all entries | Pass |
| noindex exclusion | Pass |
| Redirect source exclusion | Pass |
| No duplicate URLs | Pass |
| XML scope alignment | Pass |
| Empty category omission | Pass |
| Featured pages present | Pass |
| Recent section populated | Pass |
| Tool pages complete | Pass |
| A–Z index complete | Pass |
| Full validation suite | Pass |

### Build and lint

| Command | Result |
|---------|--------|
| `npm test` | 24 tests pass |
| `npm run build` | Success — `/sitemap` statically generated |
| `npm run lint` | Pre-existing warnings/errors in unrelated files; no new errors in sitemap files |

---

## 15. Exact files changed

### Created

- `src/lib/sitemap/types.ts`
- `src/lib/sitemap/entries.ts`
- `src/lib/sitemap/registry.ts`
- `src/lib/sitemap/validation.ts`
- `src/lib/sitemap/validation.test.ts`
- `src/config/sitemap.ts`
- `src/app/sitemap/page.tsx`
- `src/components/sitemap/sitemap-sections.tsx`
- `reports/html-sitemap-implementation.md`

### Modified

- `src/app/sitemap.ts` — refactored to use shared registry
- `src/components/navigation/site-header.tsx` — footer sitemap link
- `package.json` — added sitemap tests to `npm test`

---

## 16. Known limitations

1. **Empty pillar categories** (`training`, `history`, `wild-cats`, `resources`) are excluded from HTML category sections until articles are published; they remain in the XML sitemap as routable pillar pages.
2. **3 articles** lack `publishedAt` and use `updatedAt` for the recent section.
3. **XML sitemap** still includes all 19 category pillars (including empty ones) to preserve prior behavior; only `noindex` filtering was added.
4. **No runtime URL health checks** — redirect and 404 validation is structural, not HTTP-based (would require a running server).
5. **Category `lastModified` in XML** still uses article `updatedAt` when available; category-level max-date logic deferred to future scaling work.
6. **`/image-audit.html`** in `public/` remains crawlable but is outside the sitemap system (pre-existing).
