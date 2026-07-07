# Meowopedia Architecture

Production encyclopedia architecture for 10,000+ pages. Not a blog.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Content | MDX + YAML frontmatter |
| Rendering | SSG + ISR (24h revalidate) |
| Search | Fuse.js (build-time index) |
| UI | Radix + shadcn-style components |
| SEO | Dynamic metadata + JSON-LD |

## Folder Structure

```
meowopedia.com/
├── content/                    # MDX encyclopedia articles
│   ├── breeds/
│   ├── diseases/
│   ├── foods/
│   ├── plants/
│   ├── behavior/
│   ├── symptoms/
│   ├── nutrition/
│   ├── care/
│   ├── guides/
│   └── wild-cats/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── [category]/         # Category pillar pages
│   │   ├── breeds/[slug]/      # Breed article pages
│   │   ├── diseases/[slug]/
│   │   ├── foods/[slug]/
│   │   ├── plants/[slug]/
│   │   ├── behavior/[slug]/
│   │   ├── search/
│   │   ├── api/search/
│   │   ├── api/revalidate/
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                 # Primitives (Button, Card, Input…)
│   │   ├── encyclopedia/       # QuickFacts, RelatedGrid, FAQ…
│   │   ├── layouts/            # Article shells + sidebars
│   │   ├── mdx/                # MDX component mapping
│   │   └── navigation/         # Header, search, footer
│   ├── config/
│   │   ├── site.ts             # Site constants
│   │   └── taxonomy.ts         # Categories, entity types, routes
│   ├── lib/
│   │   ├── content/            # Loader, validators, categories
│   │   ├── knowledge-graph/    # Relationships + internal linking
│   │   ├── search/             # Fuse index + synonyms
│   │   ├── seo/                # Metadata + JSON-LD
│   │   └── routing/            # Entity route factory
│   └── types/
│       └── content.ts          # Content model types
```

## URL Architecture

Articles never live under `/blog/`. Category pillars and entity routes are separated:

| Pattern | Example | Purpose |
|---------|---------|---------|
| `/[category]` | `/breeds`, `/health` | Pillar pages with filters |
| `/breeds/[slug]` | `/breeds/persian-cat` | Breed encyclopedia entry |
| `/diseases/[slug]` | `/diseases/chronic-kidney-disease` | Disease entry |
| `/foods/[slug]` | `/foods/chocolate` | Food safety entry |
| `/plants/[slug]` | `/plants/lily` | Plant toxicity entry |
| `/behavior/[slug]` | `/behavior/kneading` | Behavior entry |
| `/search` | `/search?q=ckd` | Full search results |

Add new entity types by:
1. Registering in `config/taxonomy.ts` → `ENTITY_ROUTES`
2. Creating `content/{dir}/` for MDX files
3. Adding `app/{prefix}/[slug]/page.tsx` via `createEntityRouteHandlers`

## Content Model

Every article MDX file includes validated frontmatter:

```yaml
id: unique-id                    # Graph node ID
title: Display Title
slug: url-slug
category: breeds                 # CategorySlug
entityType: breed                # EntityType
aliases: []                      # Search aliases
summary: SEO description (20+ chars)
relationships: []                # Typed graph edges
relatedBreeds: []                # Shorthand ID refs
relatedDiseases: []
relatedFoods: []
relatedPlants: []
data: {}                         # Entity-specific structured fields
faq: []
citations: []
lastReviewed: ISO date
difficulty: beginner|intermediate|advanced|expert
```

Validation runs at build time via Zod (`lib/content/validators.ts`).

## Knowledge Graph

### Relationship Types

`parent`, `child`, `sibling`, `related`, `compared`, `treats`, `causes`, `symptom-of`, `breed-predisposition`, `alternative`, `see-also`, `prerequisite`, `next-reading`

### Automatic Internal Linking

`lib/knowledge-graph/linking.ts` generates sections on every article:

- Related Topics
- Frequently Compared
- Child Topics / Explore Further
- Similar Articles (siblings)
- Next Reading
- Start Here (prerequisites)
- Parent Topic
- More in This Category
- Beginner / Advanced Guides
- You Might Also Like
- Recently Updated

### Graph API

`getKnowledgeGraphForArticle(id)` returns `{ nodes, edges }` for visualization components.

## Page Type Layouts

Each entity type maps to a unique layout + sidebar:

| Entity Type | Layout | Sidebar |
|-------------|--------|---------|
| breed | Breed (hero traits) | Breed facts, temperament |
| disease | Disease | Severity, body system, emergency |
| food | Food | Can cats eat it? badge |
| plant | Plant | Poison level |
| behavior | Behavior | Urgency, triggers |
| default | Standard | Category meta |

Extend by adding sidebar in `components/layouts/sidebars/` and registering in `encyclopedia-article-page.tsx`.

## SEO

### Metadata (`lib/seo/metadata.ts`)

- Title templates
- OpenGraph + Twitter cards
- Canonical URLs
- Article timestamps

### JSON-LD (`lib/seo/json-ld.tsx`)

- Organization
- WebSite + SearchAction
- BreadcrumbList
- Article / MedicalWebPage / DefinedTerm
- FAQPage
- HowTo
- CollectionPage (category pillars)
- ImageObject

## Search

- **Index**: Fuse.js built from all articles at runtime
- **API**: `GET /api/search?q=persian&limit=12`
- **Synonyms**: 200+ feline terms in `lib/search/synonyms.ts`
- **Misspellings**: Common typo corrections
- **Aliases**: From article frontmatter

## ISR & Scale

- `revalidate = 86400` (24 hours) on all content routes
- `generateStaticParams` pre-builds all known slugs
- On-demand revalidation: `POST /api/revalidate` with `x-revalidate-secret`
- Content cache invalidation in loader + search index

### Scaling to 10,000+ Pages

1. **Content**: Add MDX files — no code changes required
2. **Build**: Consider incremental builds + route groups
3. **Search**: Migrate Fuse index to Pagefind or Algolia at ~5k pages
4. **Images**: Use CDN + `next/image` with remote patterns
5. **Graph**: Optional SQLite/Postgres for relationship queries at scale

## Adding a New Article

1. Create `content/{entityDir}/{slug}.mdx`
2. Fill frontmatter with valid `id`, `entityType`, relationships
3. Reference other articles by `id` in relationship fields
4. Run `npm run build` — validation runs automatically

## Scripts

```bash
npm run dev      # Development
npm run build    # Production build + static generation
npm run start    # Production server
npm run lint     # ESLint
```

## Environment Variables

```env
NEXT_PUBLIC_SITE_URL=https://meowopedia.com
REVALIDATE_SECRET=your-secret-for-on-demand-isr
```
